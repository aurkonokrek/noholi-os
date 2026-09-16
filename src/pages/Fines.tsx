import { useState } from "react";
import { Eye, Ban, DollarSign, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SearchBar } from "@/components/SearchBar";
import { FilterChips } from "@/components/FilterChips";
import { DataTable, type Column } from "@/components/DataTable";
import { StatusBadge, type BadgeVariant } from "@/components/StatusBadge";
import { RowActions } from "@/components/RowActions";
import { FineDetailDrawer } from "@/components/fines/FineDetailDrawer";
import { PayFineDialog } from "@/components/fines/PayFineDialog";
import { WaiveFineDialog } from "@/components/fines/WaiveFineDialog";
import { useCanWrite } from "@/lib/roles";
import { useToast } from "@/hooks/use-toast";
import { useFines, type Fine, type FineStatus } from "@/hooks/use-fines";
import { formatTaka } from "@/lib/currency";

const STATUS_VARIANT: Record<FineStatus, BadgeVariant> = {
  Unpaid: "destructive",
  Paid: "success",
  Waived: "muted",
};

const FILTER_OPTIONS = ["All", "Unpaid", "Paid", "Waived"] as const;

export default function FinesPage() {
  const canWrite = useCanWrite();
  const { toast } = useToast();
  const { fines, loading, totals, markPaid, waiveFine } = useFines();

  const [filter, setFilter] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [detailFine, setDetailFine] = useState<Fine | null>(null);
  const [payFine, setPayFine] = useState<Fine | null>(null);
  const [waiveTarget, setWaiveTarget] = useState<Fine | null>(null);

  const q = search.toLowerCase();
  const filtered = fines.filter((f) => {
    const matchesFilter = filter === "All" || f.status === filter;
    const matchesSearch =
      !search ||
      f.member.toLowerCase().includes(q) ||
      f.memberId.toLowerCase().includes(q) ||
      f.book.toLowerCase().includes(q) ||
      f.id.toLowerCase().includes(q) ||
      f.loanId.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const hasFilters = search || filter !== "All";

  const columns: Column<Fine>[] = [
    { key: "id", label: "Fine ID", className: "text-muted-foreground font-mono text-[12px]", render: (f) => f.id },
    {
      key: "member",
      label: "Member",
      render: (f) => (
        <>
          <span className="font-medium text-foreground">{f.member}</span>
          <span className="text-muted-foreground ml-1.5 text-[11px]">{f.memberId}</span>
        </>
      ),
    },
    { key: "book", label: "Book", className: "max-w-[200px] truncate", render: (f) => f.book },
    { key: "dueDate", label: "Due Date", className: "text-muted-foreground", render: (f) => f.dueDate },
    {
      key: "daysOverdue",
      label: "Days Overdue",
      headerClassName: "text-right",
      className: "text-right font-mono text-[12px]",
      render: (f) => f.daysOverdue,
    },
    {
      key: "amount",
      label: "Amount (৳)",
      headerClassName: "text-right",
      className: "text-right font-medium",
      render: (f) => formatTaka(f.amount),
    },
    {
      key: "status",
      label: "Status",
      render: (f) => <StatusBadge variant={STATUS_VARIANT[f.status]}>{f.status}</StatusBadge>,
    },
    ...(canWrite
      ? [
          {
            key: "actions" as const,
            label: "",
            headerClassName: "text-right",
            className: "text-right",
            render: (f: Fine) => (
              <RowActions
                primary={
                  f.status === "Unpaid"
                    ? [{ label: "Record Payment", icon: DollarSign, onClick: () => setPayFine(f) }]
                    : [{ label: "View details", icon: Eye, onClick: () => setDetailFine(f) }]
                }
                secondary={[
                  ...(f.status === "Unpaid"
                    ? [{ label: "Waive fine", icon: Ban, onClick: () => setWaiveTarget(f), variant: "destructive" as const }]
                    : []),
                  { label: "View details", icon: Eye, onClick: () => setDetailFine(f) },
                ]}
              />
            ),
          },
        ]
      : []),
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-[13px]">Loading fines…</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <PageHeader
        title="Fines"
        subtitle={`Outstanding ${formatTaka(totals.unpaid)} · Collected ${formatTaka(totals.paid)} · Waived ${formatTaka(totals.waived)}`}
      />

      <p className="text-[12px] text-muted-foreground">
        Fines are derived from overdue loan records. Settle each fine with an explicit action.
      </p>

      <div className="flex items-center gap-2 flex-wrap">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by member, book, fine or loan ID..."
          className="flex-1 min-w-[200px] max-w-xs"
        />
        <FilterChips
          options={[...FILTER_OPTIONS]}
          value={filter as typeof FILTER_OPTIONS[number]}
          onChange={setFilter}
        />
        {hasFilters && (
          <button
            onClick={() => { setSearch(""); setFilter("All"); }}
            className="text-[12px] text-muted-foreground hover:text-foreground underline"
          >
            Reset
          </button>
        )}
      </div>

      <div className="text-[12px] text-muted-foreground">
        Showing {filtered.length} of {totals.count} fines
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(f) => f.id}
        onRowClick={(f) => setDetailFine(f)}
        emptyMessage="No fines found."
        compact
      />

      <FineDetailDrawer
        fine={detailFine}
        open={!!detailFine}
        onClose={() => setDetailFine(null)}
      />

      <PayFineDialog
        fine={payFine}
        open={!!payFine}
        onClose={() => setPayFine(null)}
        onConfirm={async (payment) => {
          if (!payFine) return { success: false, error: "No fine selected" };
          const result = await markPaid(payFine.id, payment);
          if (result.success) {
            toast({ title: "Payment recorded", description: `${payFine.id} · ${formatTaka(payment.amountPaid)}` });
          }
          return result;
        }}
      />

      <WaiveFineDialog
        fine={waiveTarget}
        open={!!waiveTarget}
        onClose={() => setWaiveTarget(null)}
        onConfirm={async (reason) => {
          if (!waiveTarget) return { success: false, error: "No fine selected" };
          const result = await waiveFine(waiveTarget.id, reason);
          if (result.success) {
            toast({ title: "Fine waived", description: `${waiveTarget.id} written off` });
          }
          return result;
        }}
      />
    </div>
  );
}
