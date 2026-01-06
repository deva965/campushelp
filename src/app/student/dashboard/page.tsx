import { ComplaintList } from "@/components/student/ComplaintList";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">Your Complaints</h2>
        <p className="text-muted-foreground">Here is a list of the complaints you have submitted.</p>
      </div>
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <ComplaintList />
      </Suspense>
    </div>
  );
}
