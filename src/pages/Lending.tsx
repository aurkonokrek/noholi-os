import { useState } from "react";
import { Search, CalendarDays, CheckCircle2, RotateCcw, BookOpen, Eye, AlertTriangle, Loader2 } from "lucide-react";
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
import { useLoans, type ActiveLoan } from "@/hooks/use-loans";

export default function Lending() {
  const canWrite = useCanWrite();
  const { toast } = useToast();
  const { loans, loading, issueLoan, returnLoan } = useLoans();
  const [memberSearch, setMemberSearch] = useState("");
  const [bookSearch, setBookSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState("2026-02-27");
  const [loanSearch, setLoanSearch] = useState("");
  const [drawerBook, setDrawerBook] = useState<{ accessionId: string; title: string; author: string; genre: string; status: string; location: string } | null>(null);

  const canIssue = selectedMember && selectedBook;

  const handleConfirmIssue = async () => {
    if (!selectedMember || !selectedBook) return;
    const id = await issueLoan({
      member: memberSearch,
      memberId: selectedMember,
      book: bookSearch,
      accessionId: `ACC-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      issuedDate: new Date().toISOString().split("T")[0],
      dueDate,
      status: "Active",
    });
    toast({ title: "Book issued", description: `${bookSearch} issued to ${memberSearch}` });
    setMemberSearch("");
    setBookSearch("");
    setSelectedMember(null);
    setSelectedBook(null);
  };

  const handleReturn = async (id: string) => {
    const loan = await returnLoan(id);
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
                  { label: "Return", icon: RotateCcw, onClick: () => handleReturn(l.id) },
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-[13px]">Loading loans…</span>
      </div>
    );
  }

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
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="pl-8 h-8 text-[13px]" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-muted-foreground">&nbsp;</label>
              <Button size="sm" className="w-full h-8 text-[13px]" disabled={!canIssue} onClick={handleConfirmIssue}>
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
