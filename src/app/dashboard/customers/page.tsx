import { Users } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function CustomersPage() {
  return (
    <ComingSoon
      icon={Users}
      title="Customers"
      description="Customer profiles, purchase history, loyalty points, and membership tiers will live here once the CRM module is built."
    />
  );
}
