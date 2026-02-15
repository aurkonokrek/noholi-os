import { useState } from "react";
import { Plus, Upload, Download, Pencil, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { SearchBar } from "@/components/SearchBar";
import { FilterChips } from "@/components/FilterChips";
import { DataTable, type Column } from "@/components/DataTable";
import { StatusBadge, type BadgeVariant } from "@/components/StatusBadge";
import { BookDetailDrawer } from "@/components/BookDetailDrawer";
import { useCanWrite, useCanDelete } from "@/lib/roles";

type BookStatus = "Available" | "Issued" | "Reserved";

interface Book {
  accessionId: string;
  title: string;
  author: string;
  category: string;
  status: BookStatus;
  location: string;
  thumbnail?: string;
}

const STATUS_VARIANT: Record<BookStatus, BadgeVariant> = {
  Available: "success",
  Issued: "accent",
  Reserved: "warning",
};

const BOOKS: Book[] = [
  { accessionId: "ACC-0001", title: "Things Fall Apart", author: "Chinua Achebe", category: "Fiction", status: "Available", location: "Shelf A-12" },
  { accessionId: "ACC-0002", title: "Sapiens", author: "Yuval Noah Harari", category: "Non-Fiction", status: "Issued", location: "Shelf B-03" },
  { accessionId: "ACC-0003", title: "1984", author: "George Orwell", category: "Fiction", status: "Reserved", location: "Shelf A-07" },
  { accessionId: "ACC-0004", title: "The Great Gatsby", author: "F. Scott Fitzgerald", category: "Fiction", status: "Available", location: "Shelf A-14" },
  { accessionId: "ACC-0005", title: "Beloved", author: "Toni Morrison", category: "Fiction", status: "Issued", location: "Shelf C-01" },
  { accessionId: "ACC-0006", title: "Americanah", author: "Chimamanda Ngozi Adichie", category: "Fiction", status: "Available", location: "Shelf A-20" },
  { accessionId: "ACC-0007", title: "Atomic Habits", author: "James Clear", category: "Self-Help", status: "Issued", location: "Shelf D-05" },
  { accessionId: "ACC-0008", title: "Half of a Yellow Sun", author: "Chimamanda Ngozi Adichie", category: "Fiction", status: "Available", location: "Shelf A-21" },
  { accessionId: "ACC-0009", title: "Educated", author: "Tara Westover", category: "Memoir", status: "Reserved", location: "Shelf B-11" },
  { accessionId: "ACC-0010", title: "Weep Not, Child", author: "Ngũgĩ wa Thiong'o", category: "Fiction", status: "Available", location: "Shelf A-03" },
  { accessionId: "ACC-0011", title: "Thinking, Fast and Slow", author: "Daniel Kahneman", category: "Non-Fiction", status: "Issued", location: "Shelf B-08" },
  { accessionId: "ACC-0012", title: "The Alchemist", author: "Paulo Coelho", category: "Fiction", status: "Available", location: "Shelf A-09" },
];

const CATEGORIES = ["All", "Fiction", "Non-Fiction", "Self-Help", "Memoir"] as const;
const STATUSES = ["All", "Available", "Issued", "Reserved"] as const;

export default function Inventory() {
  const canWrite = useCanWrite();
  const canDelete = useCanDelete();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const hasFilters = search || categoryFilter !== "All" || statusFilter !== "All";

  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("All");
    setStatusFilter("All");
  };

  const filtered = BOOKS.filter((b) => {
    const matchesSearch =
      !search ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      b.accessionId.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "All" || b.category === categoryFilter;
    const matchesStatus = statusFilter === "All" || b.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const columns: Column<Book>[] = [
    {
      key: "thumb",
      label: "",
      className: "w-10",
      render: (b) => (
        <div className="h-8 w-8 rounded bg-secondary flex items-center justify-center shrink-0">
          {b.thumbnail ? (
            <img src={b.thumbnail} alt="" className="h-8 w-8 rounded object-cover" />
          ) : (
            <BookOpen className="h-3.5 w-3.5 text-muted-foreground/50" />
          )}
        </div>
      ),
    },
    { key: "accessionId", label: "Accession ID", className: "text-muted-foreground font-mono text-[12px]", render: (b) => b.accessionId },
    { key: "title", label: "Title", className: "font-medium text-foreground", render: (b) => b.title },
    { key: "author", label: "Author", className: "text-muted-foreground", render: (b) => b.author },
    { key: "category", label: "Category", className: "text-muted-foreground", render: (b) => b.category },
    {
      key: "status",
      label: "Status",
      render: (b) => <StatusBadge variant={STATUS_VARIANT[b.status]}>{b.status}</StatusBadge>,
    },
    { key: "location", label: "Location", className: "text-muted-foreground", render: (b) => b.location },
    ...(canWrite ? [{
      key: "actions" as const,
      label: "Actions",
      render: () => (
        <div className="flex items-center gap-1">
          <button className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          {canDelete && (
            <button className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ),
    }] : []),
  ];

  return (
    <div className="space-y-3">
      <PageHeader
        title="Inventory"
        subtitle={`${filtered.length} of ${BOOKS.length} books`}
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

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by title, author, or ID..."
          className="flex-1 min-w-[200px] max-w-xs"
        />
        <FilterChips
          options={[...CATEGORIES]}
          value={categoryFilter as typeof CATEGORIES[number]}
          onChange={setCategoryFilter}
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
        keyExtractor={(b) => b.accessionId}
        onRowClick={(book) => setSelectedBook(book)}
        emptyMessage="No books match your filters."
        compact
      />

      <BookDetailDrawer
        book={selectedBook}
        open={!!selectedBook}
        onClose={() => setSelectedBook(null)}
      />
    </div>
  );
}
