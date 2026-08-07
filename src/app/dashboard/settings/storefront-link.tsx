"use client";

import { useEffect, useState } from "react";
import { Copy, ExternalLink, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const RELATIVE_PATH_PREFIX = "/shop/";

export function StorefrontLink({ ownerId }: { ownerId: string }) {
  const [copied, setCopied] = useState(false);
  // Start with the relative path so server and client render identically;
  // swap in the full origin only after mount to avoid a hydration mismatch.
  const [displayUrl, setDisplayUrl] = useState(`${RELATIVE_PATH_PREFIX}${ownerId}`);

  useEffect(() => {
    Promise.resolve().then(() => {
      setDisplayUrl(`${window.location.origin}${RELATIVE_PATH_PREFIX}${ownerId}`);
    });
  }, [ownerId]);

  async function handleCopy() {
    await navigator.clipboard.writeText(displayUrl);
    setCopied(true);
    toast.success("Storefront link copied");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input readOnly value={displayUrl} className="font-mono text-xs" />
        <Button type="button" variant="secondary" size="icon" onClick={handleCopy} aria-label="Copy storefront link">
          {copied ? <Check /> : <Copy />}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          nativeButton={false}
          render={
            <a href={displayUrl} target="_blank" rel="noreferrer" aria-label="Open storefront">
              <ExternalLink />
            </a>
          }
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Share this link with customers — it opens your shop inside the Bharat Store marketplace, where
        they sign in and order for delivery. Your shop also appears automatically in the marketplace
        directory and cross-shop search alongside every other shop.
      </p>
    </div>
  );
}
