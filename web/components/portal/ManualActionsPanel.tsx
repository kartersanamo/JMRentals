"use client";

import { useState } from "react";

export function ManualActionsPanel({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-navy/10 bg-white">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-sage-light/20 transition-colors"
      >
        <span>
          <span className="font-display text-lg text-navy block">Manual actions</span>
          <span className="text-sm text-navy/60">
            Override automation — create leases, attach documents, or record offline payments
          </span>
        </span>
        <span className="text-navy/50 text-xl leading-none" aria-hidden>
          {open ? "−" : "+"}
        </span>
      </button>
      {open && <div className="px-6 pb-6 space-y-8 border-t border-navy/10 pt-6">{children}</div>}
    </div>
  );
}
