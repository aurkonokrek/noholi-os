import { useState } from "react";
import { Search, CalendarDays, CheckCircle2, RotateCcw, BookOpen, Eye, MoreVertical, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/PageHeader";
import { SearchBar } from "@/components/SearchBar";
import { DataTable, type Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { RowActions } from "@/components/RowActions";
import { BookDetailDrawer } from "@/components/BookDetailDrawer";
import { useCanWrite } from "@/lib/roles";
import { useToast } from "@/hooks/use-toast";

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

const INITIAL_LOANS: ActiveLoan[] = [
  { id: "LN-0401", member: "Alice Mwangi", memberId: "MEM-1001", book: "Sapiens", accessionId: "ACC-0002", issuedDate: "2026-01-28", dueDate: "2026-02-11", status: "Overdue" },
  { id: "LN-0402", member: "Sarah Njoki", memberId: "MEM-1004", book: "1984", accessionId: "ACC-0003", issuedDate: "2026-02-05", dueDate: "2026-02-19", status: "Active" },
  { id: "LN-0403", member: "Peter Kamau", memberId: "MEM-1005", book: "Beloved", accessionId: "ACC-0005", issuedDate: "2026-02-01", dueDate: "2026-02-15", status: "Active" },
  { id: "LN-0404", member: "Grace Wambui", memberId: "MEM-1006", book: "Half of a Yellow Sun", accessionId: "ACC-0008", issuedDate: "2026-02-08", dueDate: "2026-02-22", status: "Active" },
  { id: "LN-0405", member: "Daniel Kipchoge", memberId: "MEM-1007", book: "Atomic Habits", accessionId: "ACC-0007", issuedDate: "2026-01-25", dueDate: "2026-02-08", status: "Overdue" },
  { id: "LN-0406", member: "Faith Achieng", memberId: "MEM-1008", book: "Thinking, Fast and Slow", accessionId: "ACC-0011", issuedDate: "2026-02-10", dueDate: "2026-02-24", status: "Active" },
];

export default function Lending() {
  const canWrite = useCanWrite();
  const { toast } = useToast();
  const [loans, setLoans] = useState<ActiveLoan[]>(INITIAL_LOANS);
  const [memberSearch, setMemberSearch] = useState("");
  const [bookSearch, setBookSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [loanSearch, setLoanSearch] = useState("");
  const [drawerBook, setDrawerBook] = useState<{ accessionId: string; title: string; author: string; genre: string; status: string; location: string } | null>(null);

  const canIssue = selectedMember && selectedBook;

  const returnBook = (id: string) => {
    const loan = loans.find((l) => l.id === id);
    setLoans((prev) => prev.filter((l) => l.id !== id));
    if (loan) {
      toast({ title: "Book returned", description: `${loan.book} returned by ${loan.member}` });
    }
  };

  const filteredLoans = loans.filter(
    (l) =>
      !loanSearch ||
      l.member.toLowerCase().includes(loanSearch.toLowerCase()) ||
      l.book.toLowerCase().includes(loanSearch.toLowerCase()) ||
      l.id.toLowerCase().includes(loanSearch.toLowerCase())
  );

  const columns: Column<ActiveLoan>[] = [
    {
      key: "thumb",
      label: "",
      className: "w-10",
      render: () => (
        <div className="h-8 w-8 rounded bg-secondary flex items-center justify-center">
          <BookOpen className="h-3.5 w-3.5 text-muted-foreground/50" />
        </div>
      ),
    },
    { key: "id", label: "Loan ID", className: "text-muted-foreground font-mono text-[12px]", render: (l) => l.id },
    {
      key: "member",
      label: "Member",
      render: (l) => (
        <>
          <span className="font-medium text-foreground">{l.member}</span>
          <span className="text-muted-foreground ml-1.5 text-[11px]">{l.memberId}</span>
        </>
      ),
    },
    {
      key: "book",
      label: "Book",
      render: (l) => (
        <>
          <span className="text-foreground">{l.book}</span>
          <span className="text-muted-foreground ml-1.5 text-[11px]">{l.accessionId}</span>
        </>
      ),
    },
    { key: "issued", label: "Issued", className: "text-muted-foreground", render: (l) => l.issuedDate },
    { key: "due", label: "Due Date", className: "text-muted-foreground", render: (l) => l.dueDate },
    {
      key: "status",
      label: "Status",
      render: (l) => (
        <StatusBadge variant={l.status === "Overdue" ? "destructive" : "success"}>
          {l.status}
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
            render: (l: ActiveLoan) => (
              <RowActions
                primary={[
                  { label: "Return", icon: RotateCcw, onClick: () => returnBook(l.id) },
                  {
                    label: "View",
                    icon: Eye,
                    onClick: () =>
                      setDrawerBook({
                        accessionId: l.accessionId,
                        title: l.book,
                        author: "",
                        genre: "",
                        status: l.status,
                        location: "",
                      }),
                  },
                ]}
                secondary={[
                  { label: "Flag overdue", icon: AlertTriangle, onClick: () => {}, variant: "destructive" as const },
                ]}
              />
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-3">
      <PageHeader title="Lending" subtitle="Issue and return books" />

      {canWrite && (
        <div className="bg-card border border-border rounded p-3">
          <h2 className="text-[13px] font-semibold text-foreground mb-2">Issue Book</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div className="space-y-1">
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
            <div className="space-y-1">
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
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">Due Date</label>
              <div className="relative">
                <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input type="date" defaultValue="2026-02-27" className="pl-8 h-8 text-[13px]" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">&nbsp;</label>
              <Button size="sm" className="w-full h-8 text-[13px]" disabled={!canIssue}>
                Confirm Issue
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-[13px] font-semibold text-foreground">
          Active Loans <span className="text-muted-foreground font-normal">({loans.length})</span>
        </h2>
        <SearchBar
          value={loanSearch}
          onChange={setLoanSearch}
          placeholder="Search loans..."
          className="w-56"
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredLoans}
        keyExtractor={(l) => l.id}
        onRowClick={(l) =>
          setDrawerBook({
            accessionId: l.accessionId,
            title: l.book,
            author: "",
            genre: "",
            status: l.status,
            location: "",
          })
        }
        compact
      />

      <BookDetailDrawer
        book={drawerBook}
        open={!!drawerBook}
        onClose={() => setDrawerBook(null)}
      />
    </div>
  );
}
