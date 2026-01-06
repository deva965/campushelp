'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import type { Complaint } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ComplaintStatusBadge } from '@/components/complaints/ComplaintStatusBadge';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FilePlus2, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function ComplaintList() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const emptyStateImage = PlaceHolderImages.find(p => p.id === 'empty-state-complaints');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'complaints'),
      where('studentId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const complaintsData: Complaint[] = [];
        querySnapshot.forEach((doc) => {
          complaintsData.push({ id: doc.id, ...doc.data() } as Complaint);
        });
        setComplaints(complaintsData);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError('Failed to fetch complaints.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
        <Card className="flex flex-col items-center justify-center p-8 text-center h-96">
          <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
          <CardTitle className="text-xl mb-2 text-destructive">An Error Occurred</CardTitle>
          <CardDescription>{error}</CardDescription>
        </Card>
    );
  }

  if (complaints.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
        {emptyStateImage && <Image src={emptyStateImage.imageUrl} width={150} height={150} alt="No complaints" className="mb-6 rounded-full" data-ai-hint={emptyStateImage.imageHint} />}
        <CardTitle className="text-xl mb-2 font-headline">No Complaints Yet</CardTitle>
        <CardDescription className="mb-6 max-w-sm">
          You haven't submitted any complaints. Click the button below to report an issue on campus.
        </CardDescription>
        <Button asChild>
          <Link href="/student/complaints/new">
            <FilePlus2 className="mr-2 h-4 w-4" />
            Submit Your First Complaint
          </Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {complaints.map((complaint) => (
        <Card key={complaint.id} className="flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-start gap-2">
              <CardTitle className="text-lg font-bold line-clamp-2 leading-tight">{complaint.title}</CardTitle>
              <ComplaintStatusBadge status={complaint.status} />
            </div>
            <CardDescription>
                {complaint.createdAt ? `${formatDistanceToNow(complaint.createdAt.toDate())} ago` : ''} in{' '}
                <span className="font-medium text-foreground">{complaint.category}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-muted-foreground line-clamp-3">{complaint.description}</p>
          </CardContent>
          <div className="p-6 pt-0">
             <Button variant="outline" className="w-full" asChild>
                <Link href={`/student/complaints/${complaint.id}`}>View Details</Link>
             </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
