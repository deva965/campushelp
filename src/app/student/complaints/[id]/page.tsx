import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ComplaintStatusBadge } from "@/components/complaints/ComplaintStatusBadge";
import { format } from 'date-fns';
import Image from "next/image";
import { Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { GoogleMapsProvider } from "@/components/shared/GoogleMapsProvider";
import { Separator } from "@/components/ui/separator";
import { FileText, MapPin, Tag, User, MessageSquare, CheckCircle } from "lucide-react";
import type { Complaint } from "@/lib/types";

async function getComplaint(id: string) {
  const docRef = doc(db, 'complaints', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Complaint;
  }
  return null;
}

export default async function ComplaintDetailsPage({ params }: { params: { id: string } }) {
  const complaint = await getComplaint(params.id);

  if (!complaint) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Complaint Not Found</h1>
        <p>The complaint you are looking for does not exist.</p>
      </div>
    );
  }

  const { title, description, category, status, createdAt, updatedAt, imageUrl, location, locationAddress, resolutionRemarks } = complaint;

  return (
    <div className="max-w-4xl mx-auto">
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="space-y-1">
                        <CardTitle className="text-2xl font-headline">{title}</CardTitle>
                        <CardDescription>
                            Submitted on {createdAt ? format(createdAt.toDate(), 'PPP') : 'N/A'}
                        </CardDescription>
                    </div>
                    <ComplaintStatusBadge status={status} />
                </div>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <Tag className="h-5 w-5 mt-1 text-muted-foreground" />
                            <div>
                                <h3 className="font-semibold">Category</h3>
                                <p className="text-muted-foreground">{category}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <FileText className="h-5 w-5 mt-1 text-muted-foreground" />
                            <div>
                                <h3 className="font-semibold">Description</h3>
                                <p className="text-muted-foreground whitespace-pre-wrap">{description}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <MapPin className="h-5 w-5 mt-1 text-muted-foreground" />
                            <div>
                                <h3 className="font-semibold">Location</h3>
                                <p className="text-muted-foreground">{locationAddress}</p>
                            </div>
                        </div>
                    </div>
                     <div className="space-y-4">
                        {imageUrl && (
                            <div>
                                <h3 className="font-semibold mb-2">Attached Image</h3>
                                <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                                    <Image src={imageUrl} alt={title} fill className="object-cover" />
                                </div>
                            </div>
                        )}
                        {location && (
                            <div>
                                <h3 className="font-semibold mb-2">Map</h3>
                                <div className="h-64 w-full rounded-lg overflow-hidden border">
                                <GoogleMapsProvider>
                                    <Map
                                        style={{ width: '100%', height: '100%' }}
                                        defaultCenter={{ lat: location.latitude, lng: location.longitude }}
                                        defaultZoom={16}
                                        gestureHandling={'none'}
                                        disableDefaultUI={true}
                                        mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID'}
                                    >
                                        <AdvancedMarker position={{ lat: location.latitude, lng: location.longitude }}>
                                        <Pin />
                                        </AdvancedMarker>
                                    </Map>
                                </GoogleMapsProvider>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {status === 'Resolved' && resolutionRemarks && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold font-headline flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                        Resolution
                      </h3>
                      <Card className="bg-muted/50">
                        <CardContent className="p-4">
                          <p className="text-muted-foreground italic">&quot;{resolutionRemarks}&quot;</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Resolved on {updatedAt ? format(updatedAt.toDate(), 'PPP') : 'N/A'}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}

            </CardContent>
        </Card>
    </div>
  );
}
