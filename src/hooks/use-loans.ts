import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface GuarantorDetails {
  name: string;
  phone: string;
  email: string;
  relationship: string;
  street: string;
  city: string;
  district: string;
  postalCode: string;
}

export interface ActiveLoan {
  id: string;
  member: string;
  memberId: string;
  book: string;
  bookId: string;
  accessionId: string;
  issuedDate: string;
  dueDate: string;
  returnDate: string | null;
  status: "Active" | "Overdue" | "Returned" | "Cancelled";
  guarantor: GuarantorDetails;
  fineAmount: number;
  notes: string;
}

const FINE_PER_DAY = 10; // currency units per overdue day

function computeStatus(dueDate: string, returnDate: string | null, dbStatus?: string): ActiveLoan["status"] {
  if (dbStatus === "Cancelled") return "Cancelled";
  if (returnDate) return "Returned";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today ? "Overdue" : "Active";
}

function computeFine(dueDate: string, returnDate: string | null): number {
  const end = returnDate ? new Date(returnDate) : new Date();
  end.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((end.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays * FINE_PER_DAY : 0;
}

function dbToLoan(row: any): ActiveLoan {
  const status = computeStatus(row.due_date, row.return_date);
  const fineAmount = computeFine(row.due_date, row.return_date);
  return {
    id: row.id,
    member: row.member_name,
    memberId: row.member_id,
    book: row.book_title,
    bookId: row.book_id || "",
    accessionId: row.accession_id,
    issuedDate: row.issued_date,
    dueDate: row.due_date,
    returnDate: row.return_date || null,
    status,
    guarantor: {
      name: row.guarantor_name || "",
      phone: row.guarantor_phone || "",
      email: row.guarantor_email || "",
      relationship: row.guarantor_relationship || "",
      street: row.guarantor_street || "",
      city: row.guarantor_city || "",
      district: row.guarantor_district || "",
      postalCode: row.guarantor_postal_code || "",
    },
    fineAmount,
  };
}

export interface IssueLoanInput {
  memberId: string;
  memberName: string;
  bookId: string;
  bookTitle: string;
  accessionId: string;
  dueDate: string;
  guarantor: GuarantorDetails;
}

export function useLoans() {
  const [loans, setLoans] = useState<ActiveLoan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLoans = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("loans")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (data) {
        setLoans(data.map(dbToLoan));
      }
    } catch (err) {
      console.error("Failed to load loans:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const issueLoan = useCallback(async (input: IssueLoanInput): Promise<{ success: boolean; error?: string; id?: string }> => {
    // Generate loan ID
    const count = loans.length;
    const id = `LN-${String(count + 401).padStart(4, "0")}`;
    const issuedDate = new Date().toISOString().split("T")[0];

    const row = {
      id,
      member_name: input.memberName,
      member_id: input.memberId,
      book_title: input.bookTitle,
      accession_id: input.accessionId,
      issued_date: issuedDate,
      due_date: input.dueDate,
      status: "Active",
      guarantor_name: input.guarantor.name,
      guarantor_phone: input.guarantor.phone,
      guarantor_email: input.guarantor.email,
      guarantor_relationship: input.guarantor.relationship,
      guarantor_street: input.guarantor.street,
      guarantor_city: input.guarantor.city,
      guarantor_district: input.guarantor.district,
      guarantor_postal_code: input.guarantor.postalCode,
      fine_amount: 0,
    };

    const { error } = await supabase.from("loans").insert(row);
    if (error) return { success: false, error: error.message };

    // Update book: increment issued_copies, decrement available_copies
    if (input.bookId) {
      const { data: bookData } = await supabase.from("books").select("issued_copies, available_copies").eq("id", input.bookId).single();
      if (bookData) {
        await supabase.from("books").update({
          issued_copies: bookData.issued_copies + 1,
          available_copies: Math.max(0, bookData.available_copies - 1),
          updated_at: new Date().toISOString(),
        }).eq("id", input.bookId);
      }
    }

    // Update member active_loans
    const { data: memberData } = await supabase.from("members").select("active_loans").eq("id", input.memberId).single();
    if (memberData) {
      await supabase.from("members").update({
        active_loans: memberData.active_loans + 1,
        updated_at: new Date().toISOString(),
      }).eq("id", input.memberId);
    }

    const newLoan: ActiveLoan = {
      id,
      member: input.memberName,
      memberId: input.memberId,
      book: input.bookTitle,
      bookId: input.bookId,
      accessionId: input.accessionId,
      issuedDate,
      dueDate: input.dueDate,
      returnDate: null,
      status: "Active",
      guarantor: input.guarantor,
      fineAmount: 0,
    };
    setLoans((prev) => [newLoan, ...prev]);
    return { success: true, id };
  }, [loans.length]);

  const returnLoan = useCallback(async (loanId: string): Promise<{ success: boolean; error?: string; fine?: number }> => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return { success: false, error: "Loan not found" };

    const returnDate = new Date().toISOString().split("T")[0];
    const fine = computeFine(loan.dueDate, returnDate);

    const { error } = await supabase.from("loans").update({
      status: "Returned",
      return_date: returnDate,
      fine_amount: fine,
    }).eq("id", loanId);
    if (error) return { success: false, error: error.message };

    // Update book: decrement issued, increment available
    if (loan.bookId) {
      const { data: bookData } = await supabase.from("books").select("issued_copies, available_copies").eq("id", loan.bookId).single();
      if (bookData) {
        await supabase.from("books").update({
          issued_copies: Math.max(0, bookData.issued_copies - 1),
          available_copies: bookData.available_copies + 1,
          updated_at: new Date().toISOString(),
        }).eq("id", loan.bookId);
      }
    }

    // Update member active_loans
    const { data: memberData } = await supabase.from("members").select("active_loans, fines").eq("id", loan.memberId).single();
    if (memberData) {
      await supabase.from("members").update({
        active_loans: Math.max(0, memberData.active_loans - 1),
        fines: Number(memberData.fines) + fine,
        updated_at: new Date().toISOString(),
      }).eq("id", loan.memberId);
    }

    setLoans((prev) =>
      prev.map((l) =>
        l.id === loanId
          ? { ...l, status: "Returned", returnDate, fineAmount: fine }
          : l
      )
    );

    return { success: true, fine };
  }, [loans]);

  const extendLoan = useCallback(async (loanId: string, newDueDate: string): Promise<{ success: boolean; error?: string }> => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return { success: false, error: "Loan not found" };
    if (loan.status === "Returned") return { success: false, error: "Cannot extend a returned loan" };

    const { error } = await supabase.from("loans").update({
      due_date: newDueDate,
      status: "Active",
    }).eq("id", loanId);
    if (error) return { success: false, error: error.message };

    setLoans((prev) =>
      prev.map((l) =>
        l.id === loanId
          ? { ...l, dueDate: newDueDate, status: computeStatus(newDueDate, l.returnDate), fineAmount: computeFine(newDueDate, l.returnDate) }
          : l
      )
    );
    return { success: true };
  }, [loans]);

  return { loans, loading, issueLoan, returnLoan, extendLoan, refetch: fetchLoans };
}
