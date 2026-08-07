import { BarChart3 } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function ReportsPage() {
  return (
    <ComingSoon
      icon={BarChart3}
      title="Reports"
      description="Revenue, profit, and category breakdowns with PDF/CSV export will live here once the sales module has data to report on."
    />
  );
}
