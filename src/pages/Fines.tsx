import { useState } from "react";
import { Eye, Trash2, Ban, CheckCircle2, DollarSign } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SearchBar } from "@/components/SearchBar";
import { FilterChips } from "@/components/FilterChips";
import { DataTable, type Column } from "@/components/DataTable";
import { StatusBadge, type BadgeVariant } from "@/components/StatusBadge";
import { RowActions } from "@/components/RowActions";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useCanWrite, useCanDelete } from "@/lib/roles";
import { useToast } from "@/hooks/use-toast";

interface Fine {
  id: string;
  member: string;
  memberId: string;
  book: string;
  daysLate: number;
  amount: number;
  status: "unpaid" | "paid" | "waived";
}

const STATUS_VARIANT: Record<Fine["status"], BadgeVariant> = {
  unpaid: "destructive",
  paid: "success",
  waived: "muted",
};

const INITIAL_FINES: Fine[] = [
  { id: "F-001", member: "Jane Muthoni", memberId: "M-1001", book: "The River Between", daysLate: 12, amount: 240, status: "unpaid" },
  { id: "F-002", member: "Peter Kamau", memberId: "M-1004", book: "Weep Not, Child", daysLate: 5, amount: 100, status: "unpaid" },
  { id: "F-003", member: "Alice Wanjiru", memberId: "M-1002", book: "A Grain of Wheat", daysLate: 3, amount: 60, status: "paid" },
  { id: "F-004", member: "David Ochieng", memberId: "M-1005", book: "Petals of Blood", daysLate: 20, amount: 400, status: "unpaid" },
  { id: "F-005", member: "Grace Akinyi", memberId: "M-1003", book: "Born a Crime", daysLate: 7, amount: 140, status: "waived" },
  { id: "F-006", member: "Samuel Njoroge", memberId: "M-1006", book: "Things Fall Apart", daysLate: 1, amount: 20, status: "paid" },
];

const FILTER_OPTIONS = ["all", "unpaid", "paid", "waived"] as const;

export default function FinesPage() {
  const canWrite = useCanWrite();
  const canDelete = useCanDelete();
  const { toast } = useToast();
  const [fines, setFines] = useState<Fine[]>(INITIAL_FINES);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [confirmAction, setConfirmAction] = useState<{
    fineId: string;
    action: "pay" | "waive";
  } | null>(null);

  const filtered = fines.filter((f) => {
    const matchesFilter = filter === "all" || f.status === filter;
    const matchesSearch =
      !search ||
      f.member.toLowerCase().includes(search.toLowerCase()) ||
      f.book.toLowerCase().includes(search.toLowerCase()) ||
      f.id.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalUnpaid = fines
    .filter((f) => f.status === "unpaid")
    .reduce((s, f) => s + f.amount, 0);

  const handleConfirm = () => {
    if (!confirmAction) return;
    const { fineId, action } = confirmAction;
    const newStatus = action === "pay" ? "paid" : "waived";
    setFines((prev) =>
      prev.map((f) => (f.id === fineId ? { ...f, status: newStatus as Fine["status"] } : f))
    );
    toast({
      title: action === "pay" ? "Fine paid" : "Fine waived",
      description: `Fine ${fineId} marked as ${newStatus}`,
    });
    setConfirmAction(null);
  };

  const hasFilters = search || filter !== "all";

  const columns: Column<Fine>[] = [
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
    { key: "book", label: "Book", render: (f) => f.book },
    { key: "daysLate", label: "Days Late", headerClassName: "text-right", className: "text-right", render: (f) => f.daysLate },
    {
      key: "amount",
      label: "Amount (KES)",
      headerClassName: "text-right",
      className: "text-right font-medium",
      render: (f) => f.amount.toLocaleString(),
    },
    {
      key: "status",
      label: "Status",
      render: (f) => (
        <StatusBadge variant={STATUS_VARIANT[f.status]}>
          {f.status.charAt(0).toUpperCase() + f.status.slice(1)}
        </StatusBadge>
      ),
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
                  f.status === "unpaid"
                    ? [{ label: "Mark Paid", icon: DollarSign, onClick: () => setConfirmAction({ fineId: f.id, action: "pay" }) }]
                    : []
                }
                secondary={[
                  ...(f.status === "unpaid"
                    ? [{ label: "Waive fine", icon: Ban, onClick: () => setConfirmAction({ fineId: f.id, action: "waive" }) }]
                    : []),
                  { label: "View details", icon: Eye, onClick: () => {} },
                  ...(canDelete
                    ? [{ label: "Delete", icon: Trash2, onClick: () => {}, variant: "destructive" as const }]
                    : []),
                ]}
              />
            ),
          },
        ]
      : []),
  ];

  const fine = confirmAction ? fines.find((f) => f.id === confirmAction.fineId) : null;

  return (
    <div className="space-y-3">
      <PageHeader
        title="Fines"
        subtitle={`Outstanding: KES ${totalUnpaid.toLocaleString()}`}
      />

      <div className="flex items-center gap-2 flex-wrap">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search fines..."
          className="flex-1 min-w-[200px] max-w-xs"
        />
        <FilterChips
          options={[...FILTER_OPTIONS]}
          value={filter as typeof FILTER_OPTIONS[number]}
          onChange={setFilter}
        />
        {hasFilters && (
          <button
            onClick={() => { setSearch(""); setFilter("all"); }}
            className="text-[12px] text-muted-foreground hover:text-foreground underline"
          >
            Reset
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(f) => f.id}
        emptyMessage="No fines found."
        compact
      />

      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title={confirmAction?.action === "pay" ? "Confirm Payment" : "Waive Fine"}
        description={
          confirmAction?.action === "pay"
            ? `Mark fine ${confirmAction?.fineId} (KES ${fine?.amount.toLocaleString() ?? 0}) as paid?`
            : `Waive fine ${confirmAction?.fineId} (KES ${fine?.amount.toLocaleString() ?? 0})? This action cannot be undone.`
        }
        confirmLabel={confirmAction?.action === "pay" ? "Confirm Paid" : "Waive Fine"}
        variant={confirmAction?.action === "waive" ? "destructive" : "default"}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
