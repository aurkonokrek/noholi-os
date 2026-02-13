import { useState } from "react";
import { Search, CalendarDays, CheckCircle2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ActiveLoan {
  id: string;
  member: string;
  memberId: string;
  book: string;
  accessionId: string;
  issuedDate: string;
  dueDate: string;
  status: "Active" | "Overdue";
}

const ACTIVE_LOANS: ActiveLoan[] = [
  { id: "LN-0401", member: "Alice Mwangi", memberId: "MEM-1001", book: "Sapiens", accessionId: "ACC-0002", issuedDate: "2026-01-28", dueDate: "2026-02-11", status: "Overdue" },
  { id: "LN-0402", member: "Sarah Njoki", memberId: "MEM-1004", book: "1984", accessionId: "ACC-0003", issuedDate: "2026-02-05", dueDate: "2026-02-19", status: "Active" },
  { id: "LN-0403", member: "Peter Kamau", memberId: "MEM-1005", book: "Beloved", accessionId: "ACC-0005", issuedDate: "2026-02-01", dueDate: "2026-02-15", status: "Active" },
  { id: "LN-0404", member: "Grace Wambui", memberId: "MEM-1006", book: "Half of a Yellow Sun", accessionId: "ACC-0008", issuedDate: "2026-02-08", dueDate: "2026-02-22", status: "Active" },
  { id: "LN-0405", member: "Daniel Kipchoge", memberId: "MEM-1007", book: "Atomic Habits", accessionId: "ACC-0007", issuedDate: "2026-01-25", dueDate: "2026-02-08", status: "Overdue" },
  { id: "LN-0406", member: "Faith Achieng", memberId: "MEM-1008", book: "Thinking, Fast and Slow", accessionId: "ACC-0011", issuedDate: "2026-02-10", dueDate: "2026-02-24", status: "Active" },
];

export default function Lending() {
  const [memberSearch, setMemberSearch] = useState("");
  const [bookSearch, setBookSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);

  const canIssue = selectedMember && selectedBook;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Lending</h1>
        <p className="text-[13px] text-muted-foreground">Issue and return books</p>
      </div>

      {/* Issue Workflow */}
      <div className="bg-card border border-border rounded p-4">
        <h2 className="text-[13px] font-semibold text-foreground mb-3">Issue Book</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Member Search */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-muted-foreground">Member</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search member..."
                value={memberSearch}
                onChange={(e) => {
                  setMemberSearch(e.target.value);
                  setSelectedMember(e.target.value.length > 2 ? e.target.value : null);
                }}
                className="pl-8 h-8 text-[13px]"
              />
            </div>
            {selectedMember && (
              <p className="text-[11px] text-success flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Member found
              </p>
            )}
          </div>

          {/* Book Search */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-muted-foreground">Book</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search book or ACC ID..."
                value={bookSearch}
                onChange={(e) => {
                  setBookSearch(e.target.value);
                  setSelectedBook(e.target.value.length > 2 ? e.target.value : null);
                }}
                className="pl-8 h-8 text-[13px]"
              />
            </div>
            {selectedBook && (
              <p className="text-[11px] text-success flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Book available
              </p>
            )}
          </div>

          {/* Due Date */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-muted-foreground">Due Date</label>
            <div className="relative">
              <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="date"
                defaultValue="2026-02-27"
                className="pl-8 h-8 text-[13px]"
              />
            </div>
          </div>

          {/* Confirm */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-muted-foreground">&nbsp;</label>
            <Button size="sm" className="w-full h-8 text-[13px]" disabled={!canIssue}>
              Confirm Issue
            </Button>
          </div>
        </div>
      </div>

      {/* Active Loans Table */}
      <div className="bg-card border border-border rounded">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-[13px] font-semibold text-foreground">
            Active Loans <span className="text-muted-foreground font-normal">({ACTIVE_LOANS.length})</span>
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Loan ID</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Member</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Book</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Issued</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Due Date</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Status</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Action</th>
              </tr>
            </thead>
            <tbody>
              {ACTIVE_LOANS.map((loan) => (
                <tr key={loan.id} className="border-b border-border last:border-b-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-2.5 text-muted-foreground font-mono text-[12px]">{loan.id}</td>
                  <td className="px-4 py-2.5">
                    <span className="font-medium text-foreground">{loan.member}</span>
                    <span className="text-muted-foreground ml-1.5 text-[11px]">{loan.memberId}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-foreground">{loan.book}</span>
                    <span className="text-muted-foreground ml-1.5 text-[11px]">{loan.accessionId}</span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{loan.issuedDate}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{loan.dueDate}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border ${
                      loan.status === "Overdue"
                        ? "bg-destructive/10 text-destructive border-destructive/20"
                        : "bg-success/10 text-success border-success/20"
                    }`}>
                      {loan.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <Button size="sm" variant="outline" className="h-7 gap-1 text-[12px]">
                      <RotateCcw className="h-3 w-3" /> Return
                    </Button>
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
