import { useCallback, useEffect, useMemo, useState } from "react";
import { useLoans, type ActiveLoan } from "@/hooks/use-loans";

export type FineStatus = "Unpaid" | "Paid" | "Waived";

export interface FinePayment {
  amountPaid: number;
  method: string;
  reference: string;
  paidDate: string;
  note: string;
}

export interface FineWaiver {
  reason: string;
  waivedDate: string;
}

export interface Fine {
  id: string;
  loanId: string;
  member: string;
  memberId: string;
  book: string;
  accessionId: string;
  dueDate: string;
  returnDate: string | null;
  daysOverdue: number;
  amount: number;
  status: FineStatus;
  createdDate: string;
  payment?: FinePayment;
  waiver?: FineWaiver;
}

/**
 * Settlement records (payment / waiver) have no backend table yet.
 * They are kept in one place so a backend team can swap this store for an API
 * without touching the Fines UI.
 */
interface Settlement {
  status: "Paid" | "Waived";
  payment?: FinePayment;
  waiver?: FineWaiver;
}

const STORAGE_KEY = "noholi.fine-settlements.v1";

function readSettlements(): Record<string, Settlement> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, Settlement>) : {};
  } catch {
    return {};
  }
}

function writeSettlements(value: Record<string, Settlement>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* storage unavailable — state stays in memory for this session */
  }
}

const FINE_PER_DAY = 10;

function daysOverdueOf(loan: ActiveLoan): number {
  return loan.fineAmount > 0 ? Math.round(loan.fineAmount / FINE_PER_DAY) : 0;
}

/** Fines are derived from real loan records — never seeded. */
export function useFines() {
  const { loans, loading } = useLoans();
  const [settlements, setSettlements] = useState<Record<string, Settlement>>({});

  useEffect(() => {
    setSettlements(readSettlements());
  }, []);

  const fines = useMemo<Fine[]>(() => {
    return loans
      .filter((l) => l.fineAmount > 0 && l.status !== "Cancelled")
      .map((l) => {
        const id = `FN-${l.id.replace(/^LN-/, "")}`;
        const settlement = settlements[id];
        return {
          id,
          loanId: l.id,
          member: l.member,
          memberId: l.memberId,
          book: l.book,
          accessionId: l.accessionId,
          dueDate: l.dueDate,
          returnDate: l.returnDate,
          daysOverdue: daysOverdueOf(l),
          amount: l.fineAmount,
          status: (settlement?.status ?? "Unpaid") as FineStatus,
          createdDate: l.dueDate,
          payment: settlement?.payment,
          waiver: settlement?.waiver,
        };
      });
  }, [loans, settlements]);

  const settle = useCallback((fineId: string, settlement: Settlement) => {
    setSettlements((prev) => {
      const next = { ...prev, [fineId]: settlement };
      writeSettlements(next);
      return next;
    });
  }, []);

  const markPaid = useCallback(
    async (fineId: string, payment: Omit<FinePayment, "paidDate"> & { paidDate?: string }) => {
      const fine = fines.find((f) => f.id === fineId);
      if (!fine) return { success: false as const, error: "Fine not found" };
      if (fine.status !== "Unpaid") return { success: false as const, error: "This fine has already been settled" };
      settle(fineId, {
        status: "Paid",
        payment: { ...payment, paidDate: payment.paidDate ?? new Date().toISOString().split("T")[0] },
      });
      return { success: true as const };
    },
    [fines, settle]
  );

  const waiveFine = useCallback(
    async (fineId: string, reason: string) => {
      const fine = fines.find((f) => f.id === fineId);
      if (!fine) return { success: false as const, error: "Fine not found" };
      if (fine.status !== "Unpaid") return { success: false as const, error: "This fine has already been settled" };
      settle(fineId, {
        status: "Waived",
        waiver: { reason, waivedDate: new Date().toISOString().split("T")[0] },
      });
      return { success: true as const };
    },
    [fines, settle]
  );

  const totals = useMemo(() => {
    const sum = (status: FineStatus) =>
      fines.filter((f) => f.status === status).reduce((s, f) => s + f.amount, 0);
    return {
      unpaid: sum("Unpaid"),
      paid: sum("Paid"),
      waived: sum("Waived"),
      count: fines.length,
    };
  }, [fines]);

  return { fines, loading, totals, markPaid, waiveFine };
}
