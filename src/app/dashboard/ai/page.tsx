import { Sparkles } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function AiInsightsPage() {
  return (
    <ComingSoon
      icon={Sparkles}
      title="AI Insights"
      description="The AI assistant — demand forecasts, restock suggestions, and natural-language queries over your inventory — will live here once it's wired up to a model provider."
    />
  );
}
