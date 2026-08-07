"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { savePushSubscription, deletePushSubscription } from "@/app/dashboard/settings/actions";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

function isPushSupported() {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
}

export function PushSubscribe() {
  const [supported] = useState(isPushSupported);
  const [subscribed, setSubscribed] = useState(false);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (!supported) return;
    navigator.serviceWorker.register("/sw.js").then(async (registration) => {
      const existing = await registration.pushManager.getSubscription();
      setSubscribed(!!existing);
    });
  }, [supported]);

  async function handleEnable() {
    setIsPending(true);
    try {
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) throw new Error("Push notifications aren't configured for this deployment.");
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      await savePushSubscription(subscription.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } });
      setSubscribed(true);
      toast.success("Browser notifications enabled");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't enable notifications");
    } finally {
      setIsPending(false);
    }
  }

  async function handleDisable() {
    setIsPending(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await deletePushSubscription(subscription.endpoint);
        await subscription.unsubscribe();
      }
      setSubscribed(false);
      toast.success("Browser notifications disabled");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't disable notifications");
    } finally {
      setIsPending(false);
    }
  }

  if (!supported) {
    return (
      <p className="text-xs text-muted-foreground">
        Push notifications aren&apos;t supported in this browser.
      </p>
    );
  }

  return (
    <Button
      type="button"
      variant={subscribed ? "outline" : "default"}
      size="sm"
      className="w-fit"
      disabled={isPending}
      onClick={subscribed ? handleDisable : handleEnable}
    >
      {subscribed ? <BellOff /> : <Bell />}
      {subscribed ? "Disable browser notifications" : "Enable browser notifications"}
    </Button>
  );
}
