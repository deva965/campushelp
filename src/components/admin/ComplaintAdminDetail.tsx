'use client';

import type { Complaint, ComplaintStatus } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ComplaintStatusBadge } from "@/components/complaints/ComplaintStatusBadge";
import { format } from 'date-fns';
import Image from "next/image";
import { Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { GoogleMapsProvider } from "@/components/shared/GoogleMapsProvider";
import { Separator } from "@/components/ui/separator";
import { FileText, MapPin, Tag, User, BrainCircuit, BotMessageSquare, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { complaintStatuses } from "@/lib/types";
import { useEffect, useState } from "react";
import { summarizeComplaint, updateComplaintStatus } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "../ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

function SubmitButton({status}: {status: ComplaintStatus}) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Status to &quot;{status}&quot;
        </Button>
    )
}

export function ComplaintAdminDetail({ complaint: initialComplaint }: { complaint: any }) {
    // Timestamps are strings, need to convert back to Date objects
    const complaint = {
        ...initialComplaint,
        createdAt: new Date(initialComplaint.createdAt),
        updatedAt: new Date(initialComplaint.updatedAt),
    } as Complaint;

    const { toast } = useToast();
    const [summary, setSummary] = useState<string | null>(null);
    const [summaryLoading, setSummaryLoading] = useState(true);
    const [summaryError, setSummaryError] = useState<string | null>(null);

    const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus>(complaint.status);
    
    useEffect(() => {
        const getSummary = async () => {
            setSummaryLoading(true);
            const result = await summarizeComplaint(complaint.id);
            if (result.summary) {
                setSummary(result.summary);
            } else {
                setSummaryError(result.error);
            }
            setSummaryLoading(false);
        };
        getSummary();
    }, [complaint.id]);

    const handleUpdateStatus = async (formData: FormData) => {
        const result = await updateComplaintStatus(formData);
        if (result?.message === 'Status updated successfully.') {
            toast({ title: 'Success', description: result.message });
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result?.message || 'Failed to update status.' });
        }
    };

    const getInitials = (name: string | undefined) => {
        if (!name) return 'U';
        const names = name.split(' ');
        const initials = names.map(n => n[0]).join('');
        return initials.length > 2 ? initials.substring(0, 2).toUpperCase() : initials.toUpperCase();
    };

  return (
    <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-headline">{complaint.title}</CardTitle>
                            <CardDescription>
                                Submitted on {complaint.createdAt ? format(complaint.createdAt, 'PPP') : 'N/A'}
                            </CardDescription>
                        </div>
                        <ComplaintStatusBadge status={complaint.status} />
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-start gap-4">
                        <User className="h-5 w-5 mt-1 text-muted-foreground" />
                        <div>
                            <h3 className="font-semibold">Submitted By</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={complaint.studentPhotoUrl} />
                                    <AvatarFallback>{getInitials(complaint.studentDisplayName)}</AvatarFallback>
                                </Avatar>
                                <p className="text-muted-foreground">{complaint.studentDisplayName}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <Tag className="h-5 w-5 mt-1 text-muted-foreground" />
                        <div>
                            <h3 className="font-semibold">Category</h3>
                            <p className="text-muted-foreground">{complaint.category}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <FileText className="h-5 w-5 mt-1 text-muted-foreground" />
                        <div>
                            <h3 className="font-semibold">Description</h3>
                            <p className="text-muted-foreground whitespace-pre-wrap">{complaint.description}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <MapPin className="h-5 w-5 mt-1 text-muted-foreground" />
                        <div>
                            <h3 className="font-semibold">Location</h3>
                            <p className="text-muted-foreground">{complaint.locationAddress}</p>
                        </div>
                    </div>

                    {complaint.resolutionRemarks && (
                        <div className="pt-4">
                            <h3 className="font-semibold mb-2">Resolution Remarks</h3>
                            <blockquote className="border-l-2 pl-6 italic text-muted-foreground">
                            {complaint.resolutionRemarks}
                            </blockquote>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-8">
                {complaint.imageUrl && (
                    <Card>
                        <CardHeader><CardTitle>Attached Image</CardTitle></CardHeader>
                        <CardContent>
                            <a href={complaint.imageUrl} target="_blank" rel="noopener noreferrer">
                                <div className="relative aspect-video w-full overflow-hidden rounded-lg border hover:opacity-90 transition-opacity">
                                    <Image src={complaint.imageUrl} alt={complaint.title} fill className="object-cover" />
                                </div>
                            </a>
                        </CardContent>
                    </Card>
                )}
                {complaint.location && (
                    <Card>
                        <CardHeader><CardTitle>Map</CardTitle></CardHeader>
                        <CardContent>
                            <div className="h-64 w-full rounded-lg overflow-hidden border">
                            <GoogleMapsProvider>
                                <Map
                                    style={{ width: '100%', height: '100%' }}
                                    defaultCenter={{ lat: complaint.location.latitude, lng: complaint.location.longitude }}
                                    defaultZoom={16}
                                    gestureHandling={'none'}
                                    disableDefaultUI={true}
                                    mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID'}
                                >
                                    <AdvancedMarker position={{ lat: complaint.location.latitude, lng: complaint.location.longitude }}>
                                    <Pin />
                                    </AdvancedMarker>
                                </Map>
                            </GoogleMapsProvider>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>

        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline">
                        <Sparkles className="h-5 w-5 text-primary" />
                        AI Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {summaryLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    ) : summaryError ? (
                        <Alert variant="destructive">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{summaryError}</AlertDescription>
                        </Alert>
                    ) : (
                        <p className="text-muted-foreground italic">&quot;{summary}&quot;</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Update Status</CardTitle>
                    <CardDescription>Change the status of this complaint and add remarks if resolving.</CardDescription>
                </CardHeader>
                <form action={handleUpdateStatus}>
                    <input type="hidden" name="complaintId" value={complaint.id} />
                    <CardContent className="space-y-4">
                        <div>
                            <Select name="status" value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as ComplaintStatus)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {complaintStatuses.map(status => (
                                        <SelectItem key={status} value={status}>{status}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {selectedStatus === 'Resolved' && (
                            <div>
                                <Textarea name="resolutionRemarks" placeholder="Add resolution remarks..." />
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                       <SubmitButton status={selectedStatus}/>
                    </CardFooter>
                </form>
            </Card>
        </div>
    </div>
  );
}
