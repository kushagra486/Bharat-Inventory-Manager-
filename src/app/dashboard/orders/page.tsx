import { ClipboardList } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function OrdersPage() {
  return (
    <ComingSoon
      icon={ClipboardList}
      title="Orders"
      description="Online and offline order history, statuses, and fulfillment tracking will appear here once the orders module is built."
    />
  );
}
