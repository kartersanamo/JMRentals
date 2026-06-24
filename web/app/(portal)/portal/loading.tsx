export default function PortalLoading() {
  return (
    <div className="animate-pulse space-y-6" aria-hidden>
      <div className="h-8 w-48 bg-navy/10 rounded" />
      <div className="h-4 w-72 max-w-full bg-navy/10 rounded" />
      <div className="h-40 bg-white border border-navy/10" />
      <div className="h-56 bg-white border border-navy/10" />
    </div>
  );
}
