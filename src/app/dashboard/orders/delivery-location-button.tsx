"use client";

import { useEffect, useRef, useState } from "react";
import { Navigation, Square } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateDeliveryLocation } from "@/app/dashboard/orders/actions";

const MIN_UPDATE_INTERVAL_MS = 20_000;

export function DeliveryLocationButton({ orderId }: { orderId: string }) {
  const [isSharing, setIsSharing] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const lastSentRef = useRef(0);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  function start() {
    if (!("geolocation" in navigator)) {
      toast.error("This device doesn't support location sharing.");
      return;
    }
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const now = Date.now();
        if (now - lastSentRef.current < MIN_UPDATE_INTERVAL_MS) return;
        lastSentRef.current = now;
        updateDeliveryLocation(orderId, position.coords.latitude, position.coords.longitude).catch(() => {
          toast.error("Couldn't update delivery location");
        });
      },
      () => {
        toast.error("Couldn't access location — check browser permissions.");
        setIsSharing(false);
      },
      { enableHighAccuracy: true },
    );
    setIsSharing(true);
    toast.success("Sharing live location with the customer");
  }

  function stop() {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    watchIdRef.current = null;
    setIsSharing(false);
    toast.success("Stopped sharing location");
  }

  return (
    <Button variant={isSharing ? "default" : "outline"} size="xs" onClick={isSharing ? stop : start}>
      {isSharing ? <Square /> : <Navigation />}
      {isSharing ? "Stop sharing" : "Share location"}
    </Button>
  );
}
