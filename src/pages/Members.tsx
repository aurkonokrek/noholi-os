import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { SearchBar } from "@/components/SearchBar";
import { FilterChips } from "@/components/FilterChips";
import { DataTable, type Column } from "@/components/DataTable";
import { StatusBadge, type BadgeVariant } from "@/components/StatusBadge";
import { useCanWrite, useCanDelete } from "@/lib/roles";

interface Member {
  memberId: string;
  name: string;
  contact: string;
  activeLoans: number;
  fines: number;
  status: "Active" | "Suspended" | "Expired";
}

const STATUS_VARIANT: Record<Member["status"], BadgeVariant> = {
  Active: "success",
  Suspended: "destructive",
  Expired: "warning",
};

const MEMBERS: Member[] = [
  { memberId: "MEM-1001", name: "Alice Mwangi", contact: "alice@email.com", activeLoans: 2, fines: 0, status: "Active" },
  { memberId: "MEM-1002", name: "James Oloo", contact: "james@email.com", activeLoans: 0, fines: 150, status: "Active" },
  { memberId: "MEM-1003", name: "John Otieno", contact: "john@email.com", activeLoans: 0, fines: 500, status: "Suspended" },
  { memberId: "MEM-1004", name: "Sarah Njoki", contact: "sarah@email.com", activeLoans: 1, fines: 0, status: "Active" },
  { memberId: "MEM-1005", name: "Peter Kamau", contact: "peter@email.com", activeLoans: 1, fines: 75, status: "Active" },
  { memberId: "MEM-1006", name: "Grace Wambui", contact: "grace@email.com", activeLoans: 1, fines: 0, status: "Active" },
  { memberId: "MEM-1007", name: "Daniel Kipchoge", contact: "daniel@email.com", activeLoans: 1, fines: 200, status: "Active" },
  { memberId: "MEM-1008", name: "Faith Achieng", contact: "faith@email.com", activeLoans: 1, fines: 0, status: "Active" },
  { memberId: "MEM-1009", name: "Moses Wekesa", contact: "moses@email.com", activeLoans: 0, fines: 0, status: "Expired" },
  { memberId: "MEM-1010", name: "Lydia Chebet", contact: "lydia@email.com", activeLoans: 0, fines: 350, status: "Suspended" },
];

const STATUS_OPTIONS = ["All", "Active", "Suspended", "Expired"] as const;

export default function MembersPage() {
  const canWrite = useCanWrite();
  const canDelete = useCanDelete();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const hasFilters = search || statusFilter !== "All";

  const filtered = MEMBERS.filter((m) => {
    const matchesSearch =
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.memberId.toLowerCase().includes(search.toLowerCase()) ||
      m.contact.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: Column<Member>[] = [
    { key: "memberId", label: "Member ID", className: "text-muted-foreground font-mono text-[12px]", render: (m) => m.memberId },
    { key: "name", label: "Name", className: "font-medium text-foreground", render: (m) => m.name },
    { key: "contact", label: "Contact", className: "text-muted-foreground", render: (m) => m.contact },
    { key: "activeLoans", label: "Active Loans", render: (m) => m.activeLoans },
    { key: "fines", label: "Fines (KES)", render: (m) => (m.fines > 0 ? m.fines.toLocaleString() : "—") },
    {
      key: "status",
      label: "Status",
      render: (m) => <StatusBadge variant={STATUS_VARIANT[m.status]}>{m.status}</StatusBadge>,
    },
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
        title="Members"
        subtitle={`${MEMBERS.length} registered members`}
        actions={
          canWrite ? (
            <Button size="sm" className="gap-1.5 text-[13px] h-8">
              <Plus className="h-3.5 w-3.5" /> Add Member
            </Button>
          ) : undefined
        }
      />

      <div className="flex items-center gap-2 flex-wrap">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search members..."
          className="flex-1 min-w-[200px] max-w-xs"
        />
        <FilterChips
          options={[...STATUS_OPTIONS]}
          value={statusFilter as typeof STATUS_OPTIONS[number]}
          onChange={setStatusFilter}
        />
        {hasFilters && (
          <button
            onClick={() => { setSearch(""); setStatusFilter("All"); }}
            className="text-[12px] text-muted-foreground hover:text-foreground underline"
          >
            Reset
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(m) => m.memberId}
        emptyMessage="No members found."
        compact
      />
    </div>
  );
}
