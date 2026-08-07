import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StorefrontApp } from "@/app/shop/[ownerId]/_components/storefront-app";
import type { CategoryVM, ProductVM } from "@/app/shop/[ownerId]/_components/types";

export default async function ShopPage(props: PageProps<"/shop/[ownerId]">) {
  const { ownerId } = await props.params;
  const supabase = await createClient();

  const [profileRes, categoriesRes, productsRes] = await Promise.all([
    supabase.from("user_profiles").select("business_name, full_name").eq("id", ownerId).maybeSingle(),
    supabase
      .from("categories")
      .select("id, name, icon")
      .or(`user_id.is.null,user_id.eq.${ownerId}`)
      .order("name"),
    supabase
      .from("products")
      .select("id, name, price, quantity, unit, image_url, category_id, categories(name, icon)")
      .eq("user_id", ownerId)
      .eq("is_archived", false)
      .gt("quantity", 0)
      .not("price", "is", null)
      .order("created_at", { ascending: false }),
  ]);

  if (!profileRes.data) {
    notFound();
  }

  const shopName = profileRes.data.business_name || profileRes.data.full_name || "Bharat Store";

  const categories: CategoryVM[] = (categoriesRes.data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    icon: c.icon,
  }));

  const products: ProductVM[] = (productsRes.data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    quantity: p.quantity,
    unit: p.unit,
    imageUrl: p.image_url,
    categoryId: p.category_id,
    categoryName: p.categories?.name ?? null,
    categoryIcon: p.categories?.icon ?? "🛍️",
  }));

  return (
    <StorefrontApp
      ownerId={ownerId}
      shopName={shopName}
      categories={categories}
      products={products}
    />
  );
}
