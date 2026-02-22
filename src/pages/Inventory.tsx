import { useState } from "react";
import { Plus, Upload, Download, Pencil, Trash2, BookOpen, Eye, Package, AlertTriangle } from "lucide-react";
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
import { useInventory, deriveStatus, isLowStock, type Book, type BookStatus } from "@/hooks/use-inventory";
import { useCanWrite, useCanDelete } from "@/lib/roles";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STATUS_VARIANT: Record<BookStatus, BadgeVariant> = {
  Available: "success",
  Unavailable: "warning",
  "Out of Stock": "destructive",
};

const GENRES = ["All", "Fiction", "Non-Fiction", "Self-Help", "Memoir", "Poetry", "Science", "History", "Philosophy", "Religion", "Children"] as const;
const LANGUAGES = ["All", "Bangla", "English"] as const;
const STATUSES = ["All", "Available", "Unavailable", "Out of Stock"] as const;

export default function Inventory() {
  const canWrite = useCanWrite();
  const canDelete = useCanDelete();
  const { books, stats, adjustStock, deleteBook } = useInventory();

  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState<string>("All");
  const [languageFilter, setLanguageFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [stockBook, setStockBook] = useState<Book | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);

  const hasFilters = search || genreFilter !== "All" || languageFilter !== "All" || statusFilter !== "All";

  const resetFilters = () => {
    setSearch("");
    setGenreFilter("All");
    setLanguageFilter("All");
    setStatusFilter("All");
  };

  const filtered = books.filter((b) => {
    const matchesSearch =
      !search ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.isbn.toLowerCase().includes(search.toLowerCase());
    const matchesGenre = genreFilter === "All" || b.genre === genreFilter;
    const matchesLanguage = languageFilter === "All" || b.language === languageFilter;
    const status = deriveStatus(b);
    const matchesStatus = statusFilter === "All" || status === statusFilter;
    return matchesSearch && matchesGenre && matchesLanguage && matchesStatus;
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
    { key: "title", label: "Title", className: "font-medium text-foreground", render: (b) => b.title },
    { key: "author", label: "Author", className: "text-muted-foreground", render: (b) => b.author },
    { key: "genre", label: "Genre", className: "text-muted-foreground", render: (b) => b.genre },
    { key: "language", label: "Language", className: "text-muted-foreground", render: (b) => b.language },
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

  return (
    <div className="space-y-3">
      <PageHeader
        title="Inventory"
        subtitle={`${stats.total} titles · ${stats.totalCopies} copies · ${stats.issued} issued · ${stats.reserved} reserved`}
        actions={
          canWrite ? (
            <>
              <Button size="sm" variant="outline" className="gap-1.5 text-[13px] h-8">
                <Upload className="h-3.5 w-3.5" /> Upload Excel
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 text-[13px] h-8">
                <Download className="h-3.5 w-3.5" /> Export
              </Button>
              <Button size="sm" className="gap-1.5 text-[13px] h-8">
                <Plus className="h-3.5 w-3.5" /> Add Book
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" className="gap-1.5 text-[13px] h-8">
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
        <FilterChips
          options={[...GENRES]}
          value={genreFilter as typeof GENRES[number]}
          onChange={setGenreFilter}
        />
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
    </div>
  );
}
