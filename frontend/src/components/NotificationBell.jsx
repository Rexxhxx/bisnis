import { useEffect, useState, useCallback } from "react";
import { Bell, CheckCheck, CheckCircle2, XCircle, Info } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const ICONS = {
  success: { Icon: CheckCircle2, cls: "text-green-600 dark:text-green-400" },
  error: { Icon: XCircle, cls: "text-red-600 dark:text-red-400" },
  info: { Icon: Info, cls: "text-blue-600 dark:text-blue-400" },
};

export function NotificationBell() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/notifications");
      setItems(data);
    } catch (e) {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  const unread = items.filter((n) => !n.read).length;

  const markAll = async () => {
    await api.post("/notifications/read-all");
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const onOpenChange = (o) => {
    setOpen(o);
    if (o && unread > 0) {
      // mark read shortly after opening
      setTimeout(markAll, 1200);
    }
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full" data-testid="notification-bell-btn">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span
              data-testid="notification-badge"
              className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground"
            >
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0" data-testid="notification-panel">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="font-heading text-sm font-bold">Notifikasi</span>
          {unread > 0 && (
            <button onClick={markAll} className="flex items-center gap-1 text-xs text-primary hover:underline" data-testid="notif-mark-all-btn">
              <CheckCheck className="h-3.5 w-3.5" /> Tandai dibaca
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">Belum ada notifikasi</div>
          ) : (
            items.map((n) => {
              const { Icon, cls } = ICONS[n.type] || ICONS.info;
              return (
                <div key={n.id} className={`flex gap-3 border-b border-border px-4 py-3 ${!n.read ? "bg-secondary/40" : ""}`}>
                  <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${cls}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{n.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{n.message}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
