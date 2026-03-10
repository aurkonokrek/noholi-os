import { useState, useEffect } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Book } from "@/hooks/use-inventory";

interface AdjustStockDialogProps {
  book: Book | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (bookId: string, newTotal: number) => Promise<{ success: boolean; error?: string }> | { success: boolean; error?: string };
}

export function AdjustStockDialog({ book, open, onClose, onConfirm }: AdjustStockDialogProps) {
  const [value, setValue] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (book) {
      setValue(book.totalCopies);
      setError("");
    }
  }, [book]);

  if (!book) return null;

  const minAllowed = book.issuedCopies + book.reservedCopies;

  const handleChange = (v: number) => {
    setError("");
    if (v < 0) { setError("Cannot be negative"); return; }
    if (v < minAllowed) {
      setError(`Minimum ${minAllowed} (${book.issuedCopies} issued + ${book.reservedCopies} reserved)`);
    }
    setValue(v);
  };

  const handleConfirm = () => {
    const result = onConfirm(book.id, value);
    if (!result.success && result.error) {
      setError(result.error);
      return;
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle className="text-base">Adjust Stock</DialogTitle>
          <DialogDescription className="text-[13px]">
            Update total copies for <span className="font-medium text-foreground">{book.title}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="grid grid-cols-3 gap-2 text-center text-[12px]">
            <div className="bg-secondary rounded p-2">
              <p className="text-muted-foreground">Issued</p>
              <p className="text-sm font-semibold text-foreground">{book.issuedCopies}</p>
            </div>
            <div className="bg-secondary rounded p-2">
              <p className="text-muted-foreground">Reserved</p>
              <p className="text-sm font-semibold text-foreground">{book.reservedCopies}</p>
            </div>
            <div className="bg-secondary rounded p-2">
              <p className="text-muted-foreground">Available</p>
              <p className="text-sm font-semibold text-foreground">{book.availableCopies}</p>
            </div>
          </div>

          <div>
            <label className="text-[12px] text-muted-foreground mb-1 block">Total Copies</label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => handleChange(value - 1)}
                disabled={value <= 0}
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <Input
                type="number"
                min={0}
                value={value}
                onChange={(e) => handleChange(parseInt(e.target.value) || 0)}
                className="text-center h-8 text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => handleChange(value + 1)}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
            {error && <p className="text-[11px] text-destructive mt-1">{error}</p>}
          </div>

          {value !== book.totalCopies && !error && (
            <p className="text-[12px] text-muted-foreground">
              Available copies will change from {book.availableCopies} to{" "}
              <span className="font-medium text-foreground">
                {book.availableCopies + (value - book.totalCopies)}
              </span>
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={value === book.totalCopies || !!error || value < minAllowed}
          >
            Update Stock
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
