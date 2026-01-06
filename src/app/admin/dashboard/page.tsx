import { DashboardClient } from "@/components/admin/DashboardClient";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">Admin Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of campus complaints and system status.
        </p>
      </div>
      <DashboardClient />
    </div>
  );
}
