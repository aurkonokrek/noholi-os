import { useState } from "react";
import { Mail, Phone, Copy, Check } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface ContactInfoProps {
  email?: string;
  phone?: string;
}

export function ContactInfo({ email, phone }: ContactInfoProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        {email && (
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={`mailto:${email}`}
                  className="p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail className="h-3.5 w-3.5" />
                </a>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-[12px] px-2 py-1">{email}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => copyToClipboard(email, "email")}
                  className="p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copied === "email" ? (
                    <Check className="h-3 w-3 text-success" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-[12px] px-2 py-1">
                {copied === "email" ? "Copied!" : "Copy email"}
              </TooltipContent>
            </Tooltip>
          </div>
        )}
        {phone && (
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={`tel:${phone}`}
                className="p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors"
              >
                <Phone className="h-3.5 w-3.5" />
              </a>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-[12px] px-2 py-1">{phone}</TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
