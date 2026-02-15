import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";
import type { UserRole } from "@/lib/navigation";
import { RoleProvider } from "@/lib/roles";

interface AppLayoutProps {
  role: UserRole;
}

export function AppLayout({ role }: AppLayoutProps) {
  return (
    <RoleProvider value={role}>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar role={role} />
        <div className="flex flex-1 flex-col min-w-0">
          <TopBar />
          <main className="flex-1 overflow-auto p-5">
            <Outlet />
          </main>
        </div>
      </div>
    </RoleProvider>
  );
}
