import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { customers, formatINR, initials } from "@/lib/mock-data";

export default function CustomersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
        <p className="text-sm text-muted-foreground">Profiles, loyalty tier and lifetime value.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {customers.map((c) => (
          <Card key={c.id} className="gap-3 py-4">
            <CardContent className="flex flex-col gap-3 px-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--bim-accent-800)] text-sm font-semibold text-[var(--bim-accent-100)]">
                  {initials(c.name)}
                </div>
                <div>
                  <div className="text-sm font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.phone}</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Badge className="bg-[var(--bim-accent-800)] text-[var(--bim-accent-100)]">
                  {c.membership}
                </Badge>
                <div className="text-sm font-semibold">₹{formatINR(c.ltv)}</div>
              </div>
              <div className="text-xs text-muted-foreground">{c.orders} orders lifetime</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
