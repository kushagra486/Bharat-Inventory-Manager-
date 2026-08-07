import { NextResponse, type NextRequest } from "next/server";
import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  webpush.setVapidDetails(
    "https://bharat-inventory-manager.vercel.app",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );

  const supabase = createAdminClient();

  const { data: settings } = await supabase
    .from("notification_settings")
    .select("user_id, days_before")
    .eq("channel", "push")
    .eq("is_enabled", true);

  let sent = 0;
  let failed = 0;

  for (const setting of settings ?? []) {
    const cutoff = new Date(Date.now() + setting.days_before * 24 * 60 * 60 * 1000);

    const { data: products } = await supabase
      .from("products")
      .select("id, name, expiry_date")
      .eq("user_id", setting.user_id)
      .eq("is_archived", false)
      .gte("expiry_date", new Date().toISOString())
      .lte("expiry_date", cutoff.toISOString());

    for (const product of products ?? []) {
      const { data: alreadySent } = await supabase
        .from("notification_logs")
        .select("id")
        .eq("user_id", setting.user_id)
        .eq("product_id", product.id)
        .eq("days_before", setting.days_before)
        .maybeSingle();
      if (alreadySent) continue;

      const { data: subscriptions } = await supabase
        .from("push_subscriptions")
        .select("id, endpoint, p256dh, auth")
        .eq("user_id", setting.user_id);

      let delivered = false;
      for (const sub of subscriptions ?? []) {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            JSON.stringify({
              title: "Expiry alert",
              body: `${product.name} expires on ${new Date(product.expiry_date).toLocaleDateString()}`,
              url: "/dashboard/products",
            }),
          );
          delivered = true;
        } catch (err) {
          const statusCode = (err as { statusCode?: number }).statusCode;
          if (statusCode === 404 || statusCode === 410) {
            await supabase.from("push_subscriptions").delete().eq("id", sub.id);
          }
        }
      }

      if (delivered) sent++;
      else failed++;

      await supabase.from("notification_logs").insert({
        user_id: setting.user_id,
        product_id: product.id,
        days_before: setting.days_before,
        status: delivered ? "sent" : "failed",
        sent_at: delivered ? new Date().toISOString() : null,
      });
    }
  }

  return NextResponse.json({ ok: true, sent, failed });
}
