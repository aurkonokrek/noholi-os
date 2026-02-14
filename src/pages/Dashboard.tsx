import { BookOpen, ArrowLeftRight, AlertTriangle, Users, Gift, Clock, BadgeDollarSign, Package, FileCheck } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { DataTable, type Column } from "@/components/DataTable";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
}

function StatCard({ label, value, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded p-3 flex items-start gap-2.5">
      <div className="p-1.5 bg-secondary rounded">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground leading-tight">
          {label}
        </p>
        <p className="text-lg font-semibold text-foreground leading-tight mt-0.5">
          {value}
        </p>
        {trend && (
          <p className="text-[11px] text-muted-foreground">{trend}</p>
        )}
      </div>
    </div>
  );
}

/* Attention Required */
const ALERTS = [
  { label: "Overdue books", value: 47, icon: Clock, variant: "destructive" as const },
  { label: "Pending fines", value: 12, icon: BadgeDollarSign, variant: "warning" as const },
  { label: "Low stock categories", value: 3, icon: Package, variant: "warning" as const },
  { label: "Donation approvals", value: 5, icon: FileCheck, variant: "accent" as const },
];

/* Recent Activity */
interface Activity {
  book: string;
  member: string;
  action: string;
  date: string;
  status: string;
}

const ACTIVITY_DATA: Activity[] = [
  { book: "The Great Gatsby", member: "Alice Mwangi", action: "Issued", date: "2026-02-13", status: "Active" },
  { book: "Things Fall Apart", member: "James Oloo", action: "Returned", date: "2026-02-13", status: "Completed" },
  { book: "Sapiens", member: "—", action: "Donated", date: "2026-02-12", status: "Processed" },
  { book: "1984", member: "Sarah Njoki", action: "Issued", date: "2026-02-12", status: "Active" },
  { book: "Beloved", member: "Peter Kamau", action: "Returned", date: "2026-02-11", status: "Overdue" },
  { book: "Half of a Yellow Sun", member: "Grace Wambui", action: "Issued", date: "2026-02-11", status: "Active" },
  { book: "Americanah", member: "Daniel Kipchoge", action: "Returned", date: "2026-02-10", status: "Completed" },
  { book: "Weep Not, Child", member: "Faith Achieng", action: "Donated", date: "2026-02-10", status: "Processed" },
];

const STATUS_VARIANT: Record<string, "success" | "accent" | "muted" | "destructive"> = {
  Active: "accent",
  Completed: "success",
  Processed: "muted",
  Overdue: "destructive",
};

const activityColumns: Column<Activity>[] = [
  { key: "book", label: "Book", className: "font-medium text-foreground", render: (r) => r.book },
  { key: "member", label: "Member", className: "text-muted-foreground", render: (r) => r.member },
  { key: "action", label: "Action", render: (r) => r.action },
  { key: "date", label: "Date", className: "text-muted-foreground", render: (r) => r.date },
  {
    key: "status",
    label: "Status",
    render: (r) => <StatusBadge variant={STATUS_VARIANT[r.status] ?? "muted"}>{r.status}</StatusBadge>,
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-foreground leading-tight">Dashboard</h1>
        <p className="text-[13px] text-muted-foreground">Overview of library operations</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
        <StatCard label="Total Books" value="12,847" icon={BookOpen} trend="+34 this week" />
        <StatCard label="Books on Loan" value="1,203" icon={ArrowLeftRight} />
        <StatCard label="Overdue Today" value="47" icon={AlertTriangle} />
        <StatCard label="Active Members" value="3,891" icon={Users} trend="+12 new" />
        <StatCard label="Donations (Month)" value="89" icon={Gift} />
      </div>

      {/* Attention Required */}
      <div className="bg-card border border-border rounded p-3">
        <h2 className="text-[13px] font-semibold text-foreground mb-2">Attention Required</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {ALERTS.map((a) => (
            <div
              key={a.label}
              className="flex items-center gap-2 rounded border border-border p-2 bg-secondary/30"
            >
              <a.icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-[12px] text-muted-foreground leading-tight">{a.label}</p>
                <p className="text-sm font-semibold text-foreground leading-tight">{a.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Table */}
      <div>
        <div className="px-1 mb-1">
          <h2 className="text-[13px] font-semibold text-foreground">Recent Activity</h2>
        </div>
        <DataTable
          columns={activityColumns}
          data={ACTIVITY_DATA}
          keyExtractor={(_, i) => String(i)}
          compact
        />
      </div>
    </div>
  );
}
