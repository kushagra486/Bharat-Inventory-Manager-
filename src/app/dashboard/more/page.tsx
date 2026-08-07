import Link from "next/link";
import { ChevronRight, Receipt, Settings, Tags, TrendingUp, Truck, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const items = [
  { label: "Orders", sub: "Track & manage orders", href: "/dashboard/orders", icon: Receipt },
  { label: "Customers", sub: "Profiles & loyalty", href: "/dashboard/customers", icon: Users },
  { label: "Reports", sub: "Analytics & exports", href: "/dashboard/reports", icon: TrendingUp },
  { label: "Categories", sub: "Organize your products", href: "/dashboard/categories", icon: Tags },
  { label: "Suppliers", sub: "Who supplies your stock", href: "/dashboard/suppliers", icon: Truck },
  { label: "Settings", sub: "Company, GST, users", href: "/dashboard/settings", icon: Settings },
];

export default function MorePage() {
  return (
    <div className="flex flex-col gap-4 md:hidden">
      <h1 className="text-2xl font-semibold tracking-tight">More</h1>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="gap-0 py-3.5 transition-colors hover:bg-muted/50">
              <CardContent className="flex items-center gap-3 px-4">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[var(--bim-accent-900)] text-[var(--bim-accent-300)]">
                  <item.icon className="size-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.sub}</div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
