
'use server';

import { z } from 'zod';
import { auth, db, storage } from '@/lib/firebase';
import { addDoc, collection, doc, serverTimestamp, updateDoc, GeoPoint, getDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { revalidatePath } from 'next/cache';
import { categorizeComplaint } from '@/ai/flows/categorize-complaint-with-ai';
import { summarizeComplaint as summarizeComplaintFlow } from '@/ai/flows/summarize-complaint';
import type { Complaint, ComplaintCategory, ComplaintStatus, UserProfile } from './types';

const ComplaintFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long.'),
  description: z.string().min(10, 'Description must be at least 10 characters long.'),
  location: z.object({ lat: z.number(), lng: z.number() }),
  locationAddress: z.string().min(5, 'Location address is required.'),
  imageBase64: z.string().optional(),
  userId: z.string(),
});

export type ComplaintFormState = {
  errors?: {
    title?: string[];
    description?: string[];
    location?: string[];
    locationAddress?: string[];
    imageBase64?: string[];
  };
  message?: string | null;
} | undefined;


export async function createComplaint(prevState: ComplaintFormState, formData: FormData): Promise<ComplaintFormState> {
  const user = auth.currentUser;
  if (!user) {
    return { message: 'Authentication Error: You must be logged in to create a complaint.' };
  }

  const validatedFields = ComplaintFormSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    location: JSON.parse(formData.get('location') as string),
    locationAddress: formData.get('locationAddress'),
    imageBase64: formData.get('imageBase64'),
    userId: user.uid,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to create complaint. Please check the fields.',
    };
  }

  const { title, description, location, locationAddress, imageBase64, userId } = validatedFields.data;
  
  let imageUrl: string | undefined;
  let imagePath: string | undefined;
  
  try {
    // 1. AI Categorization
    const aiResult = await categorizeComplaint({
      title,
      description,
      location: locationAddress,
      imageUri: imageBase64,
    });
    const category: ComplaintCategory = aiResult.category;

    // 2. Image Upload
    if (imageBase64) {
      const imageRef = ref(storage, `complaints/${userId}/${Date.now()}`);
      const uploadResult = await uploadString(imageRef, imageBase64, 'data_url');
      imageUrl = await getDownloadURL(uploadResult.ref);
      imagePath = uploadResult.ref.fullPath;
    }
    
    // 3. Get User Profile
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);
    if (!userDocSnap.exists()) {
        throw new Error('User profile not found.');
    }
    const userProfile = userDocSnap.data() as UserProfile;

    // 4. Create Complaint in Firestore
    const complaintData = {
      title,
      description,
      category,
      location: new GeoPoint(location.lat, location.lng),
      locationAddress,
      imageUrl,
      imagePath,
      status: 'Pending' as ComplaintStatus,
      studentId: userId,
      studentDisplayName: userProfile.displayName,
      studentPhotoUrl: userProfile.photoURL || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await addDoc(collection(db, 'complaints'), complaintData);

  } catch (error) {
    console.error('Error creating complaint:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { message: `Database Error: ${errorMessage}` };
  }

  revalidatePath('/student/dashboard');
  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/complaints');
  
  // No need to return anything on success as we redirect
  return { message: 'success' };
}


const UpdateStatusSchema = z.object({
  complaintId: z.string(),
  status: z.enum(['Pending', 'In Progress', 'Resolved']),
  resolutionRemarks: z.string().optional(),
});


export async function updateComplaintStatus(formData: FormData) {
  const user = auth.currentUser;
  if (!user) {
    return { message: 'Authentication Error: You must be logged in.' };
  }
  
  const validatedFields = UpdateStatusSchema.safeParse({
    complaintId: formData.get('complaintId'),
    status: formData.get('status'),
    resolutionRemarks: formData.get('resolutionRemarks'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid data provided.',
    };
  }
  
  const { complaintId, status, resolutionRemarks } = validatedFields.data;

  try {
    const complaintRef = doc(db, 'complaints', complaintId);
    
    const updateData: any = {
      status,
      updatedAt: serverTimestamp(),
      adminId: user.uid,
    };

    if (status === 'Resolved' && resolutionRemarks) {
      updateData.resolutionRemarks = resolutionRemarks;
    }

    await updateDoc(complaintRef, updateData);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { message: `Database Error: ${errorMessage}` };
  }

  revalidatePath(`/admin/complaints/${complaintId}`);
  revalidatePath('/admin/complaints');
  revalidatePath('/admin/dashboard');
  // student path revalidation might need ID, but dashboard is enough
  revalidatePath('/student/dashboard');

  return { message: 'Status updated successfully.' };
}


export async function summarizeComplaint(complaintId: string): Promise<{ summary: string | null, error: string | null }> {
    try {
        const complaintRef = doc(db, 'complaints', complaintId);
        const complaintSnap = await getDoc(complaintRef);

        if (!complaintSnap.exists()) {
            return { summary: null, error: 'Complaint not found.' };
        }

        const complaint = complaintSnap.data() as Complaint;

        const summaryResult = await summarizeComplaintFlow({
            title: complaint.title,
            description: complaint.description,
            category: complaint.category,
            location: complaint.locationAddress,
        });

        return { summary: summaryResult.summary, error: null };
    } catch (e) {
        console.error("Summarization failed:", e);
        return { summary: null, error: 'Failed to generate summary.' };
    }
}
