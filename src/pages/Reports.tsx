import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
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

const topBooks = [
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

export default function ReportsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Reports</h1>
        <p className="text-[13px] text-muted-foreground">Read-only analytics overview.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryStats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-xl font-semibold text-foreground mt-1">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart + Table row */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Monthly Loans Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Loans</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyLoans} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
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

        {/* Most Borrowed Books */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Most Borrowed Books</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="text-right">Borrows</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topBooks.map((b, i) => (
                  <TableRow key={b.title}>
                    <TableCell className="text-[13px] text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="text-[13px] font-medium">{b.title}</TableCell>
                    <TableCell className="text-right text-[13px]">{b.borrows}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
