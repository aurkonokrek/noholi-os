import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge, type BadgeVariant } from "@/components/StatusBadge";
import type { Donation, DonationInput, ReviewStatus } from "@/hooks/use-donations";

export const STATUS_VARIANT: Record<ReviewStatus, BadgeVariant> = {
  Pending: "warning", Approved: "accent", Rejected: "destructive", "Added to Inventory": "success",
};

const today = () => new Date().toISOString().split("T")[0];
export const emptyDonationInput = (): DonationInput => ({
  donorName: "", donorContact: "", bookTitle: "", bookAuthor: "", condition: "New", dateReceived: today(), notes: "",
});
export const isDonationInputValid = (v: DonationInput) =>
  !!v.donorName.trim() && !!v.bookTitle.trim() && !!v.condition && !!v.dateReceived;
export const trimInput = (v: DonationInput): DonationInput => ({
  donorName: v.donorName.trim().slice(0, 150), donorContact: v.donorContact.trim().slice(0, 150),
  bookTitle: v.bookTitle.trim().slice(0, 300), bookAuthor: v.bookAuthor.trim().slice(0, 200),
  condition: v.condition, dateReceived: v.dateReceived, notes: v.notes.trim().slice(0, 1000),
});

const lbl = "text-[12px] font-medium text-muted-foreground";
const selectCls = "w-full h-8 rounded border border-input bg-background px-2.5 text-[13px] text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function DonationFields({ value, onChange }: { value: DonationInput; onChange: (v: DonationInput) => void }) {
  const set = (k: keyof DonationInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    onChange({ ...value, [k]: e.target.value });
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      <div className="space-y-1"><label className={lbl}>Donor Name *</label>
        <Input aria-label="Donor Name" className="h-8 text-[13px]" placeholder="Enter donor name" value={value.donorName} onChange={set("donorName")} maxLength={150} /></div>
      <div className="space-y-1"><label className={lbl}>Donor Contact</label>
        <Input aria-label="Donor Contact" className="h-8 text-[13px]" placeholder="Phone or email" value={value.donorContact} onChange={set("donorContact")} maxLength={150} /></div>
      <div className="space-y-1"><label className={lbl}>Book Title *</label>
        <Input aria-label="Book Title" className="h-8 text-[13px]" placeholder="Enter book title" value={value.bookTitle} onChange={set("bookTitle")} maxLength={300} /></div>
      <div className="space-y-1"><label className={lbl}>Author</label>
        <Input aria-label="Author" className="h-8 text-[13px]" placeholder="Enter author" value={value.bookAuthor} onChange={set("bookAuthor")} maxLength={200} /></div>
      <div className="space-y-1"><label className={lbl}>Condition *</label>
        <select aria-label="Condition" className={selectCls} value={value.condition} onChange={set("condition")}>
          <option>New</option><option>Good</option><option>Fair</option><option>Poor</option>
        </select></div>
      <div className="space-y-1"><label className={lbl}>Date Received *</label>
        <Input aria-label="Date Received" type="date" className="h-8 text-[13px]" value={value.dateReceived} onChange={set("dateReceived")} /></div>
      <div className="space-y-1 md:col-span-2"><label className={lbl}>Notes</label>
        <Textarea aria-label="Notes" className="text-[13px] min-h-[60px]" value={value.notes} onChange={set("notes")} maxLength={1000} /></div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 py-1.5 text-[13px] border-b border-border/50 last:border-0">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-foreground text-right break-words min-w-0">{children}</span>
    </div>
  );
}

export function DonationViewDrawer({ donation, onOpenChange }: { donation: Donation | null; onOpenChange: (o: boolean) => void }) {
  const d = donation;
  return (
    <Sheet open={!!d} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
        {d && (<>
          <SheetHeader className="p-4 border-b border-border">
            <SheetTitle className="text-[15px]">{d.bookTitle}</SheetTitle>
            <SheetDescription className="font-mono text-[12px]">{d.id}</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4">
            <Row label="Donor">{d.donorName}</Row>
            <Row label="Donor Contact">{d.donorContact || "—"}</Row>
            <Row label="Book Title">{d.bookTitle}</Row>
            <Row label="Author">{d.bookAuthor || "—"}</Row>
            <Row label="Condition">{d.condition}</Row>
            <Row label="Date Received">{d.dateReceived}</Row>
            <Row label="Status"><StatusBadge variant={STATUS_VARIANT[d.reviewStatus]}>{d.reviewStatus}</StatusBadge></Row>
            {d.reviewStatus === "Rejected" && <Row label="Rejection Reason">{d.rejectionReason || "—"}</Row>}
            {d.assignedAccessionId && <Row label="Inventory Book ID"><span className="font-mono">{d.assignedAccessionId}</span></Row>}
            <div className="pt-3">
              <p className="text-[12px] text-muted-foreground mb-1">Notes</p>
              <p className="text-[13px] text-foreground whitespace-pre-wrap">{d.notes || "—"}</p>
            </div>
          </div>
        </>)}
      </SheetContent>
    </Sheet>
  );
}

export function EditDonationDialog({ donation, onOpenChange, onSave }: {
  donation: Donation | null; onOpenChange: (o: boolean) => void; onSave: (v: DonationInput) => Promise<void>;
}) {
  const [value, setValue] = useState<DonationInput>(emptyDonationInput());
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (donation) setValue({
      donorName: donation.donorName, donorContact: donation.donorContact, bookTitle: donation.bookTitle,
      bookAuthor: donation.bookAuthor, condition: donation.condition, dateReceived: donation.dateReceived, notes: donation.notes,
    });
  }, [donation]);
  return (
    <Dialog open={!!donation} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Donation</DialogTitle>
          <DialogDescription className="font-mono text-[12px]">{donation?.id}</DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto"><DonationFields value={value} onChange={setValue} /></div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button size="sm" disabled={!isDonationInputValid(value) || saving}
            onClick={async () => { setSaving(true); try { await onSave(trimInput(value)); } finally { setSaving(false); } }}>
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RejectDonationDialog({ donation, onOpenChange, onReject }: {
  donation: Donation | null; onOpenChange: (o: boolean) => void; onReject: (reason: string) => Promise<void>;
}) {
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (donation) setReason(""); }, [donation]);
  return (
    <Dialog open={!!donation} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reject Donation</DialogTitle>
          <DialogDescription>{donation?.id} · {donation?.bookTitle}. The record stays in the database.</DialogDescription>
        </DialogHeader>
        <div className="space-y-1">
          <label className={lbl}>Rejection reason *</label>
          <Textarea aria-label="Rejection reason" className="text-[13px]" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} />
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button variant="destructive" size="sm" disabled={!reason.trim() || saving}
            onClick={async () => { setSaving(true); try { await onReject(reason.trim()); } finally { setSaving(false); } }}>
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}Reject Donation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AddToInventoryDialog({ donation, onOpenChange, onConfirm }: {
  donation: Donation | null; onOpenChange: (o: boolean) => void; onConfirm: () => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  return (
    <Dialog open={!!donation} onOpenChange={(o) => !saving && onOpenChange(o)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Inventory</DialogTitle>
          <DialogDescription>
            "{donation?.bookTitle}" will become a new Inventory book with 1 copy and the next BK-#### Book ID. This can only be done once.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button size="sm" disabled={saving}
            onClick={async () => { setSaving(true); try { await onConfirm(); } finally { setSaving(false); } }}>
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}Add to Inventory
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
