import { BarChart3 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExportButtons } from "@/app/dashboard/reports/export-buttons";

export default async function ReportsPage() {
  const supabase = await createClient();

  const [ordersRes, itemsRes] = await Promise.all([
    supabase
      .from("sales_orders")
      .select("id, order_number, total, status, payment_method, created_at, customers(name)")
      .order("created_at", { ascending: false }),
    supabase
      .from("sales_order_items")
      .select("order_id, product_name, quantity, line_total, products(categories(name))"),
  ]);

  const orders = ordersRes.data ?? [];
  const items = itemsRes.data ?? [];

  const completedOrders = orders.filter((o) => o.status === "completed");
  const totalRevenue = completedOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const avgOrderValue = completedOrders.length ? totalRevenue / completedOrders.length : 0;

  const now = new Date();
  const days: { label: string; date: string; total: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    days.push({ label: d.toLocaleDateString(undefined, { weekday: "short" }), date, total: 0 });
  }
  for (const order of completedOrders) {
    const date = order.created_at.slice(0, 10);
    const day = days.find((d) => d.date === date);
    if (day) day.total += Number(order.total);
  }
  const maxDay = Math.max(1, ...days.map((d) => d.total));

  const categoryTotals = new Map<string, number>();
  const orderIdToStatus = new Map(orders.map((o) => [o.id, o.status]));
  for (const item of items) {
    if (orderIdToStatus.get(item.order_id) !== "completed") continue;
    const categoryName = item.products?.categories?.name ?? "Uncategorized";
    categoryTotals.set(categoryName, (categoryTotals.get(categoryName) ?? 0) + Number(item.line_total));
  }
  const topCategories = [...categoryTotals.entries()].sort((a, b) => b[1] - a[1]);
  const bestCategory = topCategories[0]?.[0] ?? "—";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground">Revenue and category performance.</p>
        </div>
        <ExportButtons orders={orders} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent>
            <p className="text-xs text-muted-foreground">Total revenue</p>
            <p className="text-xl font-medium">₹{totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-muted-foreground">Avg. order value</p>
            <p className="text-xl font-medium">₹{avgOrderValue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-muted-foreground">Best category</p>
            <p className="text-xl font-medium">{bestCategory}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xs font-medium tracking-wide text-primary uppercase">
            <BarChart3 className="size-4" />
            Revenue · last 7 days
          </CardTitle>
        </CardHeader>
        <CardContent>
          {totalRevenue === 0 ? (
            <p className="text-sm text-muted-foreground">
              No completed sales yet. Ring up an order in Sales · POS to see this fill in.
            </p>
          ) : (
            <div className="flex h-32 items-end gap-2">
              {days.map((d) => (
                <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-primary"
                    style={{ height: `${Math.max(4, (d.total / maxDay) * 100)}%` }}
                    title={`₹${d.total.toFixed(2)}`}
                  />
                  <span className="text-[10px] text-muted-foreground">{d.label}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xs font-medium tracking-wide text-primary uppercase">
            Revenue by category
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topCategories.length === 0 ? (
            <p className="text-sm text-muted-foreground">No completed sales yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {topCategories.map(([name, total]) => (
                <li key={name} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{name}</span>
                    <span className="text-muted-foreground">₹{total.toFixed(2)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(total / topCategories[0][1]) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
