import { BookOpen, ArrowLeftRight, AlertTriangle, Users, Gift } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
}

function StatCard({ label, value, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded p-4 flex items-start gap-3">
      <div className="p-2 bg-secondary rounded">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
          {label}
        </p>
        <p className="text-xl font-semibold text-foreground leading-none">
          {value}
        </p>
        {trend && (
          <p className="text-[11px] text-muted-foreground mt-1">{trend}</p>
        )}
      </div>
    </div>
  );
}

const ACTIVITY_DATA = [
  { book: "The Great Gatsby", member: "Alice Mwangi", action: "Issued", date: "2026-02-13", status: "Active" },
  { book: "Things Fall Apart", member: "James Oloo", action: "Returned", date: "2026-02-13", status: "Completed" },
  { book: "Sapiens", member: "—", action: "Donated", date: "2026-02-12", status: "Processed" },
  { book: "1984", member: "Sarah Njoki", action: "Issued", date: "2026-02-12", status: "Active" },
  { book: "Beloved", member: "Peter Kamau", action: "Returned", date: "2026-02-11", status: "Overdue" },
  { book: "Half of a Yellow Sun", member: "Grace Wambui", action: "Issued", date: "2026-02-11", status: "Active" },
  { book: "Americanah", member: "Daniel Kipchoge", action: "Returned", date: "2026-02-10", status: "Completed" },
  { book: "Weep Not, Child", member: "Faith Achieng", action: "Donated", date: "2026-02-10", status: "Processed" },
];

const STATUS_STYLES: Record<string, string> = {
  Active: "bg-accent/10 text-accent",
  Completed: "bg-success/10 text-success",
  Processed: "bg-muted text-muted-foreground",
  Overdue: "bg-destructive/10 text-destructive",
};

export default function Dashboard() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
        <p className="text-[13px] text-muted-foreground">
          Overview of library operations
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard label="Total Books" value="12,847" icon={BookOpen} trend="+34 this week" />
        <StatCard label="Books on Loan" value="1,203" icon={ArrowLeftRight} />
        <StatCard label="Overdue Today" value="47" icon={AlertTriangle} />
        <StatCard label="Active Members" value="3,891" icon={Users} trend="+12 new" />
        <StatCard label="Donations (Month)" value="89" icon={Gift} />
      </div>

      {/* Recent Activity Table */}
      <div className="bg-card border border-border rounded">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-[13px] font-semibold text-foreground">
            Recent Activity
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Book</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Member</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Action</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Date</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {ACTIVITY_DATA.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-border last:border-b-0 hover:bg-secondary/30 transition-colors"
                >
                  <td className="px-4 py-2.5 font-medium text-foreground">{row.book}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{row.member}</td>
                  <td className="px-4 py-2.5 text-foreground">{row.action}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{row.date}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                        STATUS_STYLES[row.status] ?? ""
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
