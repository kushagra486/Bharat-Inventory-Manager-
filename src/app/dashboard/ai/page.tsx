import { AlertTriangle, PackageX, Sparkles, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const LOW_STOCK_THRESHOLD = 5;
const RESTOCK_TARGET = 20;
const EXPIRY_RISK_DAYS = 7;

function getRiskWindow() {
  const now = Date.now();
  return { now, cutoff: now + EXPIRY_RISK_DAYS * 24 * 60 * 60 * 1000 };
}

export default async function AiInsightsPage() {
  const supabase = await createClient();

  const [productsRes, itemsRes] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, quantity, unit, expiry_date")
      .eq("is_archived", false),
    supabase
      .from("sales_order_items")
      .select("product_id, product_name, quantity, sales_orders(status)"),
  ]);

  const products = productsRes.data ?? [];
  const items = (itemsRes.data ?? []).filter((i) => i.sales_orders?.status === "completed");

  const lowStock = products
    .filter((p) => p.quantity <= LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.quantity - b.quantity);

  const { now, cutoff: riskCutoff } = getRiskWindow();
  const expiryRisk = products
    .filter((p) => {
      const t = new Date(p.expiry_date).getTime();
      return t >= now && t <= riskCutoff;
    })
    .sort((a, b) => a.expiry_date.localeCompare(b.expiry_date));

  const salesByProduct = new Map<string, number>();
  for (const item of items) {
    const key = item.product_name;
    salesByProduct.set(key, (salesByProduct.get(key) ?? 0) + item.quantity);
  }
  const bestSellers = [...salesByProduct.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const summaryParts: string[] = [];
  if (lowStock.length > 0) {
    summaryParts.push(
      `${lowStock.length} product${lowStock.length > 1 ? "s need" : " needs"} restocking`,
    );
  }
  if (expiryRisk.length > 0) {
    summaryParts.push(
      `${expiryRisk.length} product${expiryRisk.length > 1 ? "s expire" : " expires"} within ${EXPIRY_RISK_DAYS} days`,
    );
  }
  const summary =
    summaryParts.length > 0
      ? summaryParts.join(" and ") + "."
      : "Inventory looks healthy — no urgent restocking or expiry risks right now.";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">AI Insights</h1>
        <p className="text-sm text-muted-foreground">
          Rule-based recommendations computed from your live inventory and sales data.
        </p>
      </div>

      <Card className="border-primary/40">
        <CardContent className="flex items-start gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </div>
          <div>
            <p className="text-sm font-medium">Summary</p>
            <p className="text-sm text-muted-foreground">{summary}</p>
            <p className="mt-2 text-xs text-muted-foreground/70">
              These insights are computed with deterministic rules over your data — no external
              AI model is connected yet. Add an OpenRouter/Anthropic API key to enable
              natural-language chat here.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xs font-medium tracking-wide text-primary uppercase">
              <PackageX className="size-4" />
              Restock suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStock.length === 0 ? (
              <p className="text-sm text-muted-foreground">No products are running low.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {lowStock.map((p) => (
                  <li key={p.id} className="flex items-center justify-between text-sm">
                    <span>{p.name}</span>
                    <Badge variant="destructive">
                      +{Math.max(0, RESTOCK_TARGET - p.quantity)} {p.unit} suggested
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xs font-medium tracking-wide text-primary uppercase">
              <AlertTriangle className="size-4" />
              Expiry risk (next {EXPIRY_RISK_DAYS} days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expiryRisk.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing at risk of expiring soon.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {expiryRisk.map((p) => (
                  <li key={p.id} className="flex items-center justify-between text-sm">
                    <span>{p.name}</span>
                    <Badge variant="outline">{p.expiry_date}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xs font-medium tracking-wide text-primary uppercase">
            <TrendingUp className="size-4" />
            Best sellers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bestSellers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No completed sales yet — ring up orders in Sales · POS to see your top products.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {bestSellers.map(([name, qty]) => (
                <li key={name} className="flex items-center justify-between text-sm">
                  <span>{name}</span>
                  <Badge variant="secondary">{qty} sold</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
