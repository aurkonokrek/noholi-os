import { useState, useCallback, useRef } from "react";
import { Plus, Upload, Download, Pencil, Trash2, BookOpen, Eye, Package, AlertTriangle, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { SearchBar } from "@/components/SearchBar";
import { FilterChips } from "@/components/FilterChips";
import { DataTable, type Column } from "@/components/DataTable";
import { StatusBadge, type BadgeVariant } from "@/components/StatusBadge";
import { RowActions } from "@/components/RowActions";
import { BookDetailDrawer } from "@/components/BookDetailDrawer";
import { AdjustStockDialog } from "@/components/AdjustStockDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { AddBookDialog } from "@/components/AddBookDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInventory, deriveStatus, isLowStock, type Book, type BookStatus } from "@/hooks/use-inventory";
import { useBookCovers } from "@/hooks/use-book-covers";
import { useCanWrite, useCanDelete } from "@/lib/roles";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STATUS_VARIANT: Record<BookStatus, BadgeVariant> = {
  Available: "success",
  Unavailable: "warning",
  "Out of Stock": "destructive",
};

const LANGUAGES = ["All", "Bangla", "English"] as const;
const STATUSES = ["All", "Available", "Unavailable", "Out of Stock"] as const;

export default function Inventory() {
  const canWrite = useCanWrite();
  const canDelete = useCanDelete();
  const { books, loading, stats, uniqueGenres, uniqueCategories, adjustStock, deleteBook, addBook, addBooks, updateCover } = useInventory();

  const excelUploadRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [languageFilter, setLanguageFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [stockBook, setStockBook] = useState<Book | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);
  const [showAddBook, setShowAddBook] = useState(false);

  const exportBooks = useCallback(() => {
    const exportData = books.map((b) => ({
      "Book ID": b.id,
      "Title (English)": b.title,
      "Title (Bangla)": b.titleBangla,
      "Author (English)": b.author,
      "Author (Bangla)": b.authorBangla,
      "Genre": b.genre,
      "Category": b.category,
      "Language": b.language,
      "ISBN": b.isbn,
      "Publisher": b.publisher,
      "Year of Publication": b.yearOfPublication,
      "Edition": b.edition,
      "Condition": b.condition,
      "Pages": b.pages,
      "Price (৳)": b.price,
      "Total Copies": b.totalCopies,
      "Available Copies": b.availableCopies,
      "Issued Copies": b.issuedCopies,
      "Reserved Copies": b.reservedCopies,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Books");
    XLSX.writeFile(wb, `Inventory_Export_${books.length}_records.xlsx`);
    toast.success(`Exported ${books.length} records`);
  }, [books]);

  const handleExcelUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buf = evt.target?.result;
        const wb = XLSX.read(buf, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
        const newBooks = rows.map((row) => ({
          title: String(row["Book Title (English)"] ?? row["Title"] ?? "Untitled").trim(),
          titleBangla: String(row["Book Title (Bangla)"] ?? "").trim(),
          author: String(row["Author Name (English)"] ?? row["Author"] ?? "Unknown").trim(),
          authorBangla: String(row["Author Name (Bangla)"] ?? "").trim(),
          genre: String(row["Genre"] ?? "Uncategorized").trim(),
          category: String(row["Category"] ?? "General").trim(),
          language: (String(row["Language"] ?? "Bangla").trim() === "English" ? "English" : "Bangla") as "Bangla" | "English",
          isbn: String(row["ISBN"] ?? "").trim(),
          publisher: String(row["Publications"] ?? row["Publisher"] ?? "").trim(),
          yearOfPublication: String(row["Year of Publication"] ?? "").trim(),
          edition: String(row["Edition"] ?? "").trim(),
          condition: String(row["Book Condition"] ?? row["Condition"] ?? "").trim(),
          pages: Number(row["Pages"]) || 0,
          price: Number(row["৳ Price"] ?? row["Price"]) || 0,
          totalCopies: Number(row["Total Copies"]) || 1,
          availableCopies: Number(row["Total Copies"]) || 1,
          issuedCopies: 0,
          reservedCopies: 0,
          location: String(row["Location"] ?? "").trim(),
          thumbnail: undefined,
        }));
        const count = addBooks(newBooks);
        toast.success(`Imported ${count} books from Excel`);
      } catch (err) {
        toast.error("Failed to parse Excel file");
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  }, [addBooks]);

  const handleAddBook = useCallback((book: Omit<Book, "id" | "createdAt" | "updatedAt">) => {
    const id = addBook(book);
    toast.success(`"${book.title}" added as ${id}`);
  }, [addBook]);

  const hasFilters = search || genreFilter !== "All" || categoryFilter !== "All" || languageFilter !== "All" || statusFilter !== "All";

  const resetFilters = () => {
    setSearch("");
    setGenreFilter("All");
    setCategoryFilter("All");
    setLanguageFilter("All");
    setStatusFilter("All");
  };

  const filtered = books.filter((b) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      b.title.toLowerCase().includes(q) ||
      b.titleBangla.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.authorBangla.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q) ||
      b.isbn.toLowerCase().includes(q);
    const matchesGenre = genreFilter === "All" || b.genre === genreFilter;
    const matchesCategory = categoryFilter === "All" || b.category === categoryFilter;
    const matchesLanguage = languageFilter === "All" || b.language === languageFilter;
    const status = deriveStatus(b);
    const matchesStatus = statusFilter === "All" || status === statusFilter;
    return matchesSearch && matchesGenre && matchesCategory && matchesLanguage && matchesStatus;
  });

  const handleAdjustStock = (bookId: string, newTotal: number) => {
    const result = adjustStock(bookId, newTotal);
    if (result.success) {
      toast.success("Stock updated successfully");
      return { success: true } as { success: boolean; error?: string };
    }
    toast.error(result.error);
    return { success: false, error: result.error };
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const result = deleteBook(deleteTarget.id);
    if (result.success) {
      toast.success(`"${deleteTarget.title}" deleted`);
    } else {
      toast.error(result.error);
    }
    setDeleteTarget(null);
  };

  const columns: Column<Book>[] = [
    {
      key: "thumb",
      label: "",
      className: "w-10",
      render: (b) => (
        <div className="h-8 w-8 rounded bg-secondary flex items-center justify-center shrink-0">
          {b.thumbnail ? (
            <img src={b.thumbnail} alt="" className="h-8 w-8 rounded object-cover" loading="lazy" />
          ) : (
            <BookOpen className="h-3.5 w-3.5 text-muted-foreground/50" />
          )}
        </div>
      ),
    },
    { key: "title", label: "Title", className: "font-medium text-foreground max-w-[200px] truncate", render: (b) => b.title },
    { key: "author", label: "Author", className: "text-muted-foreground max-w-[150px] truncate", render: (b) => b.author },
    { key: "genre", label: "Genre", className: "text-muted-foreground max-w-[120px] truncate", render: (b) => b.genre },
    { key: "language", label: "Language", className: "text-muted-foreground", render: (b) => b.language },
    { key: "category", label: "Category", className: "text-muted-foreground max-w-[120px] truncate", render: (b) => b.category },
    {
      key: "total",
      label: "Total",
      className: "text-center font-mono text-[12px]",
      headerClassName: "text-center",
      render: (b) => b.totalCopies,
    },
    {
      key: "available",
      label: "Available",
      className: "text-center font-mono text-[12px]",
      headerClassName: "text-center",
      render: (b) => (
        <span className={cn(isLowStock(b) && "text-warning font-semibold")}>
          {b.availableCopies}
          {isLowStock(b) && <AlertTriangle className="inline h-3 w-3 ml-1 -mt-0.5" />}
        </span>
      ),
    },
    {
      key: "issued",
      label: "Issued",
      className: "text-center font-mono text-[12px]",
      headerClassName: "text-center",
      render: (b) => b.issuedCopies,
    },
    {
      key: "reserved",
      label: "Reserved",
      className: "text-center font-mono text-[12px]",
      headerClassName: "text-center",
      render: (b) => b.reservedCopies,
    },
    {
      key: "status",
      label: "Status",
      render: (b) => {
        const status = deriveStatus(b);
        return <StatusBadge variant={STATUS_VARIANT[status]}>{status}</StatusBadge>;
      },
    },
    ...(canWrite
      ? [
          {
            key: "actions" as const,
            label: "",
            headerClassName: "text-right",
            className: "text-right",
            render: (b: Book) => (
              <RowActions
                primary={[
                  { label: "View", icon: Eye, onClick: () => setSelectedBook(b) },
                  { label: "Edit", icon: Pencil, onClick: () => {} },
                ]}
                secondary={[
                  { label: "Adjust Stock", icon: Package, onClick: () => setStockBook(b) },
                  ...(canDelete
                    ? [{
                        label: "Delete",
                        icon: Trash2,
                        onClick: () => setDeleteTarget(b),
                        variant: "destructive" as const,
                        disabled: b.issuedCopies > 0 || b.reservedCopies > 0,
                      }]
                    : []),
                ]}
              />
            ),
          },
        ]
      : []),
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-[13px]">Loading inventory…</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <PageHeader
        title="Inventory"
        subtitle={`${stats.total} titles · ${stats.totalCopies} copies · ${stats.issued} issued · ${stats.reserved} reserved`}
        actions={
          canWrite ? (
            <>
              <input ref={excelUploadRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleExcelUpload} />
              <Button size="sm" variant="outline" className="gap-1.5 text-[13px] h-8" onClick={() => excelUploadRef.current?.click()}>
                <Upload className="h-3.5 w-3.5" /> Upload Excel
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 text-[13px] h-8" onClick={exportBooks}>
                <Download className="h-3.5 w-3.5" /> Export
              </Button>
              <Button size="sm" className="gap-1.5 text-[13px] h-8" onClick={() => setShowAddBook(true)}>
                <Plus className="h-3.5 w-3.5" /> Add Book
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" className="gap-1.5 text-[13px] h-8" onClick={exportBooks}>
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
          )
        }
      />

      {stats.lowStock > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded border border-warning/30 bg-warning/5 text-[12px] text-warning">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>{stats.lowStock} title{stats.lowStock > 1 ? "s" : ""} with low stock (≤ 2 available copies)</span>
        </div>
      )}

      <p className="text-[12px] text-muted-foreground">
        Statuses are system-derived from copy quantities. Only Total Copies is editable.
      </p>

      <div className="flex items-center gap-2 flex-wrap">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by title, author, ISBN, or ID..."
          className="flex-1 min-w-[200px] max-w-xs"
        />

        {/* Genre dropdown (many unique values) */}
        <Select value={genreFilter} onValueChange={setGenreFilter}>
          <SelectTrigger className="w-[180px] h-8 text-[12px]">
            <SelectValue placeholder="Genre" />
          </SelectTrigger>
          <SelectContent>
            {uniqueGenres.map((g) => (
              <SelectItem key={g} value={g} className="text-[12px]">{g}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category dropdown (many unique values) */}
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px] h-8 text-[12px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {uniqueCategories.map((c) => (
              <SelectItem key={c} value={c} className="text-[12px]">{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <FilterChips
          options={[...LANGUAGES]}
          value={languageFilter as typeof LANGUAGES[number]}
          onChange={setLanguageFilter}
        />
        <FilterChips
          options={[...STATUSES]}
          value={statusFilter as typeof STATUSES[number]}
          onChange={setStatusFilter}
          className="ml-auto"
        />
        {hasFilters && (
          <button onClick={resetFilters} className="text-[12px] text-muted-foreground hover:text-foreground underline">
            Reset
          </button>
        )}
      </div>

      <div className="text-[12px] text-muted-foreground">
        Showing {filtered.length} of {books.length} books
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(b) => b.id}
        onRowClick={(book) => setSelectedBook(book)}
        emptyMessage="No books match your filters."
        compact
      />

      <BookDetailDrawer
        book={selectedBook}
        open={!!selectedBook}
        onClose={() => setSelectedBook(null)}
        onUploadCover={(id, dataUrl) => {
          updateCover(id, dataUrl);
          if (selectedBook && selectedBook.id === id) {
            setSelectedBook({ ...selectedBook, thumbnail: dataUrl });
          }
        }}
      />

      <AdjustStockDialog
        book={stockBook}
        open={!!stockBook}
        onClose={() => setStockBook(null)}
        onConfirm={handleAdjustStock}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Book"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />

      <AddBookDialog
        open={showAddBook}
        onClose={() => setShowAddBook(false)}
        onAdd={handleAddBook}
      />
    </div>
  );
}
