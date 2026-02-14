import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/DataTable";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const monthlyLoans = [
  { month: "Sep", loans: 142 },
  { month: "Oct", loans: 178 },
  { month: "Nov", loans: 165 },
  { month: "Dec", loans: 120 },
  { month: "Jan", loans: 195 },
  { month: "Feb", loans: 210 },
];

interface TopBook {
  title: string;
  borrows: number;
}

const topBooks: TopBook[] = [
  { title: "Things Fall Apart", borrows: 34 },
  { title: "The River Between", borrows: 28 },
  { title: "Weep Not, Child", borrows: 25 },
  { title: "A Grain of Wheat", borrows: 22 },
  { title: "Born a Crime", borrows: 19 },
];

const summaryStats = [
  { label: "Total Loans (6 mo)", value: "1,010" },
  { label: "Current Overdue Rate", value: "8.3%" },
  { label: "Donations This Month", value: "14" },
  { label: "Avg. Loan Duration", value: "12 days" },
];

const topBooksColumns: Column<TopBook>[] = [
  { key: "rank", label: "#", className: "text-muted-foreground w-8", render: (_, i) => i + 1 },
  { key: "title", label: "Title", className: "font-medium", render: (b) => b.title },
  { key: "borrows", label: "Borrows", headerClassName: "text-right", className: "text-right", render: (b) => b.borrows },
];

export default function ReportsPage() {
  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-lg font-semibold text-foreground leading-tight">Reports</h1>
        <p className="text-[13px] text-muted-foreground">Read-only analytics overview</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {summaryStats.map((s) => (
          <Card key={s.label} className="shadow-none">
            <CardContent className="p-3">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
              <p className="text-lg font-semibold text-foreground mt-0.5 leading-tight">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart + Table */}
      <div className="grid md:grid-cols-2 gap-3">
        <Card className="shadow-none">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-[13px] font-semibold">Monthly Loans</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyLoans} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 4,
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--card))",
                  }}
                />
                <Bar dataKey="loans" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div>
          <h3 className="text-[13px] font-semibold text-foreground mb-1 px-1">Most Borrowed Books</h3>
          <DataTable
            columns={topBooksColumns}
            data={topBooks}
            keyExtractor={(b) => b.title}
            compact
          />
        </div>
      </div>
    </div>
  );
}
