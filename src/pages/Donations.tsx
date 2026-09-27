import { useState } from "react";
import { Plus, X, Check, XCircle, Pencil, Eye, Trash2, Loader2, PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { SearchBar } from "@/components/SearchBar";
import { FilterChips } from "@/components/FilterChips";
import { DataTable, type Column } from "@/components/DataTable";
import { StatusBadge, type BadgeVariant } from "@/components/StatusBadge";
import { RowActions, type ActionItem } from "@/components/RowActions";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useCanWrite, useCanDelete } from "@/lib/roles";
import { useToast } from "@/hooks/use-toast";
import { useDonations, type Donation, type DonationInput } from "@/hooks/use-donations";
import {
  STATUS_VARIANT, DonationFields, DonationViewDrawer, EditDonationDialog, RejectDonationDialog, AddToInventoryDialog,
  emptyDonationInput, isDonationInputValid, trimInput,
} from "@/components/donations/DonationDialogs";

const CONDITION_VARIANT: Record<Donation["condition"], BadgeVariant> = {
  New: "success",
  Good: "accent",
  Fair: "warning",
  Poor: "destructive",
};

const FILTER_OPTIONS = ["All", "Pending", "Approved", "Rejected", "Added to Inventory"] as const;

const errMsg = (e: unknown) => (e instanceof Error ? e.message : typeof e === "object" && e && "message" in e ? String((e as any).message) : "Unknown error");

export default function DonationsPage() {
  const canWrite = useCanWrite();
  const canDelete = useCanDelete();
  const { toast } = useToast();
  const { donations, loading, addDonation, updateDonation, approve, reject, addToInventory, deleteDonation } = useDonations();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [form, setForm] = useState<DonationInput>(emptyDonationInput());
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [viewing, setViewing] = useState<Donation | null>(null);
  const [editing, setEditing] = useState<Donation | null>(null);
  const [rejecting, setRejecting] = useState<Donation | null>(null);
  const [adding, setAdding] = useState<Donation | null>(null);
  const [deleting, setDeleting] = useState<Donation | null>(null);

  const hasFilters = search || statusFilter !== "All";

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
  };

  const filtered = donations.filter((d) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      d.donorName.toLowerCase().includes(q) ||
      d.bookTitle.toLowerCase().includes(q) ||
      d.id.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "All" || d.reviewStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const fail = (title: string, e: unknown) => toast({ title, description: errMsg(e), variant: "destructive" });

  const handleSave = async () => {
    setSaving(true);
    try {
      const id = await addDonation(trimInput(form));
      toast({ title: "Donation recorded", description: `${id} · ${form.bookTitle.trim()}` });
      setForm(emptyDonationInput());
      setShowForm(false);
    } catch (e) { fail("Could not save donation", e); } finally { setSaving(false); }
  };

  const handleApprove = async (id: string) => {
    if (busyId) return;
    setBusyId(id);
    try {
      await approve(id);
      toast({ title: "Donation approved", description: `${id} is ready to be added to Inventory` });
    } catch (e) { fail("Could not approve", e); } finally { setBusyId(null); }
  };

  const pendingCount = donations.filter((d) => d.reviewStatus === "Pending").length;

  const actionsFor = (d: Donation) => {
    const view: ActionItem = { label: "View", icon: Eye, onClick: () => setViewing(d) };
    const busy = busyId === d.id;
    let primary: ActionItem[] = [view];
    if (d.reviewStatus === "Pending") {
      primary = [
        { label: "Approve", icon: Check, onClick: () => handleApprove(d.id), disabled: busy },
        { label: "Reject", icon: XCircle, onClick: () => setRejecting(d), variant: "destructive", disabled: busy },
      ];
    } else if (d.reviewStatus === "Approved" && !d.assignedAccessionId) {
      primary = [{ label: "Add to Inventory", icon: PackagePlus, onClick: () => setAdding(d) }, view];
    }
    const secondary: ActionItem[] = [
      ...(d.reviewStatus === "Pending" ? [view, { label: "Edit", icon: Pencil, onClick: () => setEditing(d) }] : []),
      ...(canDelete && d.reviewStatus !== "Added to Inventory"
        ? [{ label: "Delete", icon: Trash2, onClick: () => setDeleting(d), variant: "destructive" as const }]
        : []),
    ];
    return { primary, secondary };
  };

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
      label: "Inventory Book ID",
      className: "text-muted-foreground font-mono text-[12px]",
      render: (d) => d.assignedAccessionId ?? "—",
    },
    ...(canWrite
      ? [
          {
            key: "actions" as const,
            label: "",
            headerClassName: "text-right",
            className: "text-right",
            render: (d: Donation) => {
              const a = actionsFor(d);
              return <RowActions primary={a.primary} secondary={a.secondary} />;
            },
          },
        ]
      : []),
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-[13px]">Loading donations…</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <PageHeader
        title="Book Donations"
        subtitle={`${donations.length} donations · ${pendingCount} pending review`}
        actions={
          canWrite ? (
            <Button size="sm" className="gap-1.5 text-[13px] h-8" onClick={() => setShowForm(!showForm)}>
              {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              {showForm ? "Cancel" : "Record New Donation"}
            </Button>
          ) : undefined
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
              <Input placeholder="Enter donor name" className="h-8 text-[13px]" value={donorName} onChange={(e) => setDonorName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">Book Title</label>
              <Input placeholder="Enter book title" className="h-8 text-[13px]" value={bookTitle} onChange={(e) => setBookTitle(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">Condition</label>
              <select
                className="w-full h-8 rounded border border-input bg-background px-2.5 text-[13px] text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={condition}
                onChange={(e) => setCondition(e.target.value as Donation["condition"])}
              >
                <option>New</option>
                <option>Good</option>
                <option>Fair</option>
                <option>Poor</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                size="sm"
                className="h-8 text-[13px]"
                disabled={!donorName.trim() || !bookTitle.trim()}
                onClick={async () => {
                  await addDonation({ donorName: donorName.trim(), bookTitle: bookTitle.trim(), condition });
                  toast({ title: "Donation recorded", description: `${bookTitle} from ${donorName}` });
                  setDonorName("");
                  setBookTitle("");
                  setCondition("New");
                  setShowForm(false);
                }}
              >
                Save Donation
              </Button>
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
