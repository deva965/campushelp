import type { Timestamp, GeoPoint } from 'firebase/firestore';

export type UserRole = 'student' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  displayName: string;
  photoURL?: string;
}

export type ComplaintCategory = 'Maintenance' | 'Cleanliness' | 'Safety' | 'Water' | 'Electricity' | 'Other';
export const complaintCategories: ComplaintCategory[] = ['Maintenance', 'Cleanliness', 'Safety', 'Water', 'Electricity', 'Other'];

export type ComplaintStatus = 'Pending' | 'In Progress' | 'Resolved';
export const complaintStatuses: ComplaintStatus[] = ['Pending', 'In Progress', 'Resolved'];


export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  location: GeoPoint;
  locationAddress: string;
  imageUrl?: string;
  imagePath?: string;
  status: ComplaintStatus;
  studentId: string;
  studentDisplayName: string;
  studentPhotoUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  resolutionRemarks?: string;
  adminId?: string;
}
