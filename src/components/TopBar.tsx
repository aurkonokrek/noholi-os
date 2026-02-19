import { Search } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";

export function TopBar() {
  return (
    <header className="h-12 flex items-center gap-4 px-4 border-b border-border bg-card">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search books, members, transactions…"
          className="w-full h-8 pl-8 pr-3 text-[13px] bg-secondary border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
        />
      </div>
      <div className="ml-auto flex items-center gap-3">
        <NotificationBell />
        <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[11px] font-semibold">
          A
        </div>
      </div>
    </header>
  );
}
