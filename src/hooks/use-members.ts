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
}

const SEED_MEMBERS: Member[] = [
  { memberId: "MEM-1001", name: "Alice Mwangi", email: "alice@email.com", phone: "+254712345678", activeLoans: 2, fines: 0, status: "Active" },
  { memberId: "MEM-1002", name: "James Oloo", email: "james@email.com", phone: "+254723456789", activeLoans: 0, fines: 150, status: "Active" },
  { memberId: "MEM-1003", name: "John Otieno", email: "john@email.com", phone: "+254734567890", activeLoans: 0, fines: 500, status: "Suspended" },
  { memberId: "MEM-1004", name: "Sarah Njoki", email: "sarah@email.com", phone: "+254745678901", activeLoans: 1, fines: 0, status: "Active" },
  { memberId: "MEM-1005", name: "Peter Kamau", email: "peter@email.com", phone: "+254756789012", activeLoans: 1, fines: 75, status: "Active" },
  { memberId: "MEM-1006", name: "Grace Wambui", email: "grace@email.com", phone: "+254767890123", activeLoans: 1, fines: 0, status: "Active" },
  { memberId: "MEM-1007", name: "Daniel Kipchoge", email: "daniel@email.com", phone: "+254778901234", activeLoans: 1, fines: 200, status: "Active" },
  { memberId: "MEM-1008", name: "Faith Achieng", email: "faith@email.com", phone: "+254789012345", activeLoans: 1, fines: 0, status: "Active" },
  { memberId: "MEM-1009", name: "Moses Wekesa", email: "moses@email.com", phone: "+254790123456", activeLoans: 0, fines: 0, status: "Expired" },
  { memberId: "MEM-1010", name: "Lydia Chebet", email: "lydia@email.com", phone: "+254701234567", activeLoans: 0, fines: 350, status: "Suspended" },
];

function dbToMember(row: any): Member {
  return {
    memberId: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? "",
    activeLoans: row.active_loans ?? 0,
    fines: Number(row.fines) ?? 0,
    status: row.status as Member["status"],
    avatar: row.avatar ?? undefined,
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
        if (data && data.length > 0) {
          setMembers(data.map(dbToMember));
        } else {
          // Seed
          const rows = SEED_MEMBERS.map((m) => ({
            id: m.memberId, name: m.name, email: m.email, phone: m.phone,
            active_loans: m.activeLoans, fines: m.fines, status: m.status,
          }));
          await supabase.from("members").insert(rows);
          setMembers(SEED_MEMBERS);
        }
      } catch (err) {
        console.error("Failed to load members:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const addMember = useCallback(async (member: { name: string; email: string; phone: string }) => {
    const id = `MEM-${String(members.length + 1001).padStart(4, "0")}`;
    const newMember: Member = { memberId: id, ...member, activeLoans: 0, fines: 0, status: "Active" };
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

  return { members, loading, addMember, updateStatus };
}
