import { createClient } from "@/lib/supabase/server";
import { getShopContext } from "@/lib/shop-context";
import { PosView } from "@/app/dashboard/sales/pos-view";

export default async function SalesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { shopId } = await getShopContext(supabase, user!);

  const [productsRes, customersRes] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, price, quantity, unit, categories(name)")
      .eq("user_id", shopId)
      .eq("is_archived", false)
      .gt("quantity", 0)
      .order("name"),
    supabase.from("customers").select("id, name").eq("user_id", shopId).order("name"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Sales · POS</h1>
        <p className="text-sm text-muted-foreground">
          Tap products to add them to the cart, then check out.
        </p>
      </div>
      <PosView products={productsRes.data ?? []} customers={customersRes.data ?? []} />
    </div>
  );
}
