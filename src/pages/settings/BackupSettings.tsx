import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Database, Trash2, CheckCircle, Clock, HardDrive } from "lucide-react";

export function BackupSettings() {
  const { toast } = useToast();
  const [backing, setBacking] = useState(false);
  const [clearing, setClearing] = useState(false);

  const lastBackup = {
    date: "2026-02-15 02:00",
    size: "14.3 MB",
    status: "Completed",
  };

  const handleBackup = () => {
    setBacking(true);
    setTimeout(() => {
      setBacking(false);
      toast({ title: "Backup created", description: "Database backup completed successfully." });
    }, 2000);
  };

  const handleClearCache = () => {
    setClearing(true);
    setTimeout(() => {
      setClearing(false);
      toast({ title: "Cache cleared", description: "System cache has been cleared." });
    }, 800);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4" /> Manual Backup
          </CardTitle>
          <CardDescription className="text-xs">Create a full database backup on demand.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleBackup} disabled={backing} size="sm">
            {backing ? (
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Creating backup…
              </span>
            ) : (
              "Create Backup Now"
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Last Backup</CardTitle>
          <CardDescription className="text-xs">Information about the most recent backup.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-[11px] text-muted-foreground">Date</p>
                <p className="font-medium text-xs">{lastBackup.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <HardDrive className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-[11px] text-muted-foreground">Size</p>
                <p className="font-medium text-xs">{lastBackup.size}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-success" />
              <div>
                <p className="text-[11px] text-muted-foreground">Status</p>
                <p className="font-medium text-xs">{lastBackup.status}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Trash2 className="h-4 w-4" /> Clear Cache
          </CardTitle>
          <CardDescription className="text-xs">Remove cached data to free up resources.</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">Clear System Cache</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear system cache?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all cached data. The system may be temporarily slower while the cache rebuilds.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearCache} disabled={clearing}>
                  {clearing ? "Clearing…" : "Confirm"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
