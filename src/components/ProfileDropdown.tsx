import { LogOut, User, Settings } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ProfileDropdown() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const initial = user?.email?.[0]?.toUpperCase() ?? "A";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[11px] font-semibold focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1">
          {initial}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-[13px] font-medium text-foreground">Admin</p>
            <p className="text-[11px] text-muted-foreground truncate">{user?.email ?? "—"}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-[13px] gap-2 cursor-pointer" onClick={() => navigate("/settings")}>
          <Settings className="h-3.5 w-3.5" /> Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-[13px] gap-2 cursor-pointer text-destructive focus:text-destructive" onClick={() => signOut()}>
          <LogOut className="h-3.5 w-3.5" /> Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
