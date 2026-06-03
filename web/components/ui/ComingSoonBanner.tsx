import { Clock } from "lucide-react";

interface ComingSoonBannerProps {
  title?: string;
  description?: string;
  compact?: boolean;
}

export function ComingSoonBanner({
  title = "Coming Soon",
  description = "Online booking is on the way. Contact us today to inquire about availability.",
  compact = false,
}: ComingSoonBannerProps) {
  return (
    <div
      className={`flex items-start gap-3 rounded-sm border border-gold/40 bg-gold/10 ${
        compact ? "p-3" : "p-5"
      }`}
    >
      <Clock className="h-5 w-5 shrink-0 text-gold mt-0.5" aria-hidden />
      <div>
        <p className={`font-medium text-navy ${compact ? "text-sm" : "text-base"}`}>
          {title}
        </p>
        {!compact && (
          <p className="mt-1 text-sm text-navy/70 leading-relaxed">{description}</p>
        )}
      </div>
    </div>
  );
}
