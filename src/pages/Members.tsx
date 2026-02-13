import { useState } from "react";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Member {
  memberId: string;
  name: string;
  contact: string;
  activeLoans: number;
  fines: number;
  status: "Active" | "Suspended" | "Expired";
}

const STATUS_STYLES: Record<Member["status"], string> = {
  Active: "bg-success/10 text-success border-success/20",
  Suspended: "bg-destructive/10 text-destructive border-destructive/20",
  Expired: "bg-warning/10 text-warning border-warning/20",
};

const MEMBERS: Member[] = [
  { memberId: "MEM-1001", name: "Alice Mwangi", contact: "alice@email.com", activeLoans: 2, fines: 0, status: "Active" },
  { memberId: "MEM-1002", name: "James Oloo", contact: "james@email.com", activeLoans: 0, fines: 150, status: "Active" },
  { memberId: "MEM-1003", name: "John Otieno", contact: "john@email.com", activeLoans: 0, fines: 500, status: "Suspended" },
  { memberId: "MEM-1004", name: "Sarah Njoki", contact: "sarah@email.com", activeLoans: 1, fines: 0, status: "Active" },
  { memberId: "MEM-1005", name: "Peter Kamau", contact: "peter@email.com", activeLoans: 1, fines: 75, status: "Active" },
  { memberId: "MEM-1006", name: "Grace Wambui", contact: "grace@email.com", activeLoans: 1, fines: 0, status: "Active" },
  { memberId: "MEM-1007", name: "Daniel Kipchoge", contact: "daniel@email.com", activeLoans: 1, fines: 200, status: "Active" },
  { memberId: "MEM-1008", name: "Faith Achieng", contact: "faith@email.com", activeLoans: 1, fines: 0, status: "Active" },
  { memberId: "MEM-1009", name: "Moses Wekesa", contact: "moses@email.com", activeLoans: 0, fines: 0, status: "Expired" },
  { memberId: "MEM-1010", name: "Lydia Chebet", contact: "lydia@email.com", activeLoans: 0, fines: 350, status: "Suspended" },
];

export default function MembersPage() {
  const [search, setSearch] = useState("");

  const filtered = MEMBERS.filter(
    (m) =>
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.memberId.toLowerCase().includes(search.toLowerCase()) ||
      m.contact.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Members</h1>
          <p className="text-[13px] text-muted-foreground">{MEMBERS.length} registered members</p>
        </div>
        <Button size="sm" className="gap-1.5 text-[13px]">
          <Plus className="h-3.5 w-3.5" /> Add Member
        </Button>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-8 text-[13px]"
        />
      </div>

      <div className="bg-card border border-border rounded">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Member ID</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Name</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Contact</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Active Loans</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Fines (KES)</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Status</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.memberId} className="border-b border-border last:border-b-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-2.5 text-muted-foreground font-mono text-[12px]">{m.memberId}</td>
                  <td className="px-4 py-2.5 font-medium text-foreground">{m.name}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{m.contact}</td>
                  <td className="px-4 py-2.5 text-foreground">{m.activeLoans}</td>
                  <td className="px-4 py-2.5 text-foreground">{m.fines > 0 ? m.fines.toLocaleString() : "—"}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border ${STATUS_STYLES[m.status]}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1">
                      <button className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
