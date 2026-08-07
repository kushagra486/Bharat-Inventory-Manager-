import { ShoppingCart } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function SalesPage() {
  return (
    <ComingSoon
      icon={ShoppingCart}
      title="Sales · POS"
      description="Point-of-sale checkout, GST invoicing, and offline/online order capture will live here once the sales module is built."
    />
  );
}
