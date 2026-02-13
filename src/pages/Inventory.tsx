import { useState } from "react";
import { Plus, Upload, Download, Filter, Search, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type BookStatus = "Available" | "Issued" | "Reserved";

interface Book {
  accessionId: string;
  title: string;
  author: string;
  category: string;
  status: BookStatus;
  location: string;
}

const STATUS_STYLES: Record<BookStatus, string> = {
  Available: "bg-success/10 text-success border-success/20",
  Issued: "bg-accent/10 text-accent border-accent/20",
  Reserved: "bg-warning/10 text-warning border-warning/20",
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

const CATEGORIES = ["All", "Fiction", "Non-Fiction", "Self-Help", "Memoir"];

export default function Inventory() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"All" | BookStatus>("All");

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Inventory</h1>
          <p className="text-[13px] text-muted-foreground">
            {filtered.length} of {BOOKS.length} books
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="gap-1.5 text-[13px]">
            <Upload className="h-3.5 w-3.5" /> Upload Excel
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-[13px]">
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Button size="sm" className="gap-1.5 text-[13px]">
            <Plus className="h-3.5 w-3.5" /> Add Book
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by title, author, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-[13px]"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded text-[12px] font-medium transition-colors ${
                categoryFilter === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          {(["All", "Available", "Issued", "Reserved"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded text-[12px] font-medium transition-colors ${
                statusFilter === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Accession ID</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Title</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Author</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Category</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Status</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Location</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((book) => (
                <tr key={book.accessionId} className="border-b border-border last:border-b-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-2.5 text-muted-foreground font-mono text-[12px]">{book.accessionId}</td>
                  <td className="px-4 py-2.5 font-medium text-foreground">{book.title}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{book.author}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{book.category}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border ${STATUS_STYLES[book.status]}`}>
                      {book.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{book.location}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1">
                      <button className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No books match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
