import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ActiveLoan } from "@/hooks/use-loans";

const RELATIONSHIPS = ["Parent", "Sibling", "Spouse", "Friend", "Colleague", "Guardian", "Other"];

interface EditLoanDialogProps {
  loan: ActiveLoan | null;
  open: boolean;
  onClose: () => void;
  onSave: (loanId: string, updates: {
    dueDate: string;
    guarantorName: string;
    guarantorPhone: string;
    guarantorEmail: string;
    guarantorRelationship: string;
    guarantorStreet: string;
    guarantorCity: string;
    guarantorDistrict: string;
    guarantorPostalCode: string;
    notes: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

export function EditLoanDialog({ loan, open, onClose, onSave }: EditLoanDialogProps) {
  const [dueDate, setDueDate] = useState("");
  const [gName, setGName] = useState("");
  const [gPhone, setGPhone] = useState("");
  const [gEmail, setGEmail] = useState("");
  const [gRelationship, setGRelationship] = useState("");
  const [gStreet, setGStreet] = useState("");
  const [gCity, setGCity] = useState("");
  const [gDistrict, setGDistrict] = useState("");
  const [gPostalCode, setGPostalCode] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loan) {
      setDueDate(loan.dueDate);
      setGName(loan.guarantor.name);
      setGPhone(loan.guarantor.phone);
      setGEmail(loan.guarantor.email);
      setGRelationship(loan.guarantor.relationship);
      setGStreet(loan.guarantor.street);
      setGCity(loan.guarantor.city);
      setGDistrict(loan.guarantor.district);
      setGPostalCode(loan.guarantor.postalCode);
      setNotes((loan as any).notes || "");
    }
  }, [loan]);

  if (!loan) return null;

  const handleSave = async () => {
    setSaving(true);
    await onSave(loan.id, {
      dueDate,
      guarantorName: gName,
      guarantorPhone: gPhone,
      guarantorEmail: gEmail,
      guarantorRelationship: gRelationship,
      guarantorStreet: gStreet,
      guarantorCity: gCity,
      guarantorDistrict: gDistrict,
      guarantorPostalCode: gPostalCode,
      notes,
    });
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[14px] font-semibold">Edit Loan — {loan.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-[13px]">
          {/* Read-only info */}
          <div className="bg-secondary/30 rounded p-2.5 space-y-1">
            <div className="flex justify-between"><span className="text-muted-foreground">Loan ID</span><span className="font-medium text-foreground">{loan.id}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Issue Date</span><span className="font-medium text-foreground">{loan.issuedDate}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Book</span><span className="font-medium text-foreground">{loan.book} ({loan.accessionId})</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Member</span><span className="font-medium text-foreground">{loan.member} ({loan.memberId})</span></div>
          </div>

          {/* Due Date */}
          <div className="space-y-1">
            <label className="text-[12px] font-medium text-muted-foreground">Due Date</label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="h-8 text-[13px]" />
          </div>

          {/* Guarantor */}
          <div className="border border-border rounded p-2.5 space-y-2">
            <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">Guarantor Details</h4>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Full Name" value={gName} onChange={setGName} />
              <Field label="Phone" value={gPhone} onChange={setGPhone} />
              <Field label="Email" value={gEmail} onChange={setGEmail} />
              <div className="space-y-1">
                <label className="text-[12px] font-medium text-muted-foreground">Relationship</label>
                <Select value={gRelationship} onValueChange={setGRelationship}>
                  <SelectTrigger className="h-8 text-[13px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIPS.map((r) => <SelectItem key={r} value={r} className="text-[13px]">{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Field label="Street" value={gStreet} onChange={setGStreet} />
              <Field label="City" value={gCity} onChange={setGCity} />
              <Field label="District" value={gDistrict} onChange={setGDistrict} />
              <Field label="Postal Code" value={gPostalCode} onChange={setGPostalCode} />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-[12px] font-medium text-muted-foreground">Notes (optional)</label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add notes..." className="text-[13px] min-h-[60px]" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} className="text-[13px]">Cancel</Button>
          <Button size="sm" onClick={handleSave} disabled={saving} className="text-[13px]">{saving ? "Saving…" : "Save Changes"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <label className="text-[12px] font-medium text-muted-foreground">{label}</label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-8 text-[13px]" />
    </div>
  );
}
