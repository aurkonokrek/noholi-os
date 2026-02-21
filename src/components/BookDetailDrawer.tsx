import { BookOpen, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge, type BadgeVariant } from "@/components/StatusBadge";
import { deriveStatus, type Book as InventoryBook, type BookStatus } from "@/hooks/use-inventory";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const STATUS_VARIANT: Record<BookStatus, BadgeVariant> = {
  Available: "success",
  Unavailable: "warning",
  "Out of Stock": "destructive",
};

/** Supports both the full inventory Book and a minimal shape from Lending */
type BookLike = InventoryBook | {
  accessionId?: string;
  title: string;
  author: string;
  category: string;
  status: string;
  location: string;
  thumbnail?: string;
};

function isInventoryBook(b: BookLike): b is InventoryBook {
  return "totalCopies" in b;
}

interface BookDetailDrawerProps {
  book: BookLike | null;
  open: boolean;
  onClose: () => void;
}

export function BookDetailDrawer({ book, open, onClose }: BookDetailDrawerProps) {
  if (!book) return null;

  const isFullBook = isInventoryBook(book);
  const status = isFullBook ? deriveStatus(book) : book.status;
  const statusVariant = isFullBook
    ? STATUS_VARIANT[deriveStatus(book)]
    : (status === "Available" ? "success" : status === "Issued" ? "accent" : "warning");

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-[360px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="text-base">{book.title}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          {/* Cover */}
          <div className="flex items-center justify-center bg-secondary rounded h-48">
            {book.thumbnail ? (
              <img src={book.thumbnail} alt={book.title} className="h-full object-contain rounded" />
            ) : (
              <BookOpen className="h-12 w-12 text-muted-foreground/40" />
            )}
          </div>
          <Button variant="outline" size="sm" className="w-full gap-1.5 text-[13px]">
            <Upload className="h-3.5 w-3.5" /> Upload Cover
          </Button>

          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-muted-foreground">Status</span>
            <StatusBadge variant={statusVariant}>{status}</StatusBadge>
          </div>

          {/* Quantity breakdown – only for full inventory books */}
          {isFullBook && (
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { label: "Total", value: book.totalCopies },
                { label: "Available", value: book.availableCopies },
                { label: "Issued", value: book.issuedCopies },
                { label: "Reserved", value: book.reservedCopies },
              ].map((item) => (
                <div key={item.label} className="bg-secondary rounded p-2">
                  <p className="text-[11px] text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-semibold text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Metadata */}
          <div className="space-y-2 text-[13px]">
            {[
              isFullBook ? ["Book ID", book.id] : ("accessionId" in book && book.accessionId ? ["Accession ID", book.accessionId] : null),
              ["Author", book.author],
              ["Category", book.category],
              ...(isFullBook ? [["ISBN", book.isbn || "—"]] : []),
              ["Location", book.location],
              ...(isFullBook ? [
                ["Added", new Date(book.createdAt).toLocaleDateString()],
                ["Last Updated", new Date(book.updatedAt).toLocaleDateString()],
              ] : []),
            ]
              .filter(Boolean)
              .map(([label, val]) => (
                <div key={label as string} className="flex justify-between py-1 border-b border-border last:border-0">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium text-foreground">{val}</span>
                </div>
              ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
