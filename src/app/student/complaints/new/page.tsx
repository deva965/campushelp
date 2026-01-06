import { ComplaintForm } from "@/components/complaints/ComplaintForm";
import { GoogleMapsProvider } from "@/components/shared/GoogleMapsProvider";

export default function NewComplaintPage() {
  return (
    <div className="max-w-2xl mx-auto">
        <GoogleMapsProvider>
            <ComplaintForm />
        </GoogleMapsProvider>
    </div>
  );
}
