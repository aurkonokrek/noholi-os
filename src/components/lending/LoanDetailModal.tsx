import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge, type BadgeVariant } from "@/components/StatusBadge";
import type { ActiveLoan } from "@/hooks/use-loans";

interface LoanDetailModalProps {
  loan: ActiveLoan | null;
  open: boolean;
  onClose: () => void;
}

const statusVariant: Record<string, BadgeVariant> = {
  Active: "success",
  Overdue: "destructive",
  Returned: "muted",
};

export function LoanDetailModal({ loan, open, onClose }: LoanDetailModalProps) {
  if (!loan) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[14px] font-semibold">
            Loan Details — {loan.id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-[13px]">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status</span>
            <StatusBadge variant={statusVariant[loan.status] || "default"}>
              {loan.status}
            </StatusBadge>
          </div>

          {/* Member Info */}
          <Section title="Member Info">
            <Row label="Name" value={loan.member} />
            <Row label="Member ID" value={loan.memberId} />
          </Section>

          {/* Book Info */}
          <Section title="Book Info">
            <Row label="Title" value={loan.book} />
            <Row label="Accession ID" value={loan.accessionId} />
          </Section>

          {/* Dates */}
          <Section title="Dates">
            <Row label="Issued" value={loan.issuedDate} />
            <Row label="Due" value={loan.dueDate} />
            {loan.returnDate && <Row label="Returned" value={loan.returnDate} />}
          </Section>

          {/* Fine */}
          {loan.fineAmount > 0 && (
            <div className="flex items-center justify-between px-3 py-2 bg-destructive/5 border border-destructive/20 rounded">
              <span className="text-destructive font-medium">Overdue Fine</span>
              <span className="text-destructive font-semibold">৳{loan.fineAmount}</span>
            </div>
          )}

          {/* Guarantor */}
          <Section title="Guarantor Details">
            <Row label="Name" value={loan.guarantor.name} />
            <Row label="Phone" value={loan.guarantor.phone} />
            {loan.guarantor.email && <Row label="Email" value={loan.guarantor.email} />}
            <Row label="Relationship" value={loan.guarantor.relationship} />
            <Row label="Address" value={[loan.guarantor.street, loan.guarantor.city, loan.guarantor.district, loan.guarantor.postalCode].filter(Boolean).join(", ")} />
          </Section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">{title}</h4>
      <div className="bg-secondary/30 rounded p-2.5 space-y-1">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-medium text-right max-w-[60%]">{value || "—"}</span>
    </div>
  );
}
