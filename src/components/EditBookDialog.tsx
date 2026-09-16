import { useEffect, useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { deriveStatus, type Book } from "@/hooks/use-inventory";

export interface BookMetadataUpdates {
  title: string;
  titleBangla: string;
  author: string;
  authorBangla: string;
  genre: string;
  category: string;
  language: "Bangla" | "English";
  isbn: string;
  publisher: string;
  yearOfPublication: string;
  edition: string;
  condition: string;
  pages: number;
  price: number;
  totalCopies: number;
  location: string;
  thumbnail?: string;
}

interface Props {
  book: Book | null;
  open: boolean;
  onClose: () => void;
  onSave: (updates: BookMetadataUpdates) => Promise<{ success: boolean; error?: string }>;
}

function formFromBook(b: Book): BookMetadataUpdates {
  return {
    title: b.title,
    titleBangla: b.titleBangla,
    author: b.author,
    authorBangla: b.authorBangla,
    genre: b.genre,
    category: b.category,
    language: b.language,
    isbn: b.isbn,
    publisher: b.publisher,
    yearOfPublication: b.yearOfPublication,
    edition: b.edition,
    condition: b.condition || "New",
    pages: b.pages,
    price: b.price,
    totalCopies: b.totalCopies,
    location: b.location,
    thumbnail: b.thumbnail,
  };
}

export function EditBookDialog({ book, open, onClose, onSave }: Props) {
  const [form, setForm] = useState<BookMetadataUpdates | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (book && open) {
      setForm(formFromBook(book));
      setError(null);
    }
  }, [book, open]);

  if (!book || !form) return null;

  const set = <K extends keyof BookMetadataUpdates>(key: K, val: BookMetadataUpdates[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: val } : prev));

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set("thumbnail", reader.result as string);
    reader.readAsDataURL(file);
  };

  const derivedAvailable = form.totalCopies - book.issuedCopies - book.reservedCopies;
  const invalid =
    !form.title.trim() ||
    !form.author.trim() ||
    form.totalCopies < book.issuedCopies + book.reservedCopies;

  const submit = async () => {
    if (!form.title.trim() || !form.author.trim()) {
      setError("Title and author are required");
      return;
    }
    if (form.totalCopies < book.issuedCopies + book.reservedCopies) {
      setError(`Total copies cannot go below ${book.issuedCopies + book.reservedCopies} (${book.issuedCopies} issued + ${book.reservedCopies} reserved)`);
      return;
    }
    setSaving(true);
    setError(null);
    const result = await onSave({
      ...form,
      title: form.title.trim(),
      author: form.author.trim(),
      pages: Math.max(0, form.pages),
      price: Math.max(0, form.price),
    });
    setSaving(false);
    if (result.success) onClose();
    else setError(result.error ?? "Could not save this book");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !saving && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">Edit Book</DialogTitle>
          <DialogDescription className="text-[13px]">{book.id}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {/* Cover */}
          <div className="flex items-start gap-4">
            <div
              className="h-28 w-20 rounded bg-secondary flex items-center justify-center shrink-0 overflow-hidden cursor-pointer border border-dashed border-border hover:border-primary transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {form.thumbnail ? (
                <img src={form.thumbnail} alt="Cover" className="h-full w-full object-cover rounded" />
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">Cover</span>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
            <div className="space-y-1 flex-1">
              <label className="text-[12px] font-medium text-muted-foreground">Cover Image URL</label>
              <Input
                value={form.thumbnail ?? ""}
                onChange={(e) => set("thumbnail", e.target.value || undefined)}
                className="h-8 text-[13px]"
                placeholder="https://…"
              />
              {form.thumbnail && (
                <Button variant="ghost" size="sm" className="text-[12px] h-7" onClick={() => set("thumbnail", undefined)}>
                  <X className="h-3 w-3 mr-1" /> Remove cover
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">Title (English) *</label>
              <Input value={form.title} onChange={(e) => set("title", e.target.value)} className="h-8 text-[13px]" />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">Title (Bangla)</label>
              <Input value={form.titleBangla} onChange={(e) => set("titleBangla", e.target.value)} className="h-8 text-[13px]" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">Author (English) *</label>
              <Input value={form.author} onChange={(e) => set("author", e.target.value)} className="h-8 text-[13px]" />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">Author (Bangla)</label>
              <Input value={form.authorBangla} onChange={(e) => set("authorBangla", e.target.value)} className="h-8 text-[13px]" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">Genre</label>
              <Input value={form.genre} onChange={(e) => set("genre", e.target.value)} className="h-8 text-[13px]" />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">Category</label>
              <Input value={form.category} onChange={(e) => set("category", e.target.value)} className="h-8 text-[13px]" />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">Language</label>
              <Select value={form.language} onValueChange={(v) => set("language", v as "Bangla" | "English")}>
                <SelectTrigger className="h-8 text-[12px]" aria-label="Language"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bangla" className="text-[12px]">Bangla</SelectItem>
                  <SelectItem value="English" className="text-[12px]">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">ISBN</label>
              <Input value={form.isbn} onChange={(e) => set("isbn", e.target.value)} className="h-8 text-[13px]" />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">Publications</label>
              <Input value={form.publisher} onChange={(e) => set("publisher", e.target.value)} className="h-8 text-[13px]" />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">Year</label>
              <Input value={form.yearOfPublication} onChange={(e) => set("yearOfPublication", e.target.value)} className="h-8 text-[13px]" />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">Edition</label>
              <Input value={form.edition} onChange={(e) => set("edition", e.target.value)} className="h-8 text-[13px]" />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">Condition</label>
              <Select value={form.condition} onValueChange={(v) => set("condition", v)}>
                <SelectTrigger className="h-8 text-[12px]" aria-label="Condition"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["New", "Good", "Fair", "Poor"].map((c) => (
                    <SelectItem key={c} value={c} className="text-[12px]">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">Pages</label>
              <Input type="number" min={0} value={form.pages || ""} onChange={(e) => set("pages", Number(e.target.value))} className="h-8 text-[13px]" />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">Price (৳)</label>
              <Input type="number" min={0} value={form.price || ""} onChange={(e) => set("price", Number(e.target.value))} className="h-8 text-[13px]" />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">Total Copies</label>
              <Input type="number" min={0} value={form.totalCopies} onChange={(e) => set("totalCopies", Math.max(0, Number(e.target.value)))} className="h-8 text-[13px]" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[12px] font-medium text-muted-foreground">Shelf Location</label>
            <Input value={form.location} onChange={(e) => set("location", e.target.value)} className="h-8 text-[13px]" />
          </div>

          {/* System-derived, read-only */}
          <div className="rounded border border-border bg-secondary/40 p-3 space-y-2">
            <p className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">
              System-derived · read-only
            </p>
            <div className="grid grid-cols-4 gap-3 text-[13px]">
              <div>
                <p className="text-[11px] text-muted-foreground">Available</p>
                <p className="font-mono font-medium text-foreground">{Math.max(0, derivedAvailable)}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Issued</p>
                <p className="font-mono font-medium text-foreground">{book.issuedCopies}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Reserved</p>
                <p className="font-mono font-medium text-foreground">{book.reservedCopies}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Status</p>
                <p className="font-medium text-foreground">{deriveStatus({ ...book, totalCopies: form.totalCopies, availableCopies: Math.max(0, derivedAvailable) })}</p>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Available Copies = Total Copies − Issued Copies − Reserved Copies
            </p>
          </div>

          {error && <p className="text-[12px] text-destructive" role="alert">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" className="text-[13px] h-8" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button size="sm" className="text-[13px] h-8 gap-1.5" onClick={submit} disabled={saving || invalid}>
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
