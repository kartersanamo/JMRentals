import { site } from "@/lib/site-config";

export function HoursTable() {
  return (
    <div>
      <h3 className="text-xs uppercase tracking-[0.25em] text-gold mb-4">
        Office Hours
      </h3>
      <ul className="space-y-2">
        {site.hours.map((row) => (
          <li
            key={row.day}
            className="flex justify-between gap-4 text-sm text-navy/80 border-b border-navy/5 pb-2"
          >
            <span className="font-medium">{row.day}</span>
            <span>
              {row.closed
                ? "Closed"
                : `${row.open} – ${row.close}`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
