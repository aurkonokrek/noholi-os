import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { formatTaka } from "@/lib/currency";
import type { Fine } from "@/hooks/use-fines";

interface Props {
  fine: Fine | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<{ success: boolean; error?: string }>;
}

export function WaiveFineDialog({ fine, open, onClose, onConfirm }: Props) {
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setReason("");
      setError(null);
    }
  }, [open]);

  if (!fine) return null;

  const submit = async () => {
    if (!reason.trim()) {
      setError("A waiver reason is required");
      return;
    }
    setSaving(true);
    setError(null);
    const result = await onConfirm(reason.trim());
    setSaving(false);
    if (result.success) onClose();
    else setError(result.error ?? "Could not waive this fine");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !saving && onClose()}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">Waive Fine</DialogTitle>
          <DialogDescription className="text-[13px]">
            {fine.id} · {fine.member} · {formatTaka(fine.amount)} will be written off. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="space-y-1">
            <label htmlFor="waive-reason" className="text-[12px] font-medium text-muted-foreground">Waiver Reason *</label>
            <Textarea
              id="waive-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="text-[13px] min-h-[80px]"
              placeholder="Why is this fine being waived?"
            />
          </div>

          {error && <p className="text-[12px] text-destructive" role="alert">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" className="text-[13px] h-8" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button
              size="sm"
              className="text-[13px] h-8 gap-1.5 bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={submit}
              disabled={saving || !reason.trim()}
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {saving ? "Waiving…" : "Waive Fine"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
