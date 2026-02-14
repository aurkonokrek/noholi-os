import { BookOpen, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface BookDetail {
  accessionId: string;
  title: string;
  author: string;
  category: string;
  status: string;
  location: string;
  thumbnail?: string;
}

interface BookDetailDrawerProps {
  book: BookDetail | null;
  open: boolean;
  onClose: () => void;
}

export function BookDetailDrawer({ book, open, onClose }: BookDetailDrawerProps) {
  if (!book) return null;

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
              <img
                src={book.thumbnail}
                alt={book.title}
                className="h-full object-contain rounded"
              />
            ) : (
              <BookOpen className="h-12 w-12 text-muted-foreground/40" />
            )}
          </div>
          <Button variant="outline" size="sm" className="w-full gap-1.5 text-[13px]">
            <Upload className="h-3.5 w-3.5" /> Upload Cover
          </Button>

          {/* Metadata */}
          <div className="space-y-2 text-[13px]">
            {[
              ["Accession ID", book.accessionId],
              ["Author", book.author],
              ["Category", book.category],
              ["Status", book.status],
              ["Location", book.location],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between py-1 border-b border-border last:border-0">
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
