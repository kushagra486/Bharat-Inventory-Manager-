import { Settings } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function SettingsPage() {
  return (
    <ComingSoon
      icon={Settings}
      title="Settings"
      description="Company profile, GST details, stores, users & permissions, notifications, and integrations will live here."
    />
  );
}
