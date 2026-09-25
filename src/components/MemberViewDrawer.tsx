import { useMemo } from "react";
import { User, Pencil, History, Phone, Mail } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { StatusBadge, type BadgeVariant } from "@/components/StatusBadge";
import { useLoans } from "@/hooks/use-loans";
import { useFines } from "@/hooks/use-fines";
import { formatTaka } from "@/lib/currency";
import type { Member } from "@/hooks/use-members";

const STATUS_VARIANT: Record<Member["status"], BadgeVariant> = { Active: "success", Suspended: "destructive", Expired: "warning" };
const LOAN_VARIANT: Record<string, BadgeVariant> = { Active: "accent", Overdue: "destructive", Returned: "success", Cancelled: "muted" };

const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—");

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 py-1.5 text-[13px] border-b border-border/50 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground text-right break-words">{children || "—"}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="rounded-md border border-border px-3">{children}</div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-[13px] text-muted-foreground py-4 text-center">{text}</p>;
}

interface Props {
  member: Member | null;
  tab: "profile" | "history";
  onTabChange: (t: "profile" | "history") => void;
  onClose: () => void;
  onEdit: (m: Member) => void;
}

export function MemberViewDrawer({ member, tab, onTabChange, onClose, onEdit }: Props) {
  const { loans } = useLoans();
  const { fines } = useFines();

  const data = useMemo(() => {
    if (!member) return null;
    const ml = loans.filter((l) => l.memberId === member.memberId);
    const mf = fines.filter((f) => f.memberId === member.memberId);
    const current = ml.filter((l) => l.status === "Active" || l.status === "Overdue");
    const overdueHist = ml.filter((l) => l.fineAmount > 0 && l.status !== "Cancelled");
    const fineFor = (loanId: string) => mf.find((f) => f.loanId === loanId);
    return {
      ml, mf, current, overdueHist, fineFor,
      overdueNow: current.filter((l) => l.status === "Overdue"),
      returned: ml.filter((l) => l.status === "Returned").length,
      paid: mf.filter((f) => f.status === "Paid").reduce((s, f) => s + (f.payment?.amountPaid ?? f.amount), 0),
      outstanding: mf.filter((f) => f.status === "Unpaid").reduce((s, f) => s + f.amount, 0),
    };
  }, [member, loans, fines]);

  const address = member ? [member.addressLine, member.city, member.district, member.postalCode].some(Boolean) : false;

  return (
    <Sheet open={!!member} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
        {member && data && (
          <>
            <SheetHeader className="p-4 border-b border-border space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                  {member.avatar ? <img src={member.avatar} alt="" className="h-12 w-12 object-cover" /> : <User className="h-5 w-5 text-muted-foreground/60" />}
                </div>
                <div className="min-w-0 text-left">
                  <SheetTitle className="text-base truncate">{member.name}</SheetTitle>
                  <SheetDescription className="font-mono text-[12px]">{member.memberId}</SheetDescription>
                  <div className="flex gap-1.5 mt-1">
                    <StatusBadge variant={STATUS_VARIANT[member.status]}>{member.status}</StatusBadge>
                    <StatusBadge variant={member.meritGrade === "Not Assigned" ? "muted" : "default"}>Merit: {member.meritGrade}</StatusBadge>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="h-7 text-[12px] gap-1" onClick={() => onEdit(member)}><Pencil className="h-3 w-3" /> Edit Member</Button>
                <Button size="sm" variant={tab === "history" ? "default" : "outline"} className="h-7 text-[12px] gap-1" onClick={() => onTabChange(tab === "history" ? "profile" : "history")}><History className="h-3 w-3" /> History</Button>
              </div>
            </SheetHeader>

            <Tabs value={tab} onValueChange={(v) => onTabChange(v as "profile" | "history")} className="flex-1 flex flex-col min-h-0">
              <TabsList className="mx-4 mt-3 self-start">
                <TabsTrigger value="profile" className="text-[12px]">Profile</TabsTrigger>
                <TabsTrigger value="history" className="text-[12px]">History</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="flex-1 overflow-y-auto p-4 space-y-4 mt-0">
                <Section title="Contact">
                  <Row label="Phone">{member.phone && <a href={`tel:${member.phone}`} className="inline-flex items-center gap-1 hover:underline"><Phone className="h-3 w-3" />{member.phone}</a>}</Row>
                  <Row label="Email">{member.email && <a href={`mailto:${member.email}`} className="inline-flex items-center gap-1 hover:underline"><Mail className="h-3 w-3" />{member.email}</a>}</Row>
                  {address ? (
                    <>
                      <Row label="Address Line">{member.addressLine}</Row>
                      <Row label="City/Area">{member.city}</Row>
                      <Row label="District">{member.district}</Row>
                      <Row label="Postal Code">{member.postalCode}</Row>
                    </>
                  ) : <Row label="Address">No address on file</Row>}
                </Section>
                <Section title="Membership">
                  <Row label="Join Date">{fmtDate(member.joinDate)}</Row>
                  <Row label="Status">{member.status}</Row>
                  <Row label="Merit Grade">{member.meritGrade}</Row>
                  <Row label="Merit Note">{member.meritNote}</Row>
                </Section>
                <Section title="Current Library Activity">
                  <Row label="Active Loans">{String(data.current.length)}</Row>
                  <Row label="Overdue Books">{String(data.overdueNow.length)}</Row>
                  <Row label="Outstanding Fine">{formatTaka(data.outstanding)}</Row>
                  {data.current.length === 0 ? <Empty text="No books currently borrowed." /> : data.current.map((l) => (
                    <Row key={l.id} label={`${l.book} (${l.bookId || l.accessionId})`}>
                      <span className={l.status === "Overdue" ? "text-destructive" : ""}>Due {fmtDate(l.dueDate)}</span>
                    </Row>
                  ))}
                </Section>
                <Section title="Library Summary">
                  <Row label="Total Loans">{String(data.ml.length)}</Row>
                  <Row label="Returned Loans">{String(data.returned)}</Row>
                  <Row label="Overdue Loans">{String(data.overdueHist.length)}</Row>
                  <Row label="Paid Fines">{formatTaka(data.paid)}</Row>
                  <Row label="Outstanding Fines">{formatTaka(data.outstanding)}</Row>
                </Section>
              </TabsContent>

              <TabsContent value="history" className="flex-1 overflow-y-auto p-4 space-y-4 mt-0">
                <Section title="Loan History">
                  {data.ml.length === 0 ? <Empty text="No loan history for this member." /> : data.ml.map((l) => {
                    const f = data.fineFor(l.id);
                    return (
                      <div key={l.id} className="py-2 border-b border-border/50 last:border-0 text-[12px] space-y-0.5">
                        <div className="flex justify-between gap-2">
                          <span className="font-medium text-foreground text-[13px]">{l.book}</span>
                          <StatusBadge variant={LOAN_VARIANT[l.status]}>{l.status}</StatusBadge>
                        </div>
                        <p className="text-muted-foreground font-mono">{l.bookId || l.accessionId} · {l.id}</p>
                        <p className="text-muted-foreground">Issued {fmtDate(l.issuedDate)} · Due {fmtDate(l.dueDate)} · Returned {fmtDate(l.returnDate)}</p>
                        {f && <p className="text-muted-foreground">{f.daysOverdue} days overdue · Fine {formatTaka(f.amount)} ({f.status})</p>}
                      </div>
                    );
                  })}
                </Section>
                <Section title="Overdue History">
                  {data.overdueHist.length === 0 ? <Empty text="No overdue records." /> : data.overdueHist.map((l) => {
                    const f = data.fineFor(l.id);
                    return (
                      <div key={l.id} className="py-2 border-b border-border/50 last:border-0 text-[12px]">
                        <p className="font-medium text-foreground text-[13px]">{l.book}</p>
                        <p className="text-muted-foreground">Due {fmtDate(l.dueDate)} · Returned {fmtDate(l.returnDate)} · {f?.daysOverdue ?? 0} days overdue{f ? ` · ${formatTaka(f.amount)} (${f.status})` : ""}</p>
                      </div>
                    );
                  })}
                </Section>
                <Section title="Fine / Payment History">
                  {data.mf.length === 0 ? <Empty text="No fines or payments." /> : data.mf.map((f) => (
                    <div key={f.id} className="py-2 border-b border-border/50 last:border-0 text-[12px] space-y-0.5">
                      <div className="flex justify-between"><span className="font-mono text-foreground">{f.id}</span><span>{formatTaka(f.amount)} · {f.status}</span></div>
                      {f.payment && <p className="text-muted-foreground">Paid {formatTaka(f.payment.amountPaid)} on {fmtDate(f.payment.paidDate)} via {f.payment.method || "—"}{f.payment.reference ? ` · Ref ${f.payment.reference}` : ""}</p>}
                      {f.waiver && <p className="text-muted-foreground">Waived {fmtDate(f.waiver.waivedDate)} — {f.waiver.reason}</p>}
                    </div>
                  ))}
                </Section>
              </TabsContent>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
