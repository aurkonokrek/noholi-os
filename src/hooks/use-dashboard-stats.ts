import { useMemo } from "react";
import { useInventory } from "./use-inventory";

export function useDashboardStats() {
  const { books, loading } = useInventory();

  const stats = useMemo(() => {
    const totalBooks = books.length;
    const totalCopies = books.reduce((s, b) => s + b.totalCopies, 0);
    const booksOnLoan = books.reduce((s, b) => s + b.issuedCopies, 0);
    const reserved = books.reduce((s, b) => s + b.reservedCopies, 0);
    const lowStockCount = books.filter(
      (b) => b.availableCopies > 0 && b.availableCopies <= 2
    ).length;

    return {
      totalBooks,
      totalCopies,
      booksOnLoan,
      reserved,
      // These remain 0 until lending/members/donations modules are wired to a real DB
      overdueToday: 0,
      activeMembers: 0,
      donationsThisMonth: 0,
      pendingFines: 0,
      lowStockCategories: lowStockCount,
      donationApprovals: 0,
    };
  }, [books]);

  return { stats, loading };
}
