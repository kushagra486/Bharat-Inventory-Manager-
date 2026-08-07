import { AlertTriangle, PackageX, Sparkles, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getInsightsContext } from "@/lib/insights";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AiChat } from "@/app/dashboard/ai/ai-chat";

export default async function AiInsightsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ctx = await getInsightsContext(supabase, user!.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">AI Insights</h1>
        <p className="text-sm text-muted-foreground">
          Recommendations and chat, grounded in your live inventory and sales data.
        </p>
      </div>

      <Card className="border-primary/40">
        <CardContent className="flex items-start gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </div>
          <div>
            <p className="text-sm font-medium">Summary</p>
            <p className="text-sm text-muted-foreground">{ctx.summary}</p>
          </div>
        </CardContent>
      </Card>

      <AiChat />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xs font-medium tracking-wide text-primary uppercase">
              <PackageX className="size-4" />
              Restock suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ctx.lowStock.length === 0 ? (
              <p className="text-sm text-muted-foreground">No products are running low.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {ctx.lowStock.map((p) => (
                  <li key={p.id} className="flex items-center justify-between text-sm">
                    <span>{p.name}</span>
                    <Badge variant="destructive">
                      +{Math.max(0, ctx.restockTarget - p.quantity)} {p.unit} suggested
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
              Expiry risk (next {ctx.expiryRiskDays} days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ctx.expiryRisk.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing at risk of expiring soon.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {ctx.expiryRisk.map((p) => (
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
          {ctx.bestSellers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No completed sales yet — ring up orders in Sales · POS to see your top products.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {ctx.bestSellers.map(([name, qty]) => (
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
