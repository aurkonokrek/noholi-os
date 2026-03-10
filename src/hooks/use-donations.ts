import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ReviewStatus = "Pending" | "Approved" | "Rejected" | "Added to Inventory";

export interface Donation {
  id: string;
  donorName: string;
  bookTitle: string;
  condition: "New" | "Good" | "Fair" | "Poor";
  dateReceived: string;
  reviewStatus: ReviewStatus;
  assignedAccessionId?: string;
}

const SEED_DONATIONS: Donation[] = [
  { id: "DON-001", donorName: "Nairobi Book Club", bookTitle: "Sapiens", condition: "Good", dateReceived: "2026-02-12", reviewStatus: "Pending" },
  { id: "DON-002", donorName: "Mary Wanjiku", bookTitle: "Educated", condition: "New", dateReceived: "2026-02-10", reviewStatus: "Pending" },
  { id: "DON-003", donorName: "KCB Foundation", bookTitle: "The Art of War", condition: "Fair", dateReceived: "2026-02-08", reviewStatus: "Approved", assignedAccessionId: "ACC-0015" },
  { id: "DON-004", donorName: "Anonymous", bookTitle: "To Kill a Mockingbird", condition: "Good", dateReceived: "2026-02-05", reviewStatus: "Added to Inventory", assignedAccessionId: "ACC-0016" },
  { id: "DON-005", donorName: "Safaricom PLC", bookTitle: "Zero to One", condition: "New", dateReceived: "2026-02-03", reviewStatus: "Approved", assignedAccessionId: "ACC-0017" },
  { id: "DON-006", donorName: "James Oloo", bookTitle: "Things Fall Apart", condition: "Poor", dateReceived: "2026-01-28", reviewStatus: "Rejected" },
];

function dbToDonation(row: any): Donation {
  return {
    id: row.id,
    donorName: row.donor_name,
    bookTitle: row.book_title,
    condition: row.condition as Donation["condition"],
    dateReceived: row.date_received,
    reviewStatus: row.review_status as ReviewStatus,
    assignedAccessionId: row.assigned_accession_id ?? undefined,
  };
}

export function useDonations() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.from("donations").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        if (data && data.length > 0) {
          setDonations(data.map(dbToDonation));
        } else {
          const rows = SEED_DONATIONS.map((d) => ({
            id: d.id, donor_name: d.donorName, book_title: d.bookTitle,
            condition: d.condition, date_received: d.dateReceived,
            review_status: d.reviewStatus, assigned_accession_id: d.assignedAccessionId ?? null,
          }));
          await supabase.from("donations").insert(rows);
          setDonations(SEED_DONATIONS);
        }
      } catch (err) {
        console.error("Failed to load donations:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const addDonation = useCallback(async (donation: { donorName: string; bookTitle: string; condition: Donation["condition"] }) => {
    const id = `DON-${String(donations.length + 1).padStart(3, "0")}`;
    const newDonation: Donation = {
      id, ...donation,
      dateReceived: new Date().toISOString().split("T")[0],
      reviewStatus: "Pending",
    };
    setDonations((prev) => [newDonation, ...prev]);
    await supabase.from("donations").insert({
      id, donor_name: donation.donorName, book_title: donation.bookTitle,
      condition: donation.condition, review_status: "Pending",
    });
    return id;
  }, [donations.length]);

  const approve = useCallback(async (id: string) => {
    const accId = `ACC-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    setDonations((prev) => prev.map((d) => d.id === id ? { ...d, reviewStatus: "Approved" as const, assignedAccessionId: accId } : d));
    await supabase.from("donations").update({ review_status: "Approved", assigned_accession_id: accId }).eq("id", id);
  }, []);

  const reject = useCallback(async (id: string) => {
    setDonations((prev) => prev.map((d) => d.id === id ? { ...d, reviewStatus: "Rejected" as const } : d));
    await supabase.from("donations").update({ review_status: "Rejected" }).eq("id", id);
  }, []);

  return { donations, loading, addDonation, approve, reject };
}
