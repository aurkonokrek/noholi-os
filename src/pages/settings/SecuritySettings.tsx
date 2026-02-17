import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { DataTable, type Column } from "@/components/DataTable";
import { Shield, Clock } from "lucide-react";

const SESSION_OPTIONS = [
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "60", label: "1 hour" },
  { value: "120", label: "2 hours" },
];

interface ActivityEntry {
  id: string;
  action: string;
  timestamp: string;
  ip: string;
  device: string;
}

interface LoginEntry {
  id: string;
  datetime: string;
  ip: string;
  device: string;
  status: "Success" | "Failed";
}

const MOCK_ACTIVITY: ActivityEntry[] = [
  { id: "1", action: "Admin login", timestamp: "2026-02-17 09:12", ip: "192.168.1.10", device: "Chrome / macOS" },
  { id: "2", action: "Password changed", timestamp: "2026-02-16 14:05", ip: "192.168.1.10", device: "Chrome / macOS" },
  { id: "3", action: "Book added to inventory", timestamp: "2026-02-16 11:30", ip: "192.168.1.10", device: "Chrome / macOS" },
  { id: "4", action: "Member status changed", timestamp: "2026-02-15 16:45", ip: "10.0.0.5", device: "Firefox / Windows" },
  { id: "5", action: "Backup created", timestamp: "2026-02-15 02:00", ip: "System", device: "Automated" },
  { id: "6", action: "Fine marked as paid", timestamp: "2026-02-14 10:20", ip: "192.168.1.10", device: "Chrome / macOS" },
  { id: "7", action: "Donation approved", timestamp: "2026-02-14 09:00", ip: "192.168.1.10", device: "Chrome / macOS" },
  { id: "8", action: "Admin logout", timestamp: "2026-02-13 18:00", ip: "192.168.1.10", device: "Chrome / macOS" },
];

const MOCK_LOGINS: LoginEntry[] = [
  { id: "1", datetime: "2026-02-17 09:12", ip: "192.168.1.10", device: "Chrome / macOS", status: "Success" },
  { id: "2", datetime: "2026-02-16 08:55", ip: "192.168.1.10", device: "Chrome / macOS", status: "Success" },
  { id: "3", datetime: "2026-02-15 22:10", ip: "45.33.12.8", device: "Unknown", status: "Failed" },
  { id: "4", datetime: "2026-02-15 09:00", ip: "10.0.0.5", device: "Firefox / Windows", status: "Success" },
  { id: "5", datetime: "2026-02-14 07:45", ip: "192.168.1.10", device: "Chrome / macOS", status: "Success" },
];

const activityColumns: Column<ActivityEntry>[] = [
  { key: "action", label: "Action", render: (row) => row.action },
  { key: "timestamp", label: "Timestamp", render: (row) => row.timestamp },
  { key: "ip", label: "IP Address", render: (row) => row.ip },
  { key: "device", label: "Device", render: (row) => row.device },
];

const loginColumns: Column<LoginEntry>[] = [
  { key: "datetime", label: "Date/Time", render: (row) => row.datetime },
  { key: "ip", label: "IP Address", render: (row) => row.ip },
  { key: "device", label: "Device", render: (row) => row.device },
  {
    key: "status",
    label: "Status",
    render: (row) => (
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium ${
        row.status === "Success"
          ? "bg-success/10 text-success"
          : "bg-destructive/10 text-destructive"
      }`}>
        {row.status}
      </span>
    ),
  },
];

export function SecuritySettings() {
  const { toast } = useToast();
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [savingSession, setSavingSession] = useState(false);
  const [activitySearch, setActivitySearch] = useState("");
  const [loginSearch, setLoginSearch] = useState("");

  const handleSaveSession = () => {
    setSavingSession(true);
    setTimeout(() => {
      setSavingSession(false);
      toast({ title: "Session settings saved", description: `Timeout set to ${SESSION_OPTIONS.find(o => o.value === sessionTimeout)?.label}.` });
    }, 400);
  };

  const filteredActivity = MOCK_ACTIVITY.filter((a) =>
    a.action.toLowerCase().includes(activitySearch.toLowerCase()) ||
    a.timestamp.includes(activitySearch) ||
    a.ip.includes(activitySearch)
  );

  const filteredLogins = MOCK_LOGINS.filter((l) =>
    l.datetime.includes(loginSearch) ||
    l.ip.includes(loginSearch) ||
    l.device.toLowerCase().includes(loginSearch.toLowerCase()) ||
    l.status.toLowerCase().includes(loginSearch.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" /> Session Timeout
          </CardTitle>
          <CardDescription className="text-xs">Auto-logout after inactivity period.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3">
            <div className="space-y-1.5 w-48">
              <Label className="text-xs">Timeout Duration</Label>
              <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SESSION_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value} className="text-sm">{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSaveSession} disabled={savingSession} size="sm">
              {savingSession ? "Saving…" : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" /> Activity Log
          </CardTitle>
          <CardDescription className="text-xs">System-wide activity audit trail. Read-only.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input
            placeholder="Search activity…"
            value={activitySearch}
            onChange={(e) => setActivitySearch(e.target.value)}
            className="h-8 text-sm max-w-xs"
          />
          <DataTable columns={activityColumns} data={filteredActivity} compact keyExtractor={(row) => row.id} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Login History</CardTitle>
          <CardDescription className="text-xs">Recent login attempts and their status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input
            placeholder="Search logins…"
            value={loginSearch}
            onChange={(e) => setLoginSearch(e.target.value)}
            className="h-8 text-sm max-w-xs"
          />
          <DataTable columns={loginColumns} data={filteredLogins} compact keyExtractor={(row) => row.id} />
        </CardContent>
      </Card>
    </div>
  );
}
