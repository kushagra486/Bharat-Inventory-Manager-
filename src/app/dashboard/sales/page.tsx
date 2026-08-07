import { createClient } from "@/lib/supabase/server";
import { PosView } from "@/app/dashboard/sales/pos-view";

export default async function SalesPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, price, quantity, unit")
    .eq("is_archived", false)
    .order("name");

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sales · POS</h1>
        <p className="text-sm text-muted-foreground">
          Tap products to add them to the cart, then check out.
        </p>
      </div>
      <PosView products={products ?? []} />
    </div>
  );
}
