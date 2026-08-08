"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  createNotificationSetting,
  deleteNotificationSetting,
  toggleNotificationSetting,
} from "@/app/dashboard/settings/actions";
import dynamic from "next/dynamic";
import type { Tables } from "@/lib/supabase/types";

// isPushSupported() reads navigator/window, which don't exist during SSR —
// rendering this client-only avoids a hydration mismatch on that check.
const PushSubscribe = dynamic(
  () => import("@/app/dashboard/settings/push-subscribe").then((m) => m.PushSubscribe),
  { ssr: false },
);

type NotificationSetting = Tables<"notification_settings">;

export function NotificationSettings({ settings }: { settings: NotificationSetting[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleAdd(formData: FormData) {
    startTransition(async () => {
      try {
        await createNotificationSetting(formData);
        toast.success("Reminder added");
        setOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  function handleToggle(setting: NotificationSetting) {
    startTransition(async () => {
      try {
        await toggleNotificationSetting(setting.id, !setting.is_enabled);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteNotificationSetting(id);
        toast.success("Reminder removed");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <PushSubscribe />
      {settings.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reminders configured yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {settings.map((s) => (
            <li key={s.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
              <span>
                {s.days_before} day{s.days_before !== 1 ? "s" : ""} before expiry · {s.channel}
              </span>
              <div className="flex items-center gap-2">
                <Badge
                  variant={s.is_enabled ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleToggle(s)}
                >
                  {s.is_enabled ? "Enabled" : "Disabled"}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  disabled={isPending}
                  onClick={() => handleDelete(s.id)}
                >
                  <Trash2 />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            <Button variant="secondary" size="sm" className="w-fit">
              <Plus />
              Add reminder
            </Button>
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add expiry reminder</DialogTitle>
          </DialogHeader>
          <form action={handleAdd} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="days_before">Days before expiry</Label>
              <Input id="days_before" name="days_before" type="number" min={1} defaultValue={7} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="channel">Channel</Label>
              <Select name="channel" defaultValue="push">
                <SelectTrigger id="channel" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="push">Push</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Adding..." : "Add reminder"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
