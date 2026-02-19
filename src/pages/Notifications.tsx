import { Package, ShieldAlert, Server } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { useNotifications, type NotificationType, type NotificationPriority } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";
import { useState } from "react";

const TYPE_ICON: Record<NotificationType, React.ElementType> = {
  inventory: Package,
  system: Server,
  security: ShieldAlert,
};

const TYPE_LABEL: Record<NotificationType, string> = {
  inventory: "Inventory",
  system: "System",
  security: "Security",
};

const PRIORITY_CLASS: Record<NotificationPriority, string> = {
  normal: "text-muted-foreground",
  warning: "text-warning",
  critical: "text-destructive",
};

type FilterType = "all" | NotificationType;

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, timeAgo } = useNotifications();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = filter === "all" ? notifications : notifications.filter((n) => n.type === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <PageHeader title="Notifications" subtitle={`${unreadCount} unread`} />
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      <div className="flex gap-1.5">
        {(["all", "inventory", "system", "security"] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1.5 rounded text-[12px] font-medium transition-colors border",
              filter === f
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary text-secondary-foreground border-border hover:bg-secondary/80"
            )}
          >
            {f === "all" ? "All" : TYPE_LABEL[f]}
          </button>
        ))}
      </div>

      <div className="space-y-1">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">No notifications found.</div>
        ) : (
          filtered.map((n) => {
            const Icon = TYPE_ICON[n.type];
            return (
              <button
                key={n.id}
                onClick={() => {
                  markAsRead(n.id);
                  if (n.redirect_url) navigate(n.redirect_url);
                }}
                className={cn(
                  "w-full flex items-start gap-3 px-4 py-3 text-left rounded-md border transition-colors",
                  !n.is_read
                    ? "bg-accent/5 border-accent/20 hover:bg-accent/10"
                    : "bg-card border-border hover:bg-secondary/50"
                )}
              >
                <div className={cn("mt-0.5 shrink-0", PRIORITY_CLASS[n.priority])}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[13px]", !n.is_read ? "font-semibold text-foreground" : "text-muted-foreground font-medium")}>
                      {n.title}
                    </span>
                    {!n.is_read && <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />}
                    <span className="ml-auto text-[11px] text-muted-foreground/70 shrink-0">
                      {timeAgo(n.created_at)}
                    </span>
                  </div>
                  <p className="text-[12px] text-muted-foreground mt-0.5">{n.message}</p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
