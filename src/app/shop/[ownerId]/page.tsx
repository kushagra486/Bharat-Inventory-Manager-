import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMarketplaceData } from "@/app/shop/data";
import { MarketplaceApp } from "@/app/shop/_components/marketplace-app";
import type { CategoryVM } from "@/app/shop/_components/types";

export default async function ShopPage(props: PageProps<"/shop/[ownerId]">) {
  const { ownerId } = await props.params;
  const supabase = await createClient();

  const [{ shops, products }, categoriesRes] = await Promise.all([
    getMarketplaceData(),
    supabase
      .from("categories")
      .select("id, name, icon")
      .or(`user_id.is.null,user_id.eq.${ownerId}`)
      .order("name"),
  ]);

  if (!shops.some((s) => s.id === ownerId)) {
    notFound();
  }

  const shopCategories: CategoryVM[] = (categoriesRes.data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    icon: c.icon,
  }));

  return (
    <MarketplaceApp shops={shops} products={products} shopCategories={shopCategories} shopId={ownerId} />
  );
}
