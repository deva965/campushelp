import { Badge } from "@/components/ui/badge";
import type { ComplaintStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ComplaintStatusBadgeProps {
  status: ComplaintStatus;
}

export function ComplaintStatusBadge({ status }: ComplaintStatusBadgeProps) {
  const statusStyles: Record<ComplaintStatus, string> = {
    Pending: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100",
    "In Progress": "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100",
    Resolved: "bg-green-100 text-green-800 border-green-200 hover:bg-green-100",
  };

  return (
    <Badge variant="outline" className={cn("font-medium", statusStyles[status])}>
      {status}
    </Badge>
  );
}
