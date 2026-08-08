"use client";

import { useEffect, useRef, useState } from "react";
import Tesseract from "tesseract.js";
import { Camera, ScanText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { extractLabelFields, type ExtractedLabel } from "@/lib/ocr-extract";

// Mounted only while the dialog is open, so every attempt starts from
// fresh state — same pattern as BarcodeScannerDialog.
function ScannerBody({ onExtracted }: { onExtracted: (fields: ExtractedLabel) => void }) {
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"live" | "reading" | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!videoEl) return;
    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        videoEl.srcObject = stream;
        videoEl.play();
        setStatus("live");
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Couldn't access the camera");
      });

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [videoEl]);

  async function handleCapture() {
    if (!videoEl) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    canvas.getContext("2d")?.drawImage(videoEl, 0, 0);

    setStatus("reading");
    try {
      const { data } = await Tesseract.recognize(canvas, "eng", {
        workerPath: "/tesseract/worker.min.js",
        corePath: "/tesseract/tesseract-core-simd-lstm.wasm.js",
        langPath: "/tesseract",
        gzip: true,
      });
      onExtracted(extractLabelFields(data.text));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't read the label");
    }
  }

  if (error) {
    return <p className="py-8 text-center text-sm text-destructive">{error}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-md bg-black">
        <video ref={setVideoEl} className="aspect-video w-full" muted playsInline />
      </div>
      <Button type="button" onClick={handleCapture} disabled={status !== "live"}>
        <Camera />
        {status === "reading" ? "Reading label…" : "Capture & read"}
      </Button>
    </div>
  );
}

export function LabelScannerDialog({
  open,
  onOpenChange,
  onExtracted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExtracted: (fields: ExtractedLabel) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanText className="size-4" />
            Scan product label
          </DialogTitle>
        </DialogHeader>
        {open && (
          <ScannerBody
            onExtracted={(fields) => {
              onExtracted(fields);
              onOpenChange(false);
            }}
          />
        )}
        <p className="text-center text-xs text-muted-foreground">
          Frame the label or invoice, then capture. Fields it finds get filled in for you to review.
        </p>
      </DialogContent>
    </Dialog>
  );
}
