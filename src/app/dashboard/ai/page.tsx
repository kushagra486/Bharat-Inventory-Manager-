import { createClient } from "@/lib/supabase/server";
import { AiChat } from "@/app/dashboard/ai/ai-chat";

const LOW_STOCK_THRESHOLD = 5;

export default async function AiPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("name, quantity, unit")
    .eq("is_archived", false);

  const lowStock = (products ?? []).filter((p) => p.quantity <= LOW_STOCK_THRESHOLD);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI Assistant</h1>
        <p className="text-sm text-muted-foreground">
          Ask about revenue, forecasts, stock and GST — powered by your live inventory data.
        </p>
      </div>
      <AiChat lowStock={lowStock} />
    </div>
  );
}
