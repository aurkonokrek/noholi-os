import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatTaka } from "@/lib/currency";
import type { Fine } from "@/hooks/use-fines";

const METHODS = ["Cash", "bKash", "Nagad", "Bank Transfer", "Card"];

interface Props {
  fine: Fine | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (payment: { amountPaid: number; method: string; reference: string; note: string }) => Promise<{ success: boolean; error?: string }>;
}

export function PayFineDialog({ fine, open, onClose, onConfirm }: Props) {
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState("Cash");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (fine && open) {
      setAmount(fine.amount);
      setMethod("Cash");
      setReference("");
      setNote("");
      setError(null);
    }
  }, [fine, open]);

  if (!fine) return null;

  const invalid = !(amount > 0) || amount > fine.amount;

  const submit = async () => {
    if (invalid) {
      setError(`Enter an amount between ${formatTaka(1)} and ${formatTaka(fine.amount)}`);
      return;
    }
    setSaving(true);
    setError(null);
    const result = await onConfirm({ amountPaid: amount, method, reference: reference.trim(), note: note.trim() });
    setSaving(false);
    if (result.success) onClose();
    else setError(result.error ?? "Could not record this payment");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !saving && onClose()}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">Record Payment</DialogTitle>
          <DialogDescription className="text-[13px]">
            {fine.id} · {fine.member} · outstanding {formatTaka(fine.amount)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="space-y-1">
            <label htmlFor="fine-amount" className="text-[12px] font-medium text-muted-foreground">Amount Paid (৳) *</label>
            <Input
              id="fine-amount"
              type="number"
              min={1}
              max={fine.amount}
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="h-8 text-[13px]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[12px] font-medium text-muted-foreground">Payment Method *</label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="h-8 text-[12px]" aria-label="Payment method"><SelectValue /></SelectTrigger>
              <SelectContent>
                {METHODS.map((m) => (
                  <SelectItem key={m} value={m} className="text-[12px]">{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label htmlFor="fine-ref" className="text-[12px] font-medium text-muted-foreground">Reference / Receipt No.</label>
            <Input id="fine-ref" value={reference} onChange={(e) => setReference(e.target.value)} className="h-8 text-[13px]" placeholder="Optional" />
          </div>
          <div className="space-y-1">
            <label htmlFor="fine-note" className="text-[12px] font-medium text-muted-foreground">Note</label>
            <Input id="fine-note" value={note} onChange={(e) => setNote(e.target.value)} className="h-8 text-[13px]" placeholder="Optional" />
          </div>

          {error && <p className="text-[12px] text-destructive" role="alert">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" className="text-[13px] h-8" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button size="sm" className="text-[13px] h-8 gap-1.5" onClick={submit} disabled={saving || invalid}>
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {saving ? "Saving…" : "Confirm Payment"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
