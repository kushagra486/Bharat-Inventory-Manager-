import { createClient } from "@/lib/supabase/server";
import type { ProductVM, ShopVM } from "@/app/shop/_components/types";

export async function getMarketplaceData() {
  const supabase = await createClient();

  const [profilesRes, productsRes] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("id, business_name, full_name, delivery_estimate, service_area, upi_id"),
    supabase
      .from("products")
      .select("id, name, price, quantity, unit, image_url, category_id, user_id, categories(name, icon)")
      .eq("is_archived", false)
      .gt("quantity", 0)
      .not("price", "is", null)
      .order("created_at", { ascending: false }),
  ]);

  const profileByOwner = new Map(
    (profilesRes.data ?? []).map((p) => [
      p.id,
      {
        name: p.business_name || p.full_name || "Local shop",
        deliveryEstimate: p.delivery_estimate,
        serviceArea: p.service_area,
        upiId: p.upi_id,
      },
    ]),
  );

  const products: ProductVM[] = [];
  const shopStats = new Map<string, { productCount: number; categoryIcons: Set<string> }>();

  for (const p of productsRes.data ?? []) {
    const profile = profileByOwner.get(p.user_id);
    if (!profile) continue;

    products.push({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      quantity: p.quantity,
      unit: p.unit,
      imageUrl: p.image_url,
      categoryId: p.category_id,
      categoryName: p.categories?.name ?? null,
      categoryIcon: p.categories?.icon ?? "🛍️",
      ownerId: p.user_id,
      shopName: profile.name,
      deliveryEstimate: profile.deliveryEstimate,
    });

    const stats = shopStats.get(p.user_id) ?? { productCount: 0, categoryIcons: new Set<string>() };
    stats.productCount += 1;
    if (p.categories?.icon) stats.categoryIcons.add(p.categories.icon);
    shopStats.set(p.user_id, stats);
  }

  const shops: ShopVM[] = [...profileByOwner.entries()]
    .map(([ownerId, profile]) => {
      const stats = shopStats.get(ownerId) ?? { productCount: 0, categoryIcons: new Set<string>() };
      return {
        id: ownerId,
        name: profile.name,
        deliveryEstimate: profile.deliveryEstimate,
        serviceArea: profile.serviceArea,
        upiId: profile.upiId,
        productCount: stats.productCount,
        categoryIcons: [...stats.categoryIcons].slice(0, 4),
      };
    })
    .sort((a, b) => b.productCount - a.productCount);

  return { shops, products };
}
