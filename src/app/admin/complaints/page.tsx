import { ComplaintsClient } from "@/components/admin/ComplaintsClient";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AllComplaintsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">All Complaints</h2>
        <p className="text-muted-foreground">
          View, filter, and manage all student complaints.
        </p>
      </div>
      <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
        <ComplaintsClient />
      </Suspense>
    </div>
  );
}
