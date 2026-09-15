import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { StatusBadge, type BadgeVariant } from "@/components/StatusBadge";
import { formatTaka } from "@/lib/currency";
import type { Fine, FineStatus } from "@/hooks/use-fines";

const STATUS_VARIANT: Record<FineStatus, BadgeVariant> = {
  Unpaid: "destructive",
  Paid: "success",
  Waived: "muted",
};

interface Props {
  fine: Fine | null;
  open: boolean;
  onClose: () => void;
}

export function FineDetailDrawer({ fine, open, onClose }: Props) {
  if (!fine) return null;

  const rows: [string, string][] = [
    ["Fine ID", fine.id],
    ["Loan ID", fine.loanId],
    ["Member", fine.member],
    ["Member ID", fine.memberId],
    ["Book", fine.book],
    ["Accession ID", fine.accessionId || "—"],
    ["Due Date", fine.dueDate],
    ["Return Date", fine.returnDate ?? "Not returned"],
    ["Days Overdue", String(fine.daysOverdue)],
    ["Fine Amount", formatTaka(fine.amount)],
    ["Created", fine.createdDate],
  ];

  const paymentRows: [string, string][] = fine.payment
    ? [
        ["Amount Paid", formatTaka(fine.payment.amountPaid)],
        ["Method", fine.payment.method],
        ["Reference", fine.payment.reference || "—"],
        ["Payment Date", fine.payment.paidDate],
        ["Note", fine.payment.note || "—"],
      ]
    : [];

  const waiverRows: [string, string][] = fine.waiver
    ? [
        ["Reason", fine.waiver.reason],
        ["Waived On", fine.waiver.waivedDate],
      ]
    : [];

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-[360px] sm:w-[400px] flex flex-col overflow-hidden">
        <SheetHeader className="shrink-0">
          <SheetTitle className="text-base">Fine {fine.id}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4 overflow-y-auto flex-1 pr-1">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-muted-foreground">Status</span>
            <StatusBadge variant={STATUS_VARIANT[fine.status]}>{fine.status}</StatusBadge>
          </div>

          <div className="space-y-2 text-[13px]">
            {rows.map(([label, value]) => (
              <div key={label} className="flex justify-between py-1 border-b border-border last:border-0 gap-3">
                <span className="text-muted-foreground shrink-0">{label}</span>
                <span className="font-medium text-foreground text-right break-words">{value}</span>
              </div>
            ))}
          </div>

          {paymentRows.length > 0 && (
            <div className="space-y-2 text-[13px]">
              <h3 className="text-[12px] font-semibold text-foreground uppercase tracking-wide">Payment</h3>
              {paymentRows.map(([label, value]) => (
                <div key={label} className="flex justify-between py-1 border-b border-border last:border-0 gap-3">
                  <span className="text-muted-foreground shrink-0">{label}</span>
                  <span className="font-medium text-foreground text-right break-words">{value}</span>
                </div>
              ))}
            </div>
          )}

          {waiverRows.length > 0 && (
            <div className="space-y-2 text-[13px]">
              <h3 className="text-[12px] font-semibold text-foreground uppercase tracking-wide">Waiver</h3>
              {waiverRows.map(([label, value]) => (
                <div key={label} className="flex justify-between py-1 border-b border-border last:border-0 gap-3">
                  <span className="text-muted-foreground shrink-0">{label}</span>
                  <span className="font-medium text-foreground text-right break-words">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
