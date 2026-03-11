import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface EditMemberDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (updates: { name: string; email: string; phone: string }) => void;
  member: { name: string; email: string; phone: string } | null;
}

export function EditMemberDialog({ open, onClose, onSave, member }: EditMemberDialogProps) {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    if (member) setForm({ name: member.name, email: member.email, phone: member.phone });
  }, [member]);

  const set = (key: keyof typeof form, val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = () => {
    if (!form.name.trim() || !form.email.trim()) return;
    onSave(form);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Edit Member</DialogTitle>
          <DialogDescription className="text-[13px]">Update member information below.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="space-y-1">
            <label className="text-[12px] font-medium text-muted-foreground">Full Name *</label>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} className="h-8 text-[13px]" />
          </div>
          <div className="space-y-1">
            <label className="text-[12px] font-medium text-muted-foreground">Email *</label>
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="h-8 text-[13px]" />
          </div>
          <div className="space-y-1">
            <label className="text-[12px] font-medium text-muted-foreground">Phone</label>
            <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="h-8 text-[13px]" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" className="text-[13px] h-8" onClick={onClose}>Cancel</Button>
            <Button size="sm" className="text-[13px] h-8" onClick={handleSubmit} disabled={!form.name.trim() || !form.email.trim()}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
