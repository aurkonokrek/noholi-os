import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { NAV_ITEMS, type UserRole } from "@/lib/navigation";
import {
  LayoutDashboard,
  BookOpen,
  ArrowLeftRight,
  Users,
  Gift,
  BadgeDollarSign,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  Dashboard: LayoutDashboard,
  Inventory: BookOpen,
  Lending: ArrowLeftRight,
  Members: Users,
  "Book Donations": Gift,
  Fines: BadgeDollarSign,
  Reports: BarChart3,
  Settings: Settings,
};

interface AppSidebarProps {
  role: UserRole;
}

export function AppSidebar({ role }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <aside
      className={`flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-200 ${
        collapsed ? "w-14" : "w-56"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-12 px-3 border-b border-sidebar-border">
        {!collapsed && (
          <span className="text-sm font-semibold tracking-wide">NOHOLI</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-sidebar-accent text-sidebar-muted transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 space-y-0.5 px-2">
        {visibleItems.map((item) => {
          const Icon = ICON_MAP[item.title];
          const active = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-2.5 px-2.5 py-2 text-[13px] rounded transition-colors ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
              title={collapsed ? item.title : undefined}
            >
              {Icon && <Icon className="h-4 w-4 shrink-0" />}
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Role indicator */}
      <div className="px-3 py-3 border-t border-sidebar-border">
        {!collapsed && (
          <span className="text-[11px] uppercase tracking-wider text-sidebar-muted">
            {role}
          </span>
        )}
      </div>
    </aside>
  );
}
