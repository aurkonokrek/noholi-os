import { cn } from "@/lib/utils";

export type BadgeVariant = "success" | "warning" | "destructive" | "accent" | "muted" | "default";

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  destructive: "bg-destructive/10 text-destructive border-destructive/20",
  accent: "bg-accent/10 text-accent border-accent/20",
  muted: "bg-muted text-muted-foreground border-border",
  default: "bg-secondary text-secondary-foreground border-border",
};

interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  /** If provided, badge becomes clickable */
  onClick?: () => void;
}

export function StatusBadge({ children, variant = "default", className, onClick }: StatusBadgeProps) {
  const Tag = onClick ? "button" : "span";
  return (
    <Tag
      onClick={onClick ? (e) => { e.stopPropagation(); onClick(); } : undefined}
      className={cn(
        "inline-block px-2 py-0.5 rounded text-[11px] font-medium border leading-tight",
        VARIANT_STYLES[variant],
        onClick && "cursor-pointer hover:opacity-80 transition-opacity",
        className
      )}
    >
      {children}
    </Tag>
  );
}
