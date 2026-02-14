import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface Fine {
  id: string;
  member: string;
  memberId: string;
  book: string;
  daysLate: number;
  amount: number;
  status: "unpaid" | "paid" | "waived";
}

const INITIAL_FINES: Fine[] = [
  { id: "F-001", member: "Jane Muthoni", memberId: "M-1001", book: "The River Between", daysLate: 12, amount: 240, status: "unpaid" },
  { id: "F-002", member: "Peter Kamau", memberId: "M-1004", book: "Weep Not, Child", daysLate: 5, amount: 100, status: "unpaid" },
  { id: "F-003", member: "Alice Wanjiru", memberId: "M-1002", book: "A Grain of Wheat", daysLate: 3, amount: 60, status: "paid" },
  { id: "F-004", member: "David Ochieng", memberId: "M-1005", book: "Petals of Blood", daysLate: 20, amount: 400, status: "unpaid" },
  { id: "F-005", member: "Grace Akinyi", memberId: "M-1003", book: "Born a Crime", daysLate: 7, amount: 140, status: "waived" },
  { id: "F-006", member: "Samuel Njoroge", memberId: "M-1006", book: "Things Fall Apart", daysLate: 1, amount: 20, status: "paid" },
];

const statusConfig: Record<Fine["status"], { label: string; variant: "default" | "secondary" | "outline" }> = {
  unpaid: { label: "Unpaid", variant: "default" },
  paid: { label: "Paid", variant: "secondary" },
  waived: { label: "Waived", variant: "outline" },
};

export default function FinesPage() {
  const [fines, setFines] = useState<Fine[]>(INITIAL_FINES);
  const [filter, setFilter] = useState<"all" | Fine["status"]>("all");

  const filtered = filter === "all" ? fines : fines.filter((f) => f.status === filter);

  const totalUnpaid = fines
    .filter((f) => f.status === "unpaid")
    .reduce((s, f) => s + f.amount, 0);

  const markPaid = (id: string) => {
    setFines((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: "paid" as const } : f))
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Fines</h1>
          <p className="text-[13px] text-muted-foreground">
            Outstanding: <span className="font-medium text-foreground">KES {totalUnpaid.toLocaleString()}</span>
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(["all", "unpaid", "paid", "waived"] as const).map((s) => (
          <Button
            key={s}
            size="sm"
            variant={filter === s ? "default" : "outline"}
            onClick={() => setFilter(s)}
            className="capitalize text-xs h-8"
          >
            {s}
          </Button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Book</TableHead>
              <TableHead className="text-right">Days Late</TableHead>
              <TableHead className="text-right">Amount (KES)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((fine) => {
              const cfg = statusConfig[fine.status];
              return (
                <TableRow key={fine.id}>
                  <TableCell>
                    <div className="font-medium text-[13px]">{fine.member}</div>
                    <div className="text-xs text-muted-foreground">{fine.memberId}</div>
                  </TableCell>
                  <TableCell className="text-[13px]">{fine.book}</TableCell>
                  <TableCell className="text-right text-[13px]">{fine.daysLate}</TableCell>
                  <TableCell className="text-right font-medium text-[13px]">
                    {fine.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={cfg.variant} className="text-[11px]">
                      {cfg.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {fine.status === "unpaid" && (
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => markPaid(fine.id)}>
                        Mark Paid
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground text-sm py-8">
                  No fines found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
