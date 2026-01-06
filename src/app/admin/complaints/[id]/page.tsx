import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import type { Complaint } from "@/lib/types";
import { ComplaintAdminDetail } from "@/components/admin/ComplaintAdminDetail";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";


async function getComplaint(id: string): Promise<Complaint | null> {
  const docRef = doc(db, 'complaints', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    // Manually convert Timestamp to Date string to avoid serialization issues
    return { 
        id: docSnap.id, 
        ...data,
        createdAt: data.createdAt.toDate().toISOString(),
        updatedAt: data.updatedAt.toDate().toISOString(),
    } as unknown as Complaint;
  }
  return null;
}

export default async function AdminComplaintDetailsPage({ params }: { params: { id: string } }) {
  const complaint = await getComplaint(params.id);

  if (!complaint) {
    return (
      <Card className="text-center p-8">
        <CardHeader>
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
            <CardTitle className="mt-4 text-2xl font-bold">Complaint Not Found</CardTitle>
        </CardHeader>
        <CardContent>
            <CardDescription>The complaint you are looking for does not exist or has been deleted.</CardDescription>
        </CardContent>
      </Card>
    );
  }
  
  // Re-serialize Timestamps to be passed to client component
  const serializableComplaint = {
    ...complaint,
    createdAt: new Date(complaint.createdAt).toISOString(),
    updatedAt: new Date(complaint.updatedAt).toISOString(),
  }

  return <ComplaintAdminDetail complaint={serializableComplaint} />;
}
