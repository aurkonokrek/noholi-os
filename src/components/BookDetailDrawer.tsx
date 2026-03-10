import { useRef, useState } from "react";
import { BookOpen, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge, type BadgeVariant } from "@/components/StatusBadge";
import { deriveStatus, type Book as InventoryBook, type BookStatus } from "@/hooks/use-inventory";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";

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
  genre: string;
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
  onUploadCover?: (bookId: string, file: File) => Promise<string | null>;
}

export function BookDetailDrawer({ book, open, onClose, onUploadCover }: BookDetailDrawerProps) {
  const coverRef = useRef<HTMLInputElement>(null);
  if (!book) return null;

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isInventoryBook(book) || !onUploadCover) return;
    const reader = new FileReader();
    reader.onload = () => {
      onUploadCover(book.id, reader.result as string);
      toast.success("Cover image updated");
    };
    reader.readAsDataURL(file);
  };

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
          <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-1.5 text-[13px]"
            onClick={() => coverRef.current?.click()}
            disabled={!isInventoryBook(book) || !onUploadCover}
          >
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
            {([
              isFullBook ? ["Book ID", book.id] : ("accessionId" in book && book.accessionId ? ["Accession ID", book.accessionId] : null),
              isFullBook && book.titleBangla ? ["Title (Bangla)", book.titleBangla] : null,
              ["Author", book.author],
              isFullBook && book.authorBangla ? ["Author (Bangla)", book.authorBangla] : null,
              ["Genre", book.genre],
              ...(isFullBook ? [
                ["Category", book.category],
                ["Language", book.language],
                ["ISBN", book.isbn || "—"],
                ["Publisher", book.publisher || "—"],
                ["Year", book.yearOfPublication || "—"],
                ["Edition", book.edition || "—"],
                ["Condition", book.condition || "—"],
                book.pages > 0 ? ["Pages", String(book.pages)] : null,
                book.price > 0 ? ["Price", `৳${book.price}`] : null,
              ] : []),
              ...(isFullBook ? [["Location", book.location || "—"]] : [["Location", book.location]]),
              ...(isFullBook ? [
                ["Added", new Date(book.createdAt).toLocaleDateString()],
                ["Last Updated", new Date(book.updatedAt).toLocaleDateString()],
              ] : []),
            ] as (string[] | null)[])
              .filter(Boolean)
              .map(([label, val]) => (
                <div key={label as string} className="flex justify-between py-1 border-b border-border last:border-0">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium text-foreground text-right max-w-[200px] truncate">{val}</span>
                </div>
              ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
