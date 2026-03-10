import { useState, useRef } from "react";
import { Upload, X, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Book } from "@/hooks/use-inventory";

interface AddBookDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (book: Omit<Book, "id" | "createdAt" | "updatedAt">) => void;
}

const INITIAL = {
  title: "",
  titleBangla: "",
  author: "",
  authorBangla: "",
  genre: "",
  category: "General",
  language: "Bangla" as "Bangla" | "English",
  isbn: "",
  publisher: "",
  yearOfPublication: "",
  edition: "",
  condition: "New",
  pages: 0,
  price: 0,
  totalCopies: 1,
  location: "",
};

export function AddBookDialog({ open, onClose, onAdd }: AddBookDialogProps) {
  const [form, setForm] = useState(INITIAL);
  const [coverPreview, setCoverPreview] = useState<string | undefined>();
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (key: string, val: string | number) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCoverPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    onAdd({
      ...form,
      availableCopies: form.totalCopies,
      issuedCopies: 0,
      reservedCopies: 0,
      thumbnail: coverPreview,
    });
    setForm(INITIAL);
    setCoverPreview(undefined);
    onClose();
  };

  const handleClose = () => {
    setForm(INITIAL);
    setCoverPreview(undefined);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">Add New Book</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {/* Cover upload */}
          <div className="flex items-start gap-4">
            <div
              className="h-28 w-20 rounded bg-secondary flex items-center justify-center shrink-0 overflow-hidden cursor-pointer border border-dashed border-border hover:border-primary transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {coverPreview ? (
                <img src={coverPreview} alt="Cover" className="h-full w-full object-cover rounded" />
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">Cover</span>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
            {coverPreview && (
              <Button variant="ghost" size="sm" className="text-[12px]" onClick={() => setCoverPreview(undefined)}>
                <X className="h-3 w-3 mr-1" /> Remove
              </Button>
            )}
          </div>

          {/* Title row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">Title (English) *</label>
              <Input value={form.title} onChange={(e) => set("title", e.target.value)} className="h-8 text-[13px]" placeholder="Book title" />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">Title (Bangla)</label>
              <Input value={form.titleBangla} onChange={(e) => set("titleBangla", e.target.value)} className="h-8 text-[13px]" placeholder="বইয়ের শিরোনাম" />
            </div>
          </div>

          {/* Author row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">Author (English) *</label>
              <Input value={form.author} onChange={(e) => set("author", e.target.value)} className="h-8 text-[13px]" placeholder="Author name" />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">Author (Bangla)</label>
              <Input value={form.authorBangla} onChange={(e) => set("authorBangla", e.target.value)} className="h-8 text-[13px]" placeholder="লেখকের নাম" />
            </div>
          </div>

          {/* Genre, Category, Language */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">Genre</label>
              <Input value={form.genre} onChange={(e) => set("genre", e.target.value)} className="h-8 text-[13px]" placeholder="e.g. Fiction" />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">Category</label>
              <Input value={form.category} onChange={(e) => set("category", e.target.value)} className="h-8 text-[13px]" placeholder="e.g. General" />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">Language</label>
              <Select value={form.language} onValueChange={(v) => set("language", v)}>
                <SelectTrigger className="h-8 text-[12px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bangla" className="text-[12px]">Bangla</SelectItem>
                  <SelectItem value="English" className="text-[12px]">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ISBN, Publisher, Year, Edition */}
          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">ISBN</label>
              <Input value={form.isbn} onChange={(e) => set("isbn", e.target.value)} className="h-8 text-[13px]" />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">Publisher</label>
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

          {/* Condition, Pages, Price, Total Copies */}
          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">Condition</label>
              <Select value={form.condition} onValueChange={(v) => set("condition", v)}>
                <SelectTrigger className="h-8 text-[12px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["New", "Good", "Fair", "Poor"].map((c) => (
                    <SelectItem key={c} value={c} className="text-[12px]">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">Pages</label>
              <Input type="number" value={form.pages || ""} onChange={(e) => set("pages", Number(e.target.value))} className="h-8 text-[13px]" />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">Price (৳)</label>
              <Input type="number" value={form.price || ""} onChange={(e) => set("price", Number(e.target.value))} className="h-8 text-[13px]" />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">Total Copies</label>
              <Input type="number" min={0} value={form.totalCopies} onChange={(e) => set("totalCopies", Math.max(0, Number(e.target.value)))} className="h-8 text-[13px]" />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1">
            <label className="text-[12px] font-medium text-muted-foreground">Shelf Location</label>
            <Input value={form.location} onChange={(e) => set("location", e.target.value)} className="h-8 text-[13px]" placeholder="e.g. Shelf A-3" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" className="text-[13px] h-8" onClick={handleClose}>Cancel</Button>
            <Button size="sm" className="text-[13px] h-8" onClick={handleSubmit} disabled={!form.title.trim() || !form.author.trim()}>Add Book</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
