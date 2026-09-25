import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Member {
  memberId: string;
  name: string;
  email: string;
  phone: string;
  activeLoans: number;
  fines: number;
  status: "Active" | "Suspended" | "Expired";
  avatar?: string;
  addressLine: string;
  city: string;
  district: string;
  postalCode: string;
  meritGrade: MeritGrade;
  meritNote: string;
  joinDate: string;
}

export const MERIT_GRADES = ["A", "B", "C", "D", "E", "Not Assigned"] as const;
export type MeritGrade = typeof MERIT_GRADES[number];

function dbToMember(row: any): Member {
  return {
    memberId: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? "",
    activeLoans: row.active_loans ?? 0,
    fines: Number(row.fines) || 0,
    status: row.status as Member["status"],
    avatar: row.avatar ?? undefined,
    addressLine: row.address_line ?? "",
    city: row.city ?? "",
    district: row.district ?? "",
    postalCode: row.postal_code ?? "",
    meritGrade: (MERIT_GRADES as readonly string[]).includes(row.merit_grade) ? row.merit_grade : "Not Assigned",
    meritNote: row.merit_note ?? "",
    joinDate: row.created_at ?? "",
  };
}

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.from("members").select("*").order("id");
        if (error) throw error;
        setMembers((data ?? []).map(dbToMember));
      } catch (err) {
        console.error("Failed to load members:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const addMember = useCallback(async (member: { name: string; email: string; phone: string }) => {
    const id = `MEM-${String(members.length + 1001).padStart(4, "0")}`;
    const newMember: Member = { memberId: id, ...member, activeLoans: 0, fines: 0, status: "Active", addressLine: "", city: "", district: "", postalCode: "", meritGrade: "Not Assigned", meritNote: "", joinDate: new Date().toISOString() };
    setMembers((prev) => [newMember, ...prev]);
    await supabase.from("members").insert({
      id, name: member.name, email: member.email, phone: member.phone,
      active_loans: 0, fines: 0, status: "Active",
    });
    return id;
  }, [members.length]);

  const updateStatus = useCallback(async (memberId: string, newStatus: Member["status"]) => {
    setMembers((prev) => prev.map((m) => m.memberId === memberId ? { ...m, status: newStatus } : m));
    await supabase.from("members").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", memberId);
  }, []);

  const updateMember = useCallback(async (memberId: string, updates: Partial<Pick<Member, "name" | "email" | "phone" | "status" | "addressLine" | "city" | "district" | "postalCode" | "meritGrade" | "meritNote">>) => {
    setMembers((prev) => prev.map((m) => m.memberId === memberId ? { ...m, ...updates } : m));
    const dbUpdates: any = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.addressLine !== undefined) dbUpdates.address_line = updates.addressLine;
    if (updates.city !== undefined) dbUpdates.city = updates.city;
    if (updates.district !== undefined) dbUpdates.district = updates.district;
    if (updates.postalCode !== undefined) dbUpdates.postal_code = updates.postalCode;
    if (updates.meritGrade !== undefined) dbUpdates.merit_grade = updates.meritGrade;
    if (updates.meritNote !== undefined) dbUpdates.merit_note = updates.meritNote;
    await supabase.from("members").update(dbUpdates).eq("id", memberId);
  }, []);

  const deleteMember = useCallback(async (memberId: string) => {
    setMembers((prev) => prev.filter((m) => m.memberId !== memberId));
    await supabase.from("members").delete().eq("id", memberId);
  }, []);

  const archiveMember = useCallback(async (memberId: string) => {
    setMembers((prev) => prev.map((m) => m.memberId === memberId ? { ...m, status: "Expired" as const } : m));
    await supabase.from("members").update({ status: "Expired", updated_at: new Date().toISOString() }).eq("id", memberId);
  }, []);

  return { members, loading, addMember, updateStatus, updateMember, deleteMember, archiveMember };
}
