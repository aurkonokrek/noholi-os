import { useState, useCallback } from "react";

export type NotificationType = "inventory" | "system" | "security";
export type NotificationPriority = "normal" | "warning" | "critical";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  is_read: boolean;
  created_at: string;
  redirect_url?: string;
  admin_id?: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Low Stock Warning",
    message: "\"Introduction to Algorithms\" has only 1 copy remaining.",
    type: "inventory",
    priority: "warning",
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    redirect_url: "/inventory",
  },
  {
    id: "2",
    title: "Overdue Return",
    message: "Member Sarah K. has 2 books overdue by 5 days.",
    type: "inventory",
    priority: "critical",
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    redirect_url: "/lending",
  },
  {
    id: "3",
    title: "Backup Completed",
    message: "System backup finished successfully at 03:00 AM.",
    type: "system",
    priority: "normal",
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    redirect_url: "/settings",
  },
  {
    id: "4",
    title: "Failed Login Attempt",
    message: "3 failed login attempts detected from IP 192.168.1.45.",
    type: "security",
    priority: "critical",
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    redirect_url: "/settings",
  },
  {
    id: "5",
    title: "Password Changed",
    message: "Admin password was updated successfully.",
    type: "security",
    priority: "normal",
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "6",
    title: "Item Marked Lost",
    message: "\"Data Structures in C\" marked as lost by staff.",
    type: "inventory",
    priority: "warning",
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    redirect_url: "/inventory",
  },
  {
    id: "7",
    title: "Configuration Updated",
    message: "System timezone changed to Africa/Nairobi.",
    type: "system",
    priority: "normal",
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    redirect_url: "/settings",
  },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }, []);

  return { notifications, unreadCount, markAsRead, markAllAsRead, timeAgo };
}
