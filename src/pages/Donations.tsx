import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Donation {
  id: string;
  donorName: string;
  bookTitle: string;
  author: string;
  condition: "New" | "Good" | "Fair" | "Poor";
  assignedId: string;
  date: string;
}

const CONDITION_STYLES: Record<Donation["condition"], string> = {
  New: "bg-success/10 text-success border-success/20",
  Good: "bg-accent/10 text-accent border-accent/20",
  Fair: "bg-warning/10 text-warning border-warning/20",
  Poor: "bg-destructive/10 text-destructive border-destructive/20",
};

const DONATIONS: Donation[] = [
  { id: "DON-001", donorName: "Nairobi Book Club", bookTitle: "Sapiens", author: "Yuval Noah Harari", condition: "Good", assignedId: "ACC-0013", date: "2026-02-12" },
  { id: "DON-002", donorName: "Mary Wanjiku", bookTitle: "Educated", author: "Tara Westover", condition: "New", assignedId: "ACC-0014", date: "2026-02-10" },
  { id: "DON-003", donorName: "KCB Foundation", bookTitle: "The Art of War", author: "Sun Tzu", condition: "Fair", assignedId: "ACC-0015", date: "2026-02-08" },
  { id: "DON-004", donorName: "Anonymous", bookTitle: "To Kill a Mockingbird", author: "Harper Lee", condition: "Good", assignedId: "ACC-0016", date: "2026-02-05" },
  { id: "DON-005", donorName: "Safaricom PLC", bookTitle: "Zero to One", author: "Peter Thiel", condition: "New", assignedId: "ACC-0017", date: "2026-02-03" },
  { id: "DON-006", donorName: "James Oloo", bookTitle: "Things Fall Apart", author: "Chinua Achebe", condition: "Poor", assignedId: "ACC-0018", date: "2026-01-28" },
];

export default function DonationsPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Donations</h1>
          <p className="text-[13px] text-muted-foreground">{DONATIONS.length} donations recorded</p>
        </div>
        <Button size="sm" className="gap-1.5 text-[13px]" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {showForm ? "Cancel" : "Add Donation"}
        </Button>
      </div>

      {/* Add Donation Form */}
      {showForm && (
        <div className="bg-card border border-border rounded p-4">
          <h2 className="text-[13px] font-semibold text-foreground mb-3">New Donation</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-muted-foreground">Donor Name</label>
              <Input placeholder="Enter donor name" className="h-8 text-[13px]" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-muted-foreground">Book Title</label>
              <Input placeholder="Enter book title" className="h-8 text-[13px]" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-muted-foreground">Author</label>
              <Input placeholder="Enter author" className="h-8 text-[13px]" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-muted-foreground">Condition</label>
              <select className="w-full h-8 rounded border border-input bg-background px-2.5 text-[13px] text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option>New</option>
                <option>Good</option>
                <option>Fair</option>
                <option>Poor</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-muted-foreground">Assign Accession ID</label>
              <Input placeholder="e.g. ACC-0019" className="h-8 text-[13px]" />
            </div>
            <div className="flex items-end">
              <Button size="sm" className="h-8 text-[13px]">Save Donation</Button>
            </div>
          </div>
        </div>
      )}

      {/* History Table */}
      <div className="bg-card border border-border rounded">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-[13px] font-semibold text-foreground">Donation History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left font-medium text-muted-foreground px-4 py-2.5">ID</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Donor</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Book Title</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Author</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Condition</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Assigned ID</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Date</th>
              </tr>
            </thead>
            <tbody>
              {DONATIONS.map((d) => (
                <tr key={d.id} className="border-b border-border last:border-b-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-2.5 text-muted-foreground font-mono text-[12px]">{d.id}</td>
                  <td className="px-4 py-2.5 font-medium text-foreground">{d.donorName}</td>
                  <td className="px-4 py-2.5 text-foreground">{d.bookTitle}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{d.author}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border ${CONDITION_STYLES[d.condition]}`}>
                      {d.condition}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground font-mono text-[12px]">{d.assignedId}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{d.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
