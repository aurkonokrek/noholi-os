import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ActiveLoan {
  id: string;
  member: string;
  memberId: string;
  book: string;
  accessionId: string;
  issuedDate: string;
  dueDate: string;
  status: "Active" | "Overdue";
}

const SEED_LOANS: ActiveLoan[] = [
  { id: "LN-0401", member: "Alice Mwangi", memberId: "MEM-1001", book: "Sapiens", accessionId: "ACC-0002", issuedDate: "2026-01-28", dueDate: "2026-02-11", status: "Overdue" },
  { id: "LN-0402", member: "Sarah Njoki", memberId: "MEM-1004", book: "1984", accessionId: "ACC-0003", issuedDate: "2026-02-05", dueDate: "2026-02-19", status: "Active" },
  { id: "LN-0403", member: "Peter Kamau", memberId: "MEM-1005", book: "Beloved", accessionId: "ACC-0005", issuedDate: "2026-02-01", dueDate: "2026-02-15", status: "Active" },
  { id: "LN-0404", member: "Grace Wambui", memberId: "MEM-1006", book: "Half of a Yellow Sun", accessionId: "ACC-0008", issuedDate: "2026-02-08", dueDate: "2026-02-22", status: "Active" },
  { id: "LN-0405", member: "Daniel Kipchoge", memberId: "MEM-1007", book: "Atomic Habits", accessionId: "ACC-0007", issuedDate: "2026-01-25", dueDate: "2026-02-08", status: "Overdue" },
  { id: "LN-0406", member: "Faith Achieng", memberId: "MEM-1008", book: "Thinking, Fast and Slow", accessionId: "ACC-0011", issuedDate: "2026-02-10", dueDate: "2026-02-24", status: "Active" },
];

function dbToLoan(row: any): ActiveLoan {
  return {
    id: row.id,
    member: row.member_name,
    memberId: row.member_id,
    book: row.book_title,
    accessionId: row.accession_id,
    issuedDate: row.issued_date,
    dueDate: row.due_date,
    status: row.status as ActiveLoan["status"],
  };
}

export function useLoans() {
  const [loans, setLoans] = useState<ActiveLoan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.from("loans").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        if (data && data.length > 0) {
          setLoans(data.map(dbToLoan));
        } else {
          const rows = SEED_LOANS.map((l) => ({
            id: l.id, member_name: l.member, member_id: l.memberId,
            book_title: l.book, accession_id: l.accessionId,
            issued_date: l.issuedDate, due_date: l.dueDate, status: l.status,
          }));
          await supabase.from("loans").insert(rows);
          setLoans(SEED_LOANS);
        }
      } catch (err) {
        console.error("Failed to load loans:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const issueLoan = useCallback(async (loan: Omit<ActiveLoan, "id">) => {
    const id = `LN-${String(loans.length + 407).padStart(4, "0")}`;
    const newLoan: ActiveLoan = { id, ...loan };
    setLoans((prev) => [newLoan, ...prev]);
    await supabase.from("loans").insert({
      id, member_name: loan.member, member_id: loan.memberId,
      book_title: loan.book, accession_id: loan.accessionId,
      issued_date: loan.issuedDate, due_date: loan.dueDate, status: loan.status,
    });
    return id;
  }, [loans.length]);

  const returnLoan = useCallback(async (id: string) => {
    const loan = loans.find((l) => l.id === id);
    setLoans((prev) => prev.filter((l) => l.id !== id));
    await supabase.from("loans").delete().eq("id", id);
    return loan;
  }, [loans]);

  return { loans, loading, issueLoan, returnLoan };
}
