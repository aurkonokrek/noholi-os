import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { issueCopy, returnCopy } from "@/hooks/use-inventory";

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
  const status = computeStatus(row.due_date, row.return_date, row.status);
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
    notes: row.notes || "",
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

    // Shared inventory layer owns the copy counts (and its own validation)
    if (!input.bookId) return { success: false, error: "Select a book from the inventory" };
    const inventoryResult = await issueCopy(input.bookId);
    if (!inventoryResult.success) return { success: false, error: inventoryResult.error };

    const { error } = await supabase.from("loans").insert(row);
    if (error) {
      await returnCopy(input.bookId); // revert the inventory movement
      return { success: false, error: error.message };
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
      notes: "",
    };
    setLoans((prev) => [newLoan, ...prev]);
    return { success: true, id };
  }, [loans.length]);

  const returnLoan = useCallback(async (loanId: string): Promise<{ success: boolean; error?: string; fine?: number }> => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return { success: false, error: "Loan not found" };
    if (loan.status === "Returned") return { success: false, error: "This loan has already been returned" };
    if (loan.status === "Cancelled") return { success: false, error: "This loan was cancelled" };

    const returnDate = new Date().toISOString().split("T")[0];
    const fine = computeFine(loan.dueDate, returnDate);

    // Shared inventory layer owns the copy counts (and its own validation)
    if (loan.bookId) {
      const inventoryResult = await returnCopy(loan.bookId);
      if (!inventoryResult.success) return { success: false, error: inventoryResult.error };
    }

    const { error } = await supabase.from("loans").update({
      status: "Returned",
      return_date: returnDate,
      fine_amount: fine,
    }).eq("id", loanId);
    if (error) {
      if (loan.bookId) await issueCopy(loan.bookId); // revert the inventory movement
      return { success: false, error: error.message };
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

  const updateLoan = useCallback(async (loanId: string, updates: {
    dueDate: string;
    guarantorName: string;
    guarantorPhone: string;
    guarantorEmail: string;
    guarantorRelationship: string;
    guarantorStreet: string;
    guarantorCity: string;
    guarantorDistrict: string;
    guarantorPostalCode: string;
    notes: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase.from("loans").update({
      due_date: updates.dueDate,
      guarantor_name: updates.guarantorName,
      guarantor_phone: updates.guarantorPhone,
      guarantor_email: updates.guarantorEmail,
      guarantor_relationship: updates.guarantorRelationship,
      guarantor_street: updates.guarantorStreet,
      guarantor_city: updates.guarantorCity,
      guarantor_district: updates.guarantorDistrict,
      guarantor_postal_code: updates.guarantorPostalCode,
      notes: updates.notes,
    }).eq("id", loanId);
    if (error) return { success: false, error: error.message };

    setLoans((prev) =>
      prev.map((l) =>
        l.id === loanId
          ? {
              ...l,
              dueDate: updates.dueDate,
              status: computeStatus(updates.dueDate, l.returnDate, l.status === "Cancelled" ? "Cancelled" : undefined),
              fineAmount: computeFine(updates.dueDate, l.returnDate),
              guarantor: {
                name: updates.guarantorName,
                phone: updates.guarantorPhone,
                email: updates.guarantorEmail,
                relationship: updates.guarantorRelationship,
                street: updates.guarantorStreet,
                city: updates.guarantorCity,
                district: updates.guarantorDistrict,
                postalCode: updates.guarantorPostalCode,
              },
              notes: updates.notes,
            }
          : l
      )
    );
    return { success: true };
  }, [loans]);

  const cancelLoan = useCallback(async (loanId: string): Promise<{ success: boolean; error?: string }> => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return { success: false, error: "Loan not found" };
    if (loan.status === "Returned" || loan.status === "Cancelled") return { success: false, error: "Cannot cancel this loan" };

    const { error } = await supabase.from("loans").update({ status: "Cancelled" }).eq("id", loanId);
    if (error) return { success: false, error: error.message };

    // Restore book availability
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
    const { data: memberData } = await supabase.from("members").select("active_loans").eq("id", loan.memberId).single();
    if (memberData) {
      await supabase.from("members").update({
        active_loans: Math.max(0, memberData.active_loans - 1),
        updated_at: new Date().toISOString(),
      }).eq("id", loan.memberId);
    }

    setLoans((prev) =>
      prev.map((l) => l.id === loanId ? { ...l, status: "Cancelled" as const } : l)
    );
    return { success: true };
  }, [loans]);

  return { loans, loading, issueLoan, returnLoan, extendLoan, updateLoan, cancelLoan, refetch: fetchLoans };
}
