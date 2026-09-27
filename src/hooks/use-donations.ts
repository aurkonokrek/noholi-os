import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ReviewStatus = "Pending" | "Approved" | "Rejected" | "Added to Inventory";

export interface Donation {
  id: string;
  donorName: string;
  donorContact: string;
  bookTitle: string;
  bookAuthor: string;
  condition: "New" | "Good" | "Fair" | "Poor";
  dateReceived: string;
  notes: string;
  reviewStatus: ReviewStatus;
  rejectionReason: string;
  assignedAccessionId?: string;
}

export interface DonationInput {
  donorName: string;
  donorContact: string;
  bookTitle: string;
  bookAuthor: string;
  condition: Donation["condition"];
  dateReceived: string;
  notes: string;
}

function dbToDonation(row: any): Donation {
  return {
    id: row.id,
    donorName: row.donor_name,
    donorContact: row.donor_contact ?? "",
    bookTitle: row.book_title,
    bookAuthor: row.book_author ?? "",
    condition: row.condition as Donation["condition"],
    dateReceived: row.date_received,
    notes: row.notes ?? "",
    reviewStatus: row.review_status as ReviewStatus,
    rejectionReason: row.rejection_reason ?? "",
    assignedAccessionId: row.assigned_accession_id || undefined,
  };
}

function inputToDb(d: DonationInput) {
  return {
    donor_name: d.donorName,
    donor_contact: d.donorContact,
    book_title: d.bookTitle,
    book_author: d.bookAuthor,
    condition: d.condition,
    date_received: d.dateReceived,
    notes: d.notes,
  };
}

const rpc = supabase.rpc.bind(supabase) as unknown as (fn: string, args?: Record<string, unknown>) => Promise<{ data: any; error: any }>;

export function useDonations() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  const replace = (row: any) => {
    const d = dbToDonation(row);
    setDonations((prev) => prev.map((x) => (x.id === d.id ? d : x)));
    return d;
  };

  const reload = useCallback(async () => {
    const { data, error } = await supabase.from("donations").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    setDonations((data ?? []).map(dbToDonation));
  }, []);

  useEffect(() => {
    reload().catch((err) => console.error("Failed to load donations:", err)).finally(() => setLoading(false));
  }, [reload]);

  const addDonation = useCallback(async (input: DonationInput) => {
    const { data: nextId, error: idErr } = await rpc("next_donation_id");
    if (idErr || !nextId) throw new Error(idErr?.message ?? "Could not generate donation ID");
    const { data, error } = await supabase
      .from("donations")
      .insert({ id: nextId as string, ...inputToDb(input), review_status: "Pending" })
      .select()
      .single();
    if (error) throw error;
    const d = dbToDonation(data);
    setDonations((prev) => [d, ...prev]);
    return d.id;
  }, []);

  const updateDonation = useCallback(async (id: string, input: DonationInput) => {
    const { data, error } = await supabase
      .from("donations").update(inputToDb(input)).eq("id", id).eq("review_status", "Pending").select().maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("Only Pending donations can be edited.");
    return replace(data);
  }, []);

  const approve = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from("donations").update({ review_status: "Approved" }).eq("id", id).eq("review_status", "Pending").select().maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("Only Pending donations can be approved.");
    return replace(data);
  }, []);

  const reject = useCallback(async (id: string, reason: string) => {
    const r = reason.trim();
    if (!r) throw new Error("A rejection reason is required.");
    const { data, error } = await supabase
      .from("donations").update({ review_status: "Rejected", rejection_reason: r }).eq("id", id).eq("review_status", "Pending").select().maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("Only Pending donations can be rejected.");
    return replace(data);
  }, []);

  /** Atomically creates one Inventory book and links it. Safe against double submission. */
  const addToInventory = useCallback(async (id: string) => {
    const { data: bookId, error } = await rpc("add_donation_to_inventory", { _donation_id: id });
    if (error) {
      await reload().catch(() => {});
      throw new Error(error.message);
    }
    const { data } = await supabase.from("donations").select("*").eq("id", id).single();
    if (data) replace(data);
    return bookId as string;
  }, [reload]);

  const deleteDonation = useCallback(async (id: string) => {
    const { error } = await supabase.from("donations").delete().eq("id", id);
    if (error) throw error;
    setDonations((prev) => prev.filter((d) => d.id !== id));
  }, []);

  return { donations, loading, addDonation, updateDonation, approve, reject, addToInventory, deleteDonation };
}
