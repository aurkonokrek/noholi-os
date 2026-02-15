import { createContext, useContext } from "react";
import type { UserRole } from "@/lib/navigation";

const RoleContext = createContext<UserRole>("admin");

export const RoleProvider = RoleContext.Provider;

export function useRole(): UserRole {
  return useContext(RoleContext);
}

/** Returns true if the current role can perform write/mutate actions */
export function useCanWrite(): boolean {
  const role = useRole();
  return role === "admin" || role === "staff";
}

/** Returns true if the current role can perform destructive actions (delete, reject) */
export function useCanDelete(): boolean {
  return useRole() === "admin";
}

/** Returns true if the current role can access settings */
export function useCanAccessSettings(): boolean {
  return useRole() === "admin";
}
