import { getMarketplaceData } from "@/app/shop/data";
import { MarketplaceApp } from "@/app/shop/_components/marketplace-app";

export default async function MarketplacePage() {
  const { shops, products } = await getMarketplaceData();

  return <MarketplaceApp shops={shops} products={products} shopId={null} />;
}
