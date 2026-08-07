import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/app/dashboard/settings/profile-form";
import { NotificationSettings } from "@/app/dashboard/settings/notification-settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [profileRes, notificationsRes] = await Promise.all([
    supabase.from("user_profiles").select("*").eq("id", user!.id).maybeSingle(),
    supabase.from("notification_settings").select("*").order("days_before"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Business profile, account, and expiry notification preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xs font-medium tracking-wide text-primary uppercase">
            Business profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm profile={profileRes.data} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xs font-medium tracking-wide text-primary uppercase">
            Account
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span>{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Member since</span>
            <span>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xs font-medium tracking-wide text-primary uppercase">
            Expiry notification preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-xs text-muted-foreground">
            These reminders are stored and toggled here, but nothing actually sends push/email
            notifications yet — that delivery service isn&apos;t built.
          </p>
          <NotificationSettings settings={notificationsRes.data ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
