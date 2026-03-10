import { useState } from "react";
import { Plus, Pencil, Trash2, Eye, Archive, User, UserX, UserCheck } from "lucide-react";
import { AddMemberDialog } from "@/components/AddMemberDialog";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { SearchBar } from "@/components/SearchBar";
import { FilterChips } from "@/components/FilterChips";
import { DataTable, type Column } from "@/components/DataTable";
import { StatusBadge, type BadgeVariant } from "@/components/StatusBadge";
import { RowActions } from "@/components/RowActions";
import { ContactInfo } from "@/components/ContactInfo";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useCanWrite, useCanDelete } from "@/lib/roles";
import { useToast } from "@/hooks/use-toast";

interface Member {
  memberId: string;
  name: string;
  email: string;
  phone: string;
  activeLoans: number;
  fines: number;
  status: "Active" | "Suspended" | "Expired";
  avatar?: string;
}

const STATUS_VARIANT: Record<Member["status"], BadgeVariant> = {
  Active: "success",
  Suspended: "destructive",
  Expired: "warning",
};

const MEMBERS_DATA: Member[] = [
  { memberId: "MEM-1001", name: "Alice Mwangi", email: "alice@email.com", phone: "+254712345678", activeLoans: 2, fines: 0, status: "Active" },
  { memberId: "MEM-1002", name: "James Oloo", email: "james@email.com", phone: "+254723456789", activeLoans: 0, fines: 150, status: "Active" },
  { memberId: "MEM-1003", name: "John Otieno", email: "john@email.com", phone: "+254734567890", activeLoans: 0, fines: 500, status: "Suspended" },
  { memberId: "MEM-1004", name: "Sarah Njoki", email: "sarah@email.com", phone: "+254745678901", activeLoans: 1, fines: 0, status: "Active" },
  { memberId: "MEM-1005", name: "Peter Kamau", email: "peter@email.com", phone: "+254756789012", activeLoans: 1, fines: 75, status: "Active" },
  { memberId: "MEM-1006", name: "Grace Wambui", email: "grace@email.com", phone: "+254767890123", activeLoans: 1, fines: 0, status: "Active" },
  { memberId: "MEM-1007", name: "Daniel Kipchoge", email: "daniel@email.com", phone: "+254778901234", activeLoans: 1, fines: 200, status: "Active" },
  { memberId: "MEM-1008", name: "Faith Achieng", email: "faith@email.com", phone: "+254789012345", activeLoans: 1, fines: 0, status: "Active" },
  { memberId: "MEM-1009", name: "Moses Wekesa", email: "moses@email.com", phone: "+254790123456", activeLoans: 0, fines: 0, status: "Expired" },
  { memberId: "MEM-1010", name: "Lydia Chebet", email: "lydia@email.com", phone: "+254701234567", activeLoans: 0, fines: 350, status: "Suspended" },
];

const STATUS_OPTIONS = ["All", "Active", "Suspended", "Expired"] as const;

export default function MembersPage() {
  const canWrite = useCanWrite();
  const canDelete = useCanDelete();
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>(MEMBERS_DATA);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [confirmAction, setConfirmAction] = useState<{
    memberId: string;
    memberName: string;
    action: "suspend" | "reactivate";
  } | null>(null);

  const hasFilters = search || statusFilter !== "All";

  const handleStatusChange = () => {
    if (!confirmAction) return;
    const newStatus = confirmAction.action === "suspend" ? "Suspended" : "Active";
    setMembers((prev) =>
      prev.map((m) =>
        m.memberId === confirmAction.memberId ? { ...m, status: newStatus as Member["status"] } : m
      )
    );
    toast({
      title: confirmAction.action === "suspend" ? "Member suspended" : "Member reactivated",
      description: `${confirmAction.memberName} is now ${newStatus}`,
    });
    setConfirmAction(null);
  };

  const filtered = members.filter((m) => {
    const matchesSearch =
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.memberId.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: Column<Member>[] = [
    {
      key: "avatar",
      label: "",
      className: "w-10",
      render: (m) => (
        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
          {m.avatar ? (
            <img src={m.avatar} alt="" className="h-8 w-8 rounded-full object-cover" loading="lazy" />
          ) : (
            <User className="h-3.5 w-3.5 text-muted-foreground/50" />
          )}
        </div>
      ),
    },
    { key: "memberId", label: "ID", className: "text-muted-foreground font-mono text-[12px]", render: (m) => m.memberId },
    { key: "name", label: "Name", className: "font-medium text-foreground", render: (m) => m.name },
    {
      key: "contact",
      label: "Contact",
      render: (m) => <ContactInfo email={m.email} phone={m.phone} />,
    },
    { key: "activeLoans", label: "Loans", render: (m) => m.activeLoans },
    { key: "fines", label: "Fines (KES)", render: (m) => (m.fines > 0 ? m.fines.toLocaleString() : "—") },
    {
      key: "status",
      label: "Status",
      render: (m) => (
        <StatusBadge variant={STATUS_VARIANT[m.status]}>
          {m.status}
        </StatusBadge>
      ),
    },
    ...(canWrite
      ? [
          {
            key: "actions" as const,
            label: "",
            headerClassName: "text-right",
            className: "text-right",
            render: (m: Member) => (
              <RowActions
                primary={[
                  { label: "View", icon: Eye, onClick: () => {} },
                  { label: "Edit", icon: Pencil, onClick: () => {} },
                ]}
                secondary={[
                  ...(m.status === "Active"
                    ? [{
                        label: "Suspend",
                        icon: UserX,
                        onClick: () => setConfirmAction({ memberId: m.memberId, memberName: m.name, action: "suspend" }),
                        variant: "destructive" as const,
                      }]
                    : [{
                        label: "Reactivate",
                        icon: UserCheck,
                        onClick: () => setConfirmAction({ memberId: m.memberId, memberName: m.name, action: "reactivate" }),
                      }]),
                  { label: "Archive", icon: Archive, onClick: () => {} },
                  ...(canDelete
                    ? [{ label: "Delete", icon: Trash2, onClick: () => {}, variant: "destructive" as const }]
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
        title="Members"
        subtitle={`${members.length} registered members`}
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

      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title={confirmAction?.action === "suspend" ? "Suspend Member" : "Reactivate Member"}
        description={
          confirmAction?.action === "suspend"
            ? `Are you sure you want to suspend ${confirmAction.memberName}? They will lose access to borrowing privileges.`
            : `Reactivate ${confirmAction?.memberName ?? ""}? They will regain borrowing privileges.`
        }
        confirmLabel={confirmAction?.action === "suspend" ? "Suspend" : "Reactivate"}
        variant={confirmAction?.action === "suspend" ? "destructive" : "default"}
        onConfirm={handleStatusChange}
      />
    </div>
  );
}
