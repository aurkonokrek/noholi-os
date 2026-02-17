import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { User, Upload } from "lucide-react";

export function AccountSettings() {
  const { toast } = useToast();
  const [name, setName] = useState("Admin User");
  const [email, setEmail] = useState("admin@noholi.org");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image file.", variant: "destructive" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Avatar must be under 2 MB.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    if (!name.trim() || !email.trim()) {
      toast({ title: "Validation error", description: "Name and email are required.", variant: "destructive" });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    setSavingProfile(true);
    setTimeout(() => {
      setSavingProfile(false);
      toast({ title: "Profile updated", description: "Your profile has been saved." });
    }, 600);
  };

  const getPasswordStrength = (pw: string): { label: string; color: string } => {
    if (pw.length < 6) return { label: "Too short", color: "text-destructive" };
    if (pw.length < 8) return { label: "Weak", color: "text-warning" };
    const hasUpper = /[A-Z]/.test(pw);
    const hasNumber = /[0-9]/.test(pw);
    const hasSpecial = /[^A-Za-z0-9]/.test(pw);
    const score = [hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
    if (score >= 3 && pw.length >= 10) return { label: "Strong", color: "text-success" };
    if (score >= 2) return { label: "Good", color: "text-primary" };
    return { label: "Fair", color: "text-warning" };
  };

  const handleChangePassword = () => {
    if (!currentPw || !newPw || !confirmPw) {
      toast({ title: "Missing fields", description: "All password fields are required.", variant: "destructive" });
      return;
    }
    if (newPw.length < 8) {
      toast({ title: "Password too short", description: "New password must be at least 8 characters.", variant: "destructive" });
      return;
    }
    if (newPw !== confirmPw) {
      toast({ title: "Mismatch", description: "New password and confirmation do not match.", variant: "destructive" });
      return;
    }
    setSavingPw(true);
    setTimeout(() => {
      setSavingPw(false);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      toast({ title: "Password changed", description: "Your password has been updated successfully." });
    }, 600);
  };

  const pwStrength = newPw ? getPasswordStrength(newPw) : null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription className="text-xs">Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="cursor-pointer">
              {avatar ? (
                <img src={avatar} alt="Avatar" className="h-12 w-12 rounded-full object-cover border border-border" />
              ) : (
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground border border-border">
                  <User className="h-5 w-5" />
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
            <div className="text-xs text-muted-foreground">
              <p className="font-medium text-foreground text-sm">Profile Picture</p>
              <p>Click to upload. Max 2 MB.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Full Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="h-8 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-8 text-sm" />
            </div>
          </div>
          <div className="space-y-1.5 max-w-sm">
            <Label className="text-xs">Phone (optional)</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-8 text-sm" placeholder="+254 700 000 000" />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveProfile} disabled={savingProfile} size="sm">
              {savingProfile ? "Saving…" : "Save Profile"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Change Password</CardTitle>
          <CardDescription className="text-xs">Update your password. You will need to re-enter your current password.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-w-sm space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Current Password</Label>
              <Input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className="h-8 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">New Password</Label>
              <Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className="h-8 text-sm" />
              {pwStrength && <p className={`text-[11px] ${pwStrength.color}`}>Strength: {pwStrength.label}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Confirm New Password</Label>
              <Input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} className="h-8 text-sm" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleChangePassword} disabled={savingPw} size="sm">
              {savingPw ? "Updating…" : "Update Password"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
