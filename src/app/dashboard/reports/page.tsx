"use client";

import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WeeklyRevenueLine } from "@/components/charts/weekly-revenue-line";
import { formatINR, reportSummary } from "@/lib/mock-data";

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground">Weekly performance and AI insights.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.info("Exports are coming soon.")}>
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => toast.info("Exports are coming soon.")}>
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card className="gap-2 py-4">
          <CardContent className="flex flex-col gap-2 px-4">
            <span className="text-[10px] font-medium tracking-wider text-primary uppercase">
              Weekly Revenue
            </span>
            <WeeklyRevenueLine yPoints={reportSummary.weeklyLineY} />
            <div className="text-xs text-muted-foreground">
              ₹{formatINR(reportSummary.weekRevenue)} this week · +{reportSummary.weekGrowthPct}%
            </div>
          </CardContent>
        </Card>

        <Card className="gap-2 border-primary/40 py-4">
          <CardContent className="flex flex-col gap-1.5 px-4">
            <div className="flex items-center gap-1.5 text-[10px] font-medium tracking-wider text-primary uppercase">
              <Sparkles className="size-3" />
              AI Summary
            </div>
            <p className="text-sm text-muted-foreground">
              Revenue is trending up on strong dairy and snack demand. Restock Amul Milk and
              Britannia Bread within 2 days to avoid stockouts.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="gap-1 py-4">
          <CardContent className="px-4">
            <div className="text-[11px] text-muted-foreground">Best category</div>
            <div className="text-lg font-semibold">{reportSummary.bestCategory}</div>
          </CardContent>
        </Card>
        <Card className="gap-1 py-4">
          <CardContent className="px-4">
            <div className="text-[11px] text-muted-foreground">Avg. order value</div>
            <div className="text-lg font-semibold">₹{formatINR(reportSummary.avgOrderValue)}</div>
          </CardContent>
        </Card>
        <Card className="gap-1 py-4">
          <CardContent className="px-4">
            <div className="text-[11px] text-muted-foreground">Profit margin</div>
            <div className="text-lg font-semibold">{reportSummary.profitMargin}%</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
