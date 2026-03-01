import { BookOpen, ArrowLeftRight, AlertTriangle, Users, Gift, Clock, BadgeDollarSign, Package, FileCheck, Loader2 } from "lucide-react";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  subtitle?: string;
}

function StatCard({ label, value, icon: Icon, subtitle }: StatCardProps) {
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
        {subtitle && (
          <p className="text-[11px] text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function formatNum(n: number) {
  return n.toLocaleString("en-BD");
}

export default function Dashboard() {
  const { stats, loading } = useDashboardStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-[13px]">Loading dashboard…</span>
      </div>
    );
  }

  const alerts = [
    { label: "Overdue books", value: stats.overdueToday, icon: Clock, show: true },
    { label: "Pending fines", value: stats.pendingFines, icon: BadgeDollarSign, show: true },
    { label: "Low stock titles", value: stats.lowStockCategories, icon: Package, show: stats.lowStockCategories > 0 },
    { label: "Donation approvals", value: stats.donationApprovals, icon: FileCheck, show: true },
  ];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-foreground leading-tight">Dashboard</h1>
        <p className="text-[13px] text-muted-foreground">Overview of library operations</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-2">
        <StatCard label="Total Books" value={formatNum(stats.totalBooks)} icon={BookOpen} subtitle={`${formatNum(stats.totalCopies)} copies`} />
        <StatCard label="Books on Loan" value={formatNum(stats.booksOnLoan)} icon={ArrowLeftRight} />
        <StatCard label="Overdue Today" value={formatNum(stats.overdueToday)} icon={AlertTriangle} />
        <StatCard label="Active Members" value={formatNum(stats.activeMembers)} icon={Users} />
        <StatCard label="Donations (Month)" value={formatNum(stats.donationsThisMonth)} icon={Gift} />
        <StatCard label="Reserved" value={formatNum(stats.reserved)} icon={BookOpen} />
      </div>

      {/* Attention Required */}
      <div className="bg-card border border-border rounded p-3">
        <h2 className="text-[13px] font-semibold text-foreground mb-2">Attention Required</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {alerts.filter(a => a.show).map((a) => (
            <div
              key={a.label}
              className="flex items-center gap-2 rounded border border-border p-2 bg-secondary/30"
            >
              <a.icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-[12px] text-muted-foreground leading-tight">{a.label}</p>
                <p className="text-sm font-semibold text-foreground leading-tight">{formatNum(a.value)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Placeholder for recent activity — will be dynamic once lending is connected */}
      <div className="bg-card border border-border rounded p-3">
        <h2 className="text-[13px] font-semibold text-foreground mb-1">Recent Activity</h2>
        <p className="text-[12px] text-muted-foreground">Activity feed will populate once lending and donations modules are connected to a live database.</p>
      </div>
    </div>
  );
}
