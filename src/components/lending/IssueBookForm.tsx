import { useState, useMemo } from "react";
import { Search, CheckCircle2, CalendarDays, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Member } from "@/hooks/use-members";
import type { Book } from "@/hooks/use-inventory";
import type { IssueLoanInput, GuarantorDetails } from "@/hooks/use-loans";

interface IssueBookFormProps {
  members: Member[];
  books: Book[];
  onIssue: (input: IssueLoanInput) => Promise<{ success: boolean; error?: string }>;
}

const RELATIONSHIPS = ["Parent", "Sibling", "Spouse", "Friend", "Colleague", "Guardian", "Other"];

const MAX_LOANS = 5;

export function IssueBookForm({ members, books, onIssue }: IssueBookFormProps) {
  // Selection state
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  });
  const [memberOpen, setMemberOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);

  // Guarantor state
  const [gName, setGName] = useState("");
  const [gPhone, setGPhone] = useState("");
  const [gEmail, setGEmail] = useState("");
  const [gRelationship, setGRelationship] = useState("");
  const [gStreet, setGStreet] = useState("");
  const [gCity, setGCity] = useState("");
  const [gDistrict, setGDistrict] = useState("");
  const [gPostalCode, setGPostalCode] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Available books only
  const availableBooks = useMemo(() => books.filter((b) => b.availableCopies > 0), [books]);

  // Active members only
  const activeMembers = useMemo(() => members.filter((m) => m.status === "Active"), [members]);

  // Validation
  const memberWarning = useMemo(() => {
    if (!selectedMember) return "";
    if (selectedMember.status !== "Active") return "Member is not active.";
    if (selectedMember.activeLoans >= MAX_LOANS) return `Member has reached the borrowing limit (${MAX_LOANS}).`;
    if (selectedMember.fines > 0) return `Member has unpaid fines (৳${selectedMember.fines}).`;
    return "";
  }, [selectedMember]);

  const guarantorValid = gName && gPhone && gRelationship && gStreet && gCity && gDistrict;
  const canIssue = selectedMember && selectedBook && dueDate && guarantorValid && confirmed && !memberWarning && !submitting;

  const handleIssue = async () => {
    if (!selectedMember || !selectedBook || !guarantorValid) return;
    setSubmitting(true);
    setValidationError("");

    const input: IssueLoanInput = {
      memberId: selectedMember.memberId,
      memberName: selectedMember.name,
      bookId: selectedBook.id,
      bookTitle: selectedBook.title,
      accessionId: selectedBook.id,
      dueDate,
      guarantor: {
        name: gName,
        phone: gPhone,
        email: gEmail,
        relationship: gRelationship,
        street: gStreet,
        city: gCity,
        district: gDistrict,
        postalCode: gPostalCode,
      },
    };

    const result = await onIssue(input);
    setSubmitting(false);

    if (!result.success) {
      setValidationError(result.error || "Failed to issue book.");
      return;
    }

    // Reset form
    setSelectedMember(null);
    setSelectedBook(null);
    setGName("");
    setGPhone("");
    setGEmail("");
    setGRelationship("");
    setGStreet("");
    setGCity("");
    setGDistrict("");
    setGPostalCode("");
    setConfirmed(false);
    setDueDate(() => {
      const d = new Date();
      d.setDate(d.getDate() + 14);
      return d.toISOString().split("T")[0];
    });
  };

  return (
    <div className="bg-card border border-border rounded p-3">
      <h2 className="text-[13px] font-semibold text-foreground mb-2">Issue Book</h2>

      {/* Row 1: Member, Book, Due Date */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
        {/* Member search */}
        <div className="space-y-1">
          <label className="text-[12px] font-medium text-muted-foreground">Member</label>
          <Popover open={memberOpen} onOpenChange={setMemberOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-full h-8 text-[13px] justify-between font-normal">
                {selectedMember ? (
                  <span className="truncate">{selectedMember.name} <span className="text-muted-foreground text-[11px]">({selectedMember.memberId})</span></span>
                ) : (
                  <span className="text-muted-foreground">Search member…</span>
                )}
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[280px]" align="start">
              <Command>
                <CommandInput placeholder="Search by name or ID..." className="text-[13px]" />
                <CommandList>
                  <CommandEmpty className="text-[13px]">No members found.</CommandEmpty>
                  <CommandGroup>
                    {activeMembers.map((m) => (
                      <CommandItem
                        key={m.memberId}
                        value={`${m.name} ${m.memberId}`}
                        onSelect={() => { setSelectedMember(m); setMemberOpen(false); }}
                        className="text-[13px] cursor-pointer"
                      >
                        <span className="font-medium">{m.name}</span>
                        <span className="ml-auto text-[11px] text-muted-foreground">{m.memberId}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {selectedMember && !memberWarning && (
            <p className="text-[11px] text-success flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Member found
            </p>
          )}
          {memberWarning && (
            <p className="text-[11px] text-destructive">{memberWarning}</p>
          )}
        </div>

        {/* Book search */}
        <div className="space-y-1">
          <label className="text-[12px] font-medium text-muted-foreground">Book</label>
          <Popover open={bookOpen} onOpenChange={setBookOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-full h-8 text-[13px] justify-between font-normal">
                {selectedBook ? (
                  <span className="truncate">{selectedBook.title} <span className="text-muted-foreground text-[11px]">({selectedBook.id})</span></span>
                ) : (
                  <span className="text-muted-foreground">Search book or ID…</span>
                )}
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[320px]" align="start">
              <Command>
                <CommandInput placeholder="Search by title or ID..." className="text-[13px]" />
                <CommandList>
                  <CommandEmpty className="text-[13px]">No available books found.</CommandEmpty>
                  <CommandGroup>
                    {availableBooks.slice(0, 50).map((b) => (
                      <CommandItem
                        key={b.id}
                        value={`${b.title} ${b.id} ${b.author}`}
                        onSelect={() => { setSelectedBook(b); setBookOpen(false); }}
                        className="text-[13px] cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{b.title}</span>
                          <span className="text-[11px] text-muted-foreground">{b.author} · {b.availableCopies} available</span>
                        </div>
                        <span className="ml-auto text-[11px] text-muted-foreground">{b.id}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {selectedBook && (
            <p className="text-[11px] text-success flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> {selectedBook.availableCopies} copies available
            </p>
          )}
        </div>

        {/* Due Date */}
        <div className="space-y-1">
          <label className="text-[12px] font-medium text-muted-foreground">Due Date</label>
          <div className="relative">
            <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="date"
              value={dueDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDueDate(e.target.value)}
              className="pl-8 h-8 text-[13px]"
            />
          </div>
        </div>
      </div>

      {/* Guarantor Details */}
      <div className="border border-border rounded p-2.5 mb-3">
        <h3 className="text-[12px] font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Guarantor Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <Field label="Full Name *" value={gName} onChange={setGName} placeholder="Guarantor name" />
          <Field label="Phone *" value={gPhone} onChange={setGPhone} placeholder="+880..." />
          <Field label="Email" value={gEmail} onChange={setGEmail} placeholder="email@example.com" />
          <div className="space-y-1">
            <label className="text-[12px] font-medium text-muted-foreground">Relationship *</label>
            <Select value={gRelationship} onValueChange={setGRelationship}>
              <SelectTrigger className="h-8 text-[13px]">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {RELATIONSHIPS.map((r) => (
                  <SelectItem key={r} value={r} className="text-[13px]">{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-2">
          <Field label="Street Address *" value={gStreet} onChange={setGStreet} placeholder="Street address" />
          <Field label="City / Area *" value={gCity} onChange={setGCity} placeholder="City" />
          <Field label="District *" value={gDistrict} onChange={setGDistrict} placeholder="District" />
          <Field label="Postal Code" value={gPostalCode} onChange={setGPostalCode} placeholder="1200" />
        </div>
      </div>

      {/* Confirmation + Submit */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id="guarantor-confirm"
            checked={confirmed}
            onCheckedChange={(v) => setConfirmed(!!v)}
          />
          <label htmlFor="guarantor-confirm" className="text-[12px] text-muted-foreground cursor-pointer select-none">
            I confirm the guarantor is responsible for this borrowing.
          </label>
        </div>
        <Button
          size="sm"
          className="h-8 text-[13px] px-6"
          disabled={!canIssue}
          onClick={handleIssue}
        >
          {submitting ? "Issuing…" : "Confirm Issue"}
        </Button>
      </div>

      {validationError && (
        <p className="text-[12px] text-destructive mt-2">{validationError}</p>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="space-y-1">
      <label className="text-[12px] font-medium text-muted-foreground">{label}</label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-8 text-[13px]"
      />
    </div>
  );
}
