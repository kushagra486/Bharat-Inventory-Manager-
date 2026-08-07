"use client";

import { useState, useTransition } from "react";
import { Copy, Plus, Trash2, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { inviteStaff, removeStaff } from "@/app/dashboard/settings/staff-actions";
import type { Tables } from "@/lib/supabase/types";

type Staff = Tables<"shop_staff">;

export function StaffPanel({ staff }: { staff: Staff[] }) {
  const [open, setOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleInvite(formData: FormData) {
    startTransition(async () => {
      try {
        await inviteStaff(String(formData.get("fullName") ?? ""));
        toast.success("Staff invite created");
        setOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  function handleRemove(id: string) {
    startTransition(async () => {
      try {
        await removeStaff(id);
        toast.success("Staff member removed");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  async function handleCopyCode(id: string, code: string) {
    await navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success("Invite code copied");
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        Staff sign up on their own with the invite code below and get POS-only access — they
        can ring up sales and view orders, but can&apos;t see Products, Reports, or Settings.
      </p>

      {staff.length === 0 ? (
        <p className="text-sm text-muted-foreground">No staff added yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {staff.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between rounded-md border p-3 text-sm"
            >
              <div className="flex items-center gap-2">
                <span>{s.full_name}</span>
                <Badge variant={s.auth_user_id ? "default" : "secondary"}>
                  {s.auth_user_id ? "Joined" : "Pending"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {!s.auth_user_id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyCode(s.id, s.invite_code)}
                    className="font-mono text-xs"
                  >
                    {copiedId === s.id ? <Check className="size-3" /> : <Copy className="size-3" />}
                    {s.invite_code}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isPending}
                  onClick={() => handleRemove(s.id)}
                  aria-label="Remove staff"
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            <Button variant="secondary" size="sm" className="self-start">
              <Plus />
              Invite staff
            </Button>
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite a staff member</DialogTitle>
          </DialogHeader>
          <form action={handleInvite} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="fullName">Name</Label>
              <Input id="fullName" name="fullName" required />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Generate invite code"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
