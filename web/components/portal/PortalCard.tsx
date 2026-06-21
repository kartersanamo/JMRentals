import { type ReactNode } from "react";

export function PortalCard({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white border border-navy/10 shadow-sm ${className}`}
    >
      {title && (
        <div className="px-5 py-4 border-b border-navy/10">
          <h2 className="font-display text-xl text-navy">{title}</h2>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

export function PortalPageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-8">
      <h1 className="font-display text-3xl md:text-4xl text-navy">{title}</h1>
      {subtitle && <p className="mt-2 text-navy/65 max-w-2xl">{subtitle}</p>}
    </div>
  );
}

export function StatusBadge({
  status,
}: {
  status: string;
}) {
  const colors: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800",
    DISABLED: "bg-red-100 text-red-800",
    AVAILABLE: "bg-green-100 text-green-800",
    OCCUPIED: "bg-blue-100 text-blue-800",
    MAINTENANCE: "bg-yellow-100 text-yellow-800",
    SUBMITTED: "bg-blue-100 text-blue-800",
    UNDER_REVIEW: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    DENIED: "bg-red-100 text-red-800",
    OPEN: "bg-orange-100 text-orange-800",
    IN_PROGRESS: "bg-yellow-100 text-yellow-800",
    RESOLVED: "bg-green-100 text-green-800",
    CLOSED: "bg-navy/10 text-navy",
    PENDING: "bg-yellow-100 text-yellow-800",
    ENDED: "bg-navy/10 text-navy",
  };
  const cls = colors[status] ?? "bg-navy/10 text-navy";
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium uppercase tracking-wide ${cls}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <p className="text-navy/50 text-sm py-8 text-center">{message}</p>
  );
}
