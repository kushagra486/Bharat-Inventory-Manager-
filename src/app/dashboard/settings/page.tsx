"use client";

import { ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

const settingsItems = [
  "Company profile",
  "GST details",
  "Stores",
  "Users & permissions",
  "Notifications",
  "Backup",
  "API keys",
  "Integrations",
  "Billing",
];

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Company, GST, users and integrations.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {settingsItems.map((item) => (
          <Card
            key={item}
            className="cursor-pointer gap-0 py-3.5 transition-colors hover:bg-muted/50"
            onClick={() => toast.info(`${item} is coming soon.`)}
          >
            <CardContent className="flex items-center justify-between px-4">
              <span className="text-sm">{item}</span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
