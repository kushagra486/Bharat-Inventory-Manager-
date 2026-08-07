import { createClient } from "@/lib/supabase/server";
import { ProductsTable } from "@/app/dashboard/products/products-table";

export default async function ProductsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [productsRes, categoriesRes, suppliersRes] = await Promise.all([
    supabase
      .from("products")
      .select("*, categories(id, name, color), suppliers(id, name)")
      .eq("user_id", user!.id)
      .eq("is_archived", false)
      .order("created_at", { ascending: false }),
    supabase
      .from("categories")
      .select("id, name, color, icon")
      .or(`user_id.is.null,user_id.eq.${user!.id}`)
      .order("name"),
    supabase.from("suppliers").select("id, name").eq("user_id", user!.id).order("name"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
        <p className="text-sm text-muted-foreground">
          Manage your stock, batches, and expiry dates.
        </p>
      </div>
      <ProductsTable
        products={productsRes.data ?? []}
        categories={categoriesRes.data ?? []}
        suppliers={suppliersRes.data ?? []}
      />
    </div>
  );
}
