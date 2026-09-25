import { useState } from "react";
import { Plus, Pencil, Trash2, Eye, History, Archive, User, UserX, UserCheck, Loader2 } from "lucide-react";
import { AddMemberDialog } from "@/components/AddMemberDialog";
import { EditMemberDialog } from "@/components/EditMemberDialog";
import { MemberViewDrawer } from "@/components/MemberViewDrawer";
import { formatTaka } from "@/lib/currency";
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
import { useMembers, MERIT_GRADES, type Member } from "@/hooks/use-members";

const STATUS_VARIANT: Record<Member["status"], BadgeVariant> = {
  Active: "success",
  Suspended: "destructive",
  Expired: "warning",
};

const STATUS_OPTIONS = ["All", "Active", "Suspended", "Expired"] as const;
const MERIT_OPTIONS = ["All Merit", ...MERIT_GRADES] as string[];

export default function MembersPage() {
  const canWrite = useCanWrite();
  const canDelete = useCanDelete();
  const { toast } = useToast();
  const { members, loading, addMember, updateStatus, updateMember, deleteMember, archiveMember } = useMembers();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [meritFilter, setMeritFilter] = useState<string>("All Merit");
  const [viewMemberId, setViewMemberId] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<"profile" | "history">("profile");
  const [showAddMember, setShowAddMember] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    memberId: string;
    memberName: string;
    action: "suspend" | "reactivate" | "delete" | "archive";
  } | null>(null);

  const hasFilters = search || statusFilter !== "All" || meritFilter !== "All Merit";
  const viewMember = members.find((m) => m.memberId === viewMemberId) ?? null;
  const openView = (m: Member, tab: "profile" | "history") => { setViewTab(tab); setViewMemberId(m.memberId); };

  const handleConfirm = async () => {
    if (!confirmAction) return;
    const { memberId, memberName, action } = confirmAction;

    if (action === "suspend") {
      await updateStatus(memberId, "Suspended");
      toast({ title: "Member suspended", description: `${memberName} is now Suspended` });
    } else if (action === "reactivate") {
      await updateStatus(memberId, "Active");
      toast({ title: "Member reactivated", description: `${memberName} is now Active` });
    } else if (action === "delete") {
      await deleteMember(memberId);
      toast({ title: "Member deleted", description: `${memberName} has been removed` });
    } else if (action === "archive") {
      await archiveMember(memberId);
      toast({ title: "Member archived", description: `${memberName} has been archived` });
    }
    setConfirmAction(null);
  };

  const filtered = members.filter((m) => {
    const matchesSearch =
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.memberId.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || m.status === statusFilter;
    const matchesMerit = meritFilter === "All Merit" || m.meritGrade === meritFilter;
    return matchesSearch && matchesStatus && matchesMerit;
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
    {
      key: "location",
      label: "Location",
      render: (m) => {
        const loc = [m.city, m.district].filter(Boolean).join(", ");
        return loc ? <span className="text-[13px] text-muted-foreground">{loc}</span> : <span className="text-muted-foreground/50">—</span>;
      },
    },
    { key: "activeLoans", label: "Loans", render: (m) => m.activeLoans },
    { key: "fines", label: "Fines (৳)", render: (m) => (m.fines > 0 ? formatTaka(m.fines) : "—") },
    {
      key: "merit",
      label: "Merit",
      render: (m) => <StatusBadge variant={m.meritGrade === "Not Assigned" ? "muted" : "default"}>{m.meritGrade}</StatusBadge>,
    },
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
                  { label: "View", icon: Eye, onClick: () => openView(m, "profile") },
                  { label: "History", icon: History, onClick: () => openView(m, "history") },
                  { label: "Edit", icon: Pencil, onClick: () => setEditMember(m) },
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
                  {
                    label: "Archive",
                    icon: Archive,
                    onClick: () => setConfirmAction({ memberId: m.memberId, memberName: m.name, action: "archive" }),
                  },
                  ...(canDelete
                    ? [{
                        label: "Delete",
                        icon: Trash2,
                        onClick: () => setConfirmAction({ memberId: m.memberId, memberName: m.name, action: "delete" }),
                        variant: "destructive" as const,
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
        <span className="text-[13px]">Loading members…</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <PageHeader
        title="Members"
        subtitle={`${members.length} registered members`}
        actions={
          canWrite ? (
            <Button size="sm" className="gap-1.5 text-[13px] h-8" onClick={() => setShowAddMember(true)}>
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
        <FilterChips options={MERIT_OPTIONS} value={meritFilter} onChange={setMeritFilter} />
        {hasFilters && (
          <button
            onClick={() => { setSearch(""); setStatusFilter("All"); setMeritFilter("All Merit"); }}
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
        title={
          confirmAction?.action === "suspend" ? "Suspend Member"
            : confirmAction?.action === "reactivate" ? "Reactivate Member"
            : confirmAction?.action === "delete" ? "Delete Member"
            : "Archive Member"
        }
        description={
          confirmAction?.action === "suspend"
            ? `Are you sure you want to suspend ${confirmAction.memberName}? They will lose access to borrowing privileges.`
            : confirmAction?.action === "reactivate"
            ? `Reactivate ${confirmAction?.memberName ?? ""}? They will regain borrowing privileges.`
            : confirmAction?.action === "delete"
            ? `Permanently delete ${confirmAction?.memberName ?? ""}? This action cannot be undone.`
            : `Archive ${confirmAction?.memberName ?? ""}? Their status will be set to Expired.`
        }
        confirmLabel={
          confirmAction?.action === "suspend" ? "Suspend"
            : confirmAction?.action === "reactivate" ? "Reactivate"
            : confirmAction?.action === "delete" ? "Delete"
            : "Archive"
        }
        variant={confirmAction?.action === "delete" || confirmAction?.action === "suspend" ? "destructive" : "default"}
        onConfirm={handleConfirm}
      />

      <AddMemberDialog
        open={showAddMember}
        onClose={() => setShowAddMember(false)}
        onAdd={async (member) => {
          const id = await addMember(member);
          toast({ title: "Member added", description: `${member.name} (${id})` });
        }}
      />

      <MemberViewDrawer
        member={viewMember}
        tab={viewTab}
        onTabChange={setViewTab}
        onClose={() => setViewMemberId(null)}
        onEdit={(m) => setEditMember(m)}
      />

      <EditMemberDialog
        open={!!editMember}
        onClose={() => setEditMember(null)}
        member={editMember}
        onSave={async (updates) => {
          if (!editMember) return;
          await updateMember(editMember.memberId, updates);
          toast({ title: "Member updated", description: `${updates.name} has been updated` });
        }}
      />
    </div>
  );
}
