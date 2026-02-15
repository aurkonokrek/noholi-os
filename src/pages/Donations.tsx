import { useState } from "react";
import { Plus, X, Check, XCircle, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/PageHeader";
import { SearchBar } from "@/components/SearchBar";
import { FilterChips } from "@/components/FilterChips";
import { DataTable, type Column } from "@/components/DataTable";
import { StatusBadge, type BadgeVariant } from "@/components/StatusBadge";

type ReviewStatus = "Pending" | "Approved" | "Rejected" | "Added to Inventory";

interface Donation {
  id: string;
  donorName: string;
  bookTitle: string;
  condition: "New" | "Good" | "Fair" | "Poor";
  dateReceived: string;
  reviewStatus: ReviewStatus;
  assignedAccessionId?: string;
}

const CONDITION_VARIANT: Record<Donation["condition"], BadgeVariant> = {
  New: "success",
  Good: "accent",
  Fair: "warning",
  Poor: "destructive",
};

const STATUS_VARIANT: Record<ReviewStatus, BadgeVariant> = {
  Pending: "warning",
  Approved: "accent",
  Rejected: "destructive",
  "Added to Inventory": "success",
};

const INITIAL_DONATIONS: Donation[] = [
  { id: "DON-001", donorName: "Nairobi Book Club", bookTitle: "Sapiens", condition: "Good", dateReceived: "2026-02-12", reviewStatus: "Pending" },
  { id: "DON-002", donorName: "Mary Wanjiku", bookTitle: "Educated", condition: "New", dateReceived: "2026-02-10", reviewStatus: "Pending" },
  { id: "DON-003", donorName: "KCB Foundation", bookTitle: "The Art of War", condition: "Fair", dateReceived: "2026-02-08", reviewStatus: "Approved", assignedAccessionId: "ACC-0015" },
  { id: "DON-004", donorName: "Anonymous", bookTitle: "To Kill a Mockingbird", condition: "Good", dateReceived: "2026-02-05", reviewStatus: "Added to Inventory", assignedAccessionId: "ACC-0016" },
  { id: "DON-005", donorName: "Safaricom PLC", bookTitle: "Zero to One", condition: "New", dateReceived: "2026-02-03", reviewStatus: "Approved", assignedAccessionId: "ACC-0017" },
  { id: "DON-006", donorName: "James Oloo", bookTitle: "Things Fall Apart", condition: "Poor", dateReceived: "2026-01-28", reviewStatus: "Rejected" },
];

const FILTER_OPTIONS = ["All", "Pending", "Approved", "Rejected", "Added to Inventory"] as const;

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>(INITIAL_DONATIONS);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const hasFilters = search || statusFilter !== "All";

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
  };

  const filtered = donations.filter((d) => {
    const matchesSearch =
      !search ||
      d.donorName.toLowerCase().includes(search.toLowerCase()) ||
      d.bookTitle.toLowerCase().includes(search.toLowerCase()) ||
      d.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || d.reviewStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const approve = (id: string) => {
    setDonations((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, reviewStatus: "Approved" as const, assignedAccessionId: `ACC-${String(Math.floor(Math.random() * 9000) + 1000)}` }
          : d
      )
    );
  };

  const reject = (id: string) => {
    setDonations((prev) =>
      prev.map((d) => (d.id === id ? { ...d, reviewStatus: "Rejected" as const } : d))
    );
  };

  const pendingCount = donations.filter((d) => d.reviewStatus === "Pending").length;

  const columns: Column<Donation>[] = [
    { key: "id", label: "ID", className: "text-muted-foreground font-mono text-[12px]", render: (d) => d.id },
    { key: "donor", label: "Donor", className: "font-medium text-foreground", render: (d) => d.donorName },
    { key: "book", label: "Book Title", render: (d) => d.bookTitle },
    {
      key: "condition",
      label: "Condition",
      render: (d) => <StatusBadge variant={CONDITION_VARIANT[d.condition]}>{d.condition}</StatusBadge>,
    },
    { key: "date", label: "Date Received", className: "text-muted-foreground", render: (d) => d.dateReceived },
    {
      key: "status",
      label: "Review Status",
      render: (d) => <StatusBadge variant={STATUS_VARIANT[d.reviewStatus]}>{d.reviewStatus}</StatusBadge>,
    },
    {
      key: "accession",
      label: "Accession ID",
      className: "text-muted-foreground font-mono text-[12px]",
      render: (d) => d.assignedAccessionId ?? "—",
    },
    {
      key: "actions",
      label: "Actions",
      render: (d) => {
        if (d.reviewStatus !== "Pending") return null;
        return (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); approve(d.id); }}
              className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title="Approve & assign accession ID"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); reject(d.id); }}
              className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              title="Reject donation"
            >
              <XCircle className="h-3.5 w-3.5" />
            </button>
            <button
              className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title="Edit details"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-3">
      <PageHeader
        title="Book Donations"
        subtitle={`${donations.length} donations · ${pendingCount} pending review`}
        actions={
          <Button size="sm" className="gap-1.5 text-[13px] h-8" onClick={() => setShowForm(!showForm)}>
            {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {showForm ? "Cancel" : "Record New Donation"}
          </Button>
        }
      />

      <p className="text-[12px] text-muted-foreground">
        Manage and review books received as donations before adding them to the main inventory.
      </p>

      {showForm && (
        <div className="bg-card border border-border rounded p-3">
          <h2 className="text-[13px] font-semibold text-foreground mb-2">Record Donation</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">Donor Name</label>
              <Input placeholder="Enter donor name" className="h-8 text-[13px]" />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">Book Title</label>
              <Input placeholder="Enter book title" className="h-8 text-[13px]" />
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
            <div className="flex items-end">
              <Button size="sm" className="h-8 text-[13px]">Save Donation</Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by donor, title, or ID..."
          className="flex-1 min-w-[200px] max-w-xs"
        />
        <FilterChips
          options={[...FILTER_OPTIONS]}
          value={statusFilter as typeof FILTER_OPTIONS[number]}
          onChange={setStatusFilter}
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
        keyExtractor={(d) => d.id}
        emptyMessage="No donations match your filters."
        compact
      />
    </div>
  );
}
