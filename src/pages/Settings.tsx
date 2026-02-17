import { useState } from "react";
import { Settings, User, Shield, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { GeneralSettings } from "./settings/GeneralSettings";
import { AccountSettings } from "./settings/AccountSettings";
import { SecuritySettings } from "./settings/SecuritySettings";
import { BackupSettings } from "./settings/BackupSettings";

const TABS = [
  { id: "general", label: "General", icon: Settings },
  { id: "account", label: "Account", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "backup", label: "Backup & Maintenance", icon: Database },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("general");

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Settings</h1>
        <p className="text-[13px] text-muted-foreground">Manage system configuration, account, security, and maintenance.</p>
      </div>

      <div className="flex gap-5">
        {/* Vertical sidebar nav */}
        <nav className="w-48 shrink-0 space-y-0.5">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 w-full px-3 py-2 text-[13px] rounded transition-colors text-left",
                  active
                    ? "bg-accent/10 text-accent font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Content area */}
        <div className="flex-1 min-w-0">
          {activeTab === "general" && <GeneralSettings />}
          {activeTab === "account" && <AccountSettings />}
          {activeTab === "security" && <SecuritySettings />}
          {activeTab === "backup" && <BackupSettings />}
        </div>
      </div>
    </div>
  );
}
