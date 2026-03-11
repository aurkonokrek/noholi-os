import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ActiveLoan } from "@/hooks/use-loans";

interface ExtendLoanDialogProps {
  loan: ActiveLoan | null;
  open: boolean;
  onClose: () => void;
  onExtend: (loanId: string, newDueDate: string) => Promise<void>;
}

export function ExtendLoanDialog({ loan, open, onClose, onExtend }: ExtendLoanDialogProps) {
  const [newDate, setNewDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loan) return null;

  const handleExtend = async () => {
    if (!newDate) return;
    setSubmitting(true);
    await onExtend(loan.id, newDate);
    setSubmitting(false);
    onClose();
  };

  const minDate = loan.dueDate > new Date().toISOString().split("T")[0] ? loan.dueDate : new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-[14px]">Extend Loan — {loan.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 text-[13px]">
          <p className="text-muted-foreground">
            Current due date: <span className="text-foreground font-medium">{loan.dueDate}</span>
          </p>
          <div className="space-y-1">
            <label className="text-[12px] font-medium text-muted-foreground">New Due Date</label>
            <Input
              type="date"
              value={newDate}
              min={minDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="h-8 text-[13px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} className="text-[13px]">Cancel</Button>
          <Button size="sm" onClick={handleExtend} disabled={!newDate || submitting} className="text-[13px]">
            {submitting ? "Extending…" : "Extend"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
