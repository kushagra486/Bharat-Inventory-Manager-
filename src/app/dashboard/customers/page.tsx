import { createClient } from "@/lib/supabase/server";
import { CustomersTable } from "@/app/dashboard/customers/customers-table";

export default async function CustomersPage() {
  const supabase = await createClient();

  const [customersRes, ordersRes] = await Promise.all([
    supabase.from("customers").select("*").order("name"),
    supabase.from("sales_orders").select("customer_id, total"),
  ]);

  const orderStats = new Map<string, { count: number; total: number }>();
  for (const o of ordersRes.data ?? []) {
    if (!o.customer_id) continue;
    const entry = orderStats.get(o.customer_id) ?? { count: 0, total: 0 };
    entry.count += 1;
    entry.total += Number(o.total);
    orderStats.set(o.customer_id, entry);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Customers</h1>
        <p className="text-sm text-muted-foreground">
          Profiles, order history, and loyalty points.
        </p>
      </div>
      <CustomersTable customers={customersRes.data ?? []} orderStats={Object.fromEntries(orderStats)} />
    </div>
  );
}
