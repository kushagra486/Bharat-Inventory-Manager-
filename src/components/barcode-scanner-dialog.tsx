"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import type { IScannerControls } from "@zxing/browser";
import { ScanLine } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Mounted only while the dialog is open, so every scan attempt starts from
// fresh state (no stale error from a previous attempt) without needing an
// explicit reset inside an effect.
function ScannerBody({ onDetected, onClose }: { onDetected: (code: string) => void; onClose: () => void }) {
  // The dialog's <video> mounts a render after this component does (portal +
  // open animation), so a plain ref read in the effect body races the DOM
  // commit. A state-backed callback ref re-fires the effect once the node
  // actually attaches, however late that happens.
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoEl) return;

    let cancelled = false;
    const reader = new BrowserMultiFormatReader();

    reader
      .decodeFromVideoDevice(undefined, videoEl, (result, err, controls) => {
        controlsRef.current = controls;
        if (cancelled) return;
        if (result) {
          controls.stop();
          onDetected(result.getText());
          onClose();
        }
        // NotFoundException fires continuously while no code is in frame — ignore it.
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Couldn't access the camera");
      });

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
    };
  }, [videoEl, onDetected, onClose]);

  if (error) {
    return <p className="py-8 text-center text-sm text-destructive">{error}</p>;
  }

  return (
    <div className="overflow-hidden rounded-md bg-black">
      <video ref={setVideoEl} className="aspect-video w-full" muted playsInline />
    </div>
  );
}

export function BarcodeScannerDialog({
  open,
  onOpenChange,
  onDetected,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDetected: (code: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanLine className="size-4" />
            Scan barcode
          </DialogTitle>
        </DialogHeader>
        {open && <ScannerBody onDetected={onDetected} onClose={() => onOpenChange(false)} />}
        <p className="text-center text-xs text-muted-foreground">
          Point the camera at a barcode — it&apos;ll be detected automatically.
        </p>
      </DialogContent>
    </Dialog>
  );
}
