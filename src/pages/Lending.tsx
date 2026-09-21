import { useState } from "react";
import { RotateCcw, Eye, CalendarPlus, BookOpen, Loader2, Pencil, XCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SearchBar } from "@/components/SearchBar";
import { DataTable, type Column } from "@/components/DataTable";
import { StatusBadge, type BadgeVariant } from "@/components/StatusBadge";
import { RowActions } from "@/components/RowActions";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { IssueBookForm } from "@/components/lending/IssueBookForm";
import { LoanDetailModal } from "@/components/lending/LoanDetailModal";
import { ExtendLoanDialog } from "@/components/lending/ExtendLoanDialog";
import { EditLoanDialog } from "@/components/lending/EditLoanDialog";
import { useCanWrite } from "@/lib/roles";
import { useToast } from "@/hooks/use-toast";
import { useLoans, type ActiveLoan } from "@/hooks/use-loans";
import { useInventory } from "@/hooks/use-inventory";
import { useMembers } from "@/hooks/use-members";

const statusVariant: Record<string, BadgeVariant> = {
  Active: "success",
  Overdue: "destructive",
  Returned: "muted",
  Cancelled: "muted",
};

export default function Lending() {
  const canWrite = useCanWrite();
  const { toast } = useToast();
  const { loans, loading, issueLoan, returnLoan, extendLoan, updateLoan, cancelLoan } = useLoans();
  const { books } = useInventory();
  const { members } = useMembers();

  const [loanSearch, setLoanSearch] = useState("");
  const [detailLoan, setDetailLoan] = useState<ActiveLoan | null>(null);
  const [extendTarget, setExtendTarget] = useState<ActiveLoan | null>(null);
  const [returnTarget, setReturnTarget] = useState<ActiveLoan | null>(null);
  const [editTarget, setEditTarget] = useState<ActiveLoan | null>(null);
  const [cancelTarget, setCancelTarget] = useState<ActiveLoan | null>(null);

  const filteredLoans = loans.filter((l) => {
    if (!loanSearch) return true;
    const q = loanSearch.toLowerCase();
    return (
      l.member.toLowerCase().includes(q) ||
      l.memberId.toLowerCase().includes(q) ||
      l.book.toLowerCase().includes(q) ||
      l.accessionId.toLowerCase().includes(q) ||
      l.id.toLowerCase().includes(q)
    );
  });

  const handleReturn = async () => {
    if (!returnTarget) return;
    const result = await returnLoan(returnTarget.id);
    if (result.success) {
      toast({
        title: "Book returned",
        description: `${returnTarget.book} returned by ${returnTarget.member}${result.fine ? ` — Fine: ৳${result.fine}` : ""}${result.inventoryWarning ? ` — ${result.inventoryWarning}` : ""}`,
        variant: result.inventoryWarning ? "destructive" : undefined,
      });
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
    setReturnTarget(null);
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    const result = await cancelLoan(cancelTarget.id);
    if (result.success) {
      toast({
        title: "Loan cancelled",
        description: `Loan ${cancelTarget.id} has been cancelled.${result.inventoryWarning ? ` ${result.inventoryWarning}` : ""}`,
        variant: result.inventoryWarning ? "destructive" : undefined,
      });
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
    setCancelTarget(null);
  };

  const handleExtend = async (loanId: string, newDate: string) => {
    const result = await extendLoan(loanId, newDate);
    if (result.success) {
      toast({ title: "Loan extended", description: `Due date updated to ${newDate}` });
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  };

  const handleEdit = async (loanId: string, updates: Parameters<typeof updateLoan>[1]) => {
    const result = await updateLoan(loanId, updates);
    if (result.success) {
      toast({ title: "Loan updated", description: `Loan ${loanId} has been updated.` });
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
    return result;
  };

  const handleIssue = async (input: Parameters<typeof issueLoan>[0]) => {
    const result = await issueLoan(input);
    if (result.success) {
      toast({ title: "Book issued", description: `${input.bookTitle} issued to ${input.memberName}` });
    }
    return result;
  };

  const columns: Column<ActiveLoan>[] = [
    {
      key: "thumb",
      label: "",
      className: "w-10",
      render: () => (
        <div className="h-8 w-8 rounded bg-secondary flex items-center justify-center">
          <BookOpen className="h-3.5 w-3.5 text-muted-foreground/50" />
        </div>
      ),
    },
    { key: "id", label: "Loan ID", className: "text-muted-foreground font-mono text-[12px]", render: (l) => l.id },
    {
      key: "member",
      label: "Member",
      render: (l) => (
        <>
          <span className="font-medium text-foreground">{l.member}</span>
          <span className="text-muted-foreground ml-1.5 text-[11px]">{l.memberId}</span>
        </>
      ),
    },
    {
      key: "book",
      label: "Book",
      render: (l) => (
        <>
          <span className="text-foreground">{l.book}</span>
          <span className="text-muted-foreground ml-1.5 text-[11px]">{l.accessionId}</span>
        </>
      ),
    },
    { key: "issued", label: "Issued", className: "text-muted-foreground", render: (l) => l.issuedDate },
    { key: "due", label: "Due Date", className: "text-muted-foreground", render: (l) => l.dueDate },
    {
      key: "status",
      label: "Status",
      render: (l) => (
        <StatusBadge variant={statusVariant[l.status] || "default"}>
          {l.status}
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
            render: (l: ActiveLoan) => {
              const isActive = l.status === "Active" || l.status === "Overdue";
              return (
                <RowActions
                  primary={[
                    ...(isActive
                      ? [{ label: "Return", icon: RotateCcw, onClick: () => setReturnTarget(l) }]
                      : []),
                    { label: "View", icon: Eye, onClick: () => setDetailLoan(l) },
                    ...(isActive
                      ? [{ label: "Edit", icon: Pencil, onClick: () => setEditTarget(l) }]
                      : []),
                  ]}
                  secondary={[
                    ...(isActive
                      ? [
                          { label: "Extend Due Date", icon: CalendarPlus, onClick: () => setExtendTarget(l) },
                          { label: "Cancel Loan", icon: XCircle, onClick: () => setCancelTarget(l), variant: "destructive" as const },
                        ]
                      : []),
                  ]}
                />
              );
            },
          },
        ]
      : []),
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-[13px]">Loading loans…</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <PageHeader title="Lending" subtitle="Issue and return books" />

      {canWrite && (
        <IssueBookForm members={members} books={books} onIssue={handleIssue} />
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-[13px] font-semibold text-foreground">
          Active Loans <span className="text-muted-foreground font-normal">({loans.length})</span>
        </h2>
        <SearchBar
          value={loanSearch}
          onChange={setLoanSearch}
          placeholder="Search loans..."
          className="w-56"
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredLoans}
        keyExtractor={(l) => l.id}
        onRowClick={(l) => setDetailLoan(l)}
        compact
      />

      <LoanDetailModal loan={detailLoan} open={!!detailLoan} onClose={() => setDetailLoan(null)} />
      <ExtendLoanDialog loan={extendTarget} open={!!extendTarget} onClose={() => setExtendTarget(null)} onExtend={handleExtend} />
      <EditLoanDialog loan={editTarget} open={!!editTarget} onClose={() => setEditTarget(null)} onSave={handleEdit} />
      <ConfirmDialog
        open={!!returnTarget}
        onOpenChange={(v) => !v && setReturnTarget(null)}
        onConfirm={handleReturn}
        title="Return Book"
        description={returnTarget ? `Confirm return of "${returnTarget.book}" by ${returnTarget.member}? Any overdue fine will be calculated automatically.` : ""}
      />
      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(v) => !v && setCancelTarget(null)}
        onConfirm={handleCancel}
        title="Cancel Loan"
        description={cancelTarget ? `Cancel loan ${cancelTarget.id} for "${cancelTarget.book}"? The book will be returned to available inventory. This action cannot be undone.` : ""}
      />
    </div>
  );
}
