import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";
import type { UserRole } from "@/lib/navigation";

interface AppLayoutProps {
  role: UserRole;
}

export function AppLayout({ role }: AppLayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <AppSidebar role={role} />
      <div className="flex flex-1 flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-auto p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
