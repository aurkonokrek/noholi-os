import { Bell, Package, ShieldAlert, Server, AlertTriangle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useNotifications, type Notification, type NotificationType, type NotificationPriority } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";
import { useState } from "react";

const TYPE_ICON: Record<NotificationType, React.ElementType> = {
  inventory: Package,
  system: Server,
  security: ShieldAlert,
};

const PRIORITY_CLASS: Record<NotificationPriority, string> = {
  normal: "text-muted-foreground",
  warning: "text-warning",
  critical: "text-destructive",
};

function NotificationItem({
  notification,
  onRead,
  onNavigate,
  timeAgo,
}: {
  notification: Notification;
  onRead: (id: string) => void;
  onNavigate: (url?: string) => void;
  timeAgo: (d: string) => string;
}) {
  const Icon = TYPE_ICON[notification.type];

  return (
    <button
      onClick={() => {
        onRead(notification.id);
        onNavigate(notification.redirect_url);
      }}
      className={cn(
        "w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-secondary/60 transition-colors rounded-md",
        !notification.is_read && "bg-accent/5"
      )}
    >
      <div className={cn("mt-0.5 shrink-0", PRIORITY_CLASS[notification.priority])}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn("text-[13px] leading-tight truncate", !notification.is_read ? "font-semibold text-foreground" : "font-medium text-muted-foreground")}>
            {notification.title}
          </span>
          {!notification.is_read && (
            <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
          )}
        </div>
        <p className="text-[12px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <span className="text-[11px] text-muted-foreground/70 mt-1 block">
          {timeAgo(notification.created_at)}
        </span>
      </div>
    </button>
  );
}

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, timeAgo } = useNotifications();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const recent = notifications.slice(0, 7);

  const handleNavigate = (url?: string) => {
    setOpen(false);
    if (url) navigate(url);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative h-8 w-8 flex items-center justify-center rounded-md hover:bg-secondary transition-colors">
          <Bell className="h-4 w-4 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-1 leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-[360px] p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h4 className="text-sm font-semibold text-foreground">Notifications</h4>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-[12px] text-accent hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>
        <ScrollArea className="max-h-[380px]">
          <div className="p-1.5">
            {recent.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No new notifications
              </div>
            ) : (
              recent.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onRead={markAsRead}
                  onNavigate={handleNavigate}
                  timeAgo={timeAgo}
                />
              ))
            )}
          </div>
        </ScrollArea>
        <div className="border-t border-border px-4 py-2.5">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-[12px] text-accent hover:text-accent"
            onClick={() => {
              setOpen(false);
              navigate("/notifications");
            }}
          >
            View All Notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
