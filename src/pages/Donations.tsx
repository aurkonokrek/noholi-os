import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/PageHeader";
import { SearchBar } from "@/components/SearchBar";
import { DataTable, type Column } from "@/components/DataTable";
import { StatusBadge, type BadgeVariant } from "@/components/StatusBadge";

interface Donation {
  id: string;
  donorName: string;
  bookTitle: string;
  author: string;
  condition: "New" | "Good" | "Fair" | "Poor";
  assignedId: string;
  date: string;
}

const CONDITION_VARIANT: Record<Donation["condition"], BadgeVariant> = {
  New: "success",
  Good: "accent",
  Fair: "warning",
  Poor: "destructive",
};

const DONATIONS: Donation[] = [
  { id: "DON-001", donorName: "Nairobi Book Club", bookTitle: "Sapiens", author: "Yuval Noah Harari", condition: "Good", assignedId: "ACC-0013", date: "2026-02-12" },
  { id: "DON-002", donorName: "Mary Wanjiku", bookTitle: "Educated", author: "Tara Westover", condition: "New", assignedId: "ACC-0014", date: "2026-02-10" },
  { id: "DON-003", donorName: "KCB Foundation", bookTitle: "The Art of War", author: "Sun Tzu", condition: "Fair", assignedId: "ACC-0015", date: "2026-02-08" },
  { id: "DON-004", donorName: "Anonymous", bookTitle: "To Kill a Mockingbird", author: "Harper Lee", condition: "Good", assignedId: "ACC-0016", date: "2026-02-05" },
  { id: "DON-005", donorName: "Safaricom PLC", bookTitle: "Zero to One", author: "Peter Thiel", condition: "New", assignedId: "ACC-0017", date: "2026-02-03" },
  { id: "DON-006", donorName: "James Oloo", bookTitle: "Things Fall Apart", author: "Chinua Achebe", condition: "Poor", assignedId: "ACC-0018", date: "2026-01-28" },
];

export default function DonationsPage() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = DONATIONS.filter(
    (d) =>
      !search ||
      d.donorName.toLowerCase().includes(search.toLowerCase()) ||
      d.bookTitle.toLowerCase().includes(search.toLowerCase()) ||
      d.id.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<Donation>[] = [
    { key: "id", label: "ID", className: "text-muted-foreground font-mono text-[12px]", render: (d) => d.id },
    { key: "donor", label: "Donor", className: "font-medium text-foreground", render: (d) => d.donorName },
    { key: "book", label: "Book Title", render: (d) => d.bookTitle },
    { key: "author", label: "Author", className: "text-muted-foreground", render: (d) => d.author },
    {
      key: "condition",
      label: "Condition",
      render: (d) => <StatusBadge variant={CONDITION_VARIANT[d.condition]}>{d.condition}</StatusBadge>,
    },
    { key: "assignedId", label: "Assigned ID", className: "text-muted-foreground font-mono text-[12px]", render: (d) => d.assignedId },
    { key: "date", label: "Date", className: "text-muted-foreground", render: (d) => d.date },
  ];

  return (
    <div className="space-y-3">
      <PageHeader
        title="Donations"
        subtitle={`${DONATIONS.length} donations recorded`}
        actions={
          <Button size="sm" className="gap-1.5 text-[13px] h-8" onClick={() => setShowForm(!showForm)}>
            {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {showForm ? "Cancel" : "Add Donation"}
          </Button>
        }
      />

      {showForm && (
        <div className="bg-card border border-border rounded p-3">
          <h2 className="text-[13px] font-semibold text-foreground mb-2">New Donation</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">Donor Name</label>
              <Input placeholder="Enter donor name" className="h-8 text-[13px]" />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">Book Title</label>
              <Input placeholder="Enter book title" className="h-8 text-[13px]" />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">Author</label>
              <Input placeholder="Enter author" className="h-8 text-[13px]" />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">Condition</label>
              <select className="w-full h-8 rounded border border-input bg-background px-2.5 text-[13px] text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option>New</option>
                <option>Good</option>
                <option>Fair</option>
                <option>Poor</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">Assign Accession ID</label>
              <Input placeholder="e.g. ACC-0019" className="h-8 text-[13px]" />
            </div>
            <div className="flex items-end">
              <Button size="sm" className="h-8 text-[13px]">Save Donation</Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search donations..."
          className="max-w-xs"
        />
        {search && (
          <button onClick={() => setSearch("")} className="text-[12px] text-muted-foreground hover:text-foreground underline">
            Reset
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(d) => d.id}
        compact
      />
    </div>
  );
}
