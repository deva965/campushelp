'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import type { Complaint, ComplaintStatus } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListChecks, Clock, Hourglass } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ComplaintStatusBadge } from '@/components/complaints/ComplaintStatusBadge';
import { formatDistanceToNow } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';

export function DashboardClient() {
  const [stats, setStats] = useState({ total: 0, Pending: 0, 'In Progress': 0, Resolved: 0 });
  const [recent, setRecent] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allComplaints: Complaint[] = [];
      const newStats = { total: 0, Pending: 0, 'In Progress': 0, Resolved: 0 };
      
      snapshot.forEach(doc => {
        const complaint = { id: doc.id, ...doc.data() } as Complaint;
        allComplaints.push(complaint);
        newStats.total++;
        if (newStats.hasOwnProperty(complaint.status)) {
            newStats[complaint.status as ComplaintStatus]++;
        }
      });

      setStats(newStats);
      setRecent(allComplaints.slice(0, 5));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card><CardHeader><Skeleton className="h-16 w-full" /></CardHeader></Card>
            <Card><CardHeader><Skeleton className="h-16 w-full" /></CardHeader></Card>
            <Card><CardHeader><Skeleton className="h-16 w-full" /></CardHeader></Card>
            <Card><CardHeader><Skeleton className="h-16 w-full" /></CardHeader></Card>
        </div>
        <Card>
          <CardHeader><CardTitle>Recent Complaints</CardTitle></CardHeader>
          <CardContent><Skeleton className="h-48 w-full" /></CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.Pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Hourglass className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats['In Progress']}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.Resolved}</div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Complaints</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recent.map((complaint) => (
                        <TableRow key={complaint.id} className="cursor-pointer" onClick={() => window.location.href = `/admin/complaints/${complaint.id}`}>
                            <TableCell className="font-medium">{complaint.title}</TableCell>
                            <TableCell>{complaint.studentDisplayName}</TableCell>
                            <TableCell>{complaint.category}</TableCell>
                            <TableCell><ComplaintStatusBadge status={complaint.status} /></TableCell>
                            <TableCell>{complaint.createdAt ? formatDistanceToNow(complaint.createdAt.toDate(), { addSuffix: true }) : 'N/A'}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {recent.length === 0 && <p className="text-center text-muted-foreground p-8">No complaints found.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
