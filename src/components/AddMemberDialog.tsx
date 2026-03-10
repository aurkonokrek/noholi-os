import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface NewMember {
  name: string;
  email: string;
  phone: string;
}

interface AddMemberDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (member: NewMember) => void;
}

export function AddMemberDialog({ open, onClose, onAdd }: AddMemberDialogProps) {
  const [form, setForm] = useState<NewMember>({ name: "", email: "", phone: "" });

  const set = (key: keyof NewMember, val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = () => {
    if (!form.name.trim() || !form.email.trim()) return;
    onAdd(form);
    setForm({ name: "", email: "", phone: "" });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Add New Member</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="space-y-1">
            <label className="text-[12px] font-medium text-muted-foreground">Full Name *</label>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} className="h-8 text-[13px]" placeholder="Enter full name" />
          </div>
          <div className="space-y-1">
            <label className="text-[12px] font-medium text-muted-foreground">Email *</label>
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="h-8 text-[13px]" placeholder="member@email.com" />
          </div>
          <div className="space-y-1">
            <label className="text-[12px] font-medium text-muted-foreground">Phone</label>
            <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="h-8 text-[13px]" placeholder="+880..." />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" className="text-[13px] h-8" onClick={onClose}>Cancel</Button>
            <Button size="sm" className="text-[13px] h-8" onClick={handleSubmit} disabled={!form.name.trim() || !form.email.trim()}>Add Member</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
