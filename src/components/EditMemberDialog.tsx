import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Member } from "@/hooks/use-members";

interface EditMemberDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (updates: {
    name: string;
    email: string;
    phone: string;
    status: Member["status"];
    addressLine: string;
    city: string;
    district: string;
    postalCode: string;
  }) => void;
  member: Member | null;
}

export function EditMemberDialog({ open, onClose, onSave, member }: EditMemberDialogProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    status: "Active" as Member["status"],
    addressLine: "",
    city: "",
    district: "",
    postalCode: "",
  });

  useEffect(() => {
    if (member) {
      setForm({
        name: member.name,
        email: member.email,
        phone: member.phone,
        status: member.status,
        addressLine: member.addressLine ?? "",
        city: member.city ?? "",
        district: member.district ?? "",
        postalCode: member.postalCode ?? "",
      });
    }
  }, [member]);

  const set = (key: keyof typeof form, val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = () => {
    if (!form.name.trim() || !form.phone.trim()) return;
    onSave(form);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-base">Edit Member</DialogTitle>
          <DialogDescription className="text-[13px]">
            Update member information below. ID: {member?.memberId}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-2 overflow-y-auto flex-1 pr-1">
          <div className="space-y-1">
            <label className="text-[12px] font-medium text-muted-foreground">Full Name *</label>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} className="h-8 text-[13px]" />
          </div>
          <div className="space-y-1">
            <label className="text-[12px] font-medium text-muted-foreground">Phone *</label>
            <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="h-8 text-[13px]" />
          </div>
          <div className="space-y-1">
            <label className="text-[12px] font-medium text-muted-foreground">Email</label>
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="h-8 text-[13px]" />
          </div>
          <div className="space-y-1">
            <label className="text-[12px] font-medium text-muted-foreground">Status</label>
            <Select value={form.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger className="h-8 text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-1">
            <p className="text-[12px] font-medium text-muted-foreground mb-2">Address</p>
            <div className="space-y-2">
              <Input placeholder="Address Line" value={form.addressLine} onChange={(e) => set("addressLine", e.target.value)} className="h-8 text-[13px]" />
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="City / Area" value={form.city} onChange={(e) => set("city", e.target.value)} className="h-8 text-[13px]" />
                <Input placeholder="District" value={form.district} onChange={(e) => set("district", e.target.value)} className="h-8 text-[13px]" />
              </div>
              <Input placeholder="Postal Code" value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} className="h-8 text-[13px] w-1/2" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" className="text-[13px] h-8" onClick={onClose}>Cancel</Button>
            <Button size="sm" className="text-[13px] h-8" onClick={handleSubmit} disabled={!form.name.trim() || !form.phone.trim()}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
