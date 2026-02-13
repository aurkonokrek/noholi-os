export type UserRole = "admin" | "staff" | "manager";

export interface NavItem {
  title: string;
  href: string;
  roles: UserRole[];
}

export const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", href: "/", roles: ["admin", "staff", "manager"] },
  { title: "Inventory", href: "/inventory", roles: ["admin", "staff"] },
  { title: "Lending", href: "/lending", roles: ["admin", "staff"] },
  { title: "Members", href: "/members", roles: ["admin", "staff"] },
  { title: "Donations", href: "/donations", roles: ["admin", "staff"] },
  { title: "Fines", href: "/fines", roles: ["admin", "staff"] },
  { title: "Reports", href: "/reports", roles: ["admin", "manager"] },
  { title: "Settings", href: "/settings", roles: ["admin"] },
];
