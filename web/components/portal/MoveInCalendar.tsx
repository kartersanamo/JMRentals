"use client";

import {
  isDateInBlockedMonth,
  monthKeyFromIso,
  parseMonthKey,
  type MonthKey,
} from "@/lib/availability/unit-availability";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type UnitAvailability = {
  id: string;
  name: string;
  blockedMonths: string[];
};

type MoveInCalendarProps = {
  unitId: string;
  units: UnitAvailability[];
  selectedDate: string;
  onSelect: (isoDate: string) => void;
  error?: string;
};

function startOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function MoveInCalendar({
  unitId,
  units,
  selectedDate,
  onSelect,
  error,
}: MoveInCalendarProps) {
  const today = useMemo(() => startOfToday(), []);
  const [viewDate, setViewDate] = useState(() => {
    if (selectedDate) {
      const parsed = new Date(`${selectedDate}T12:00:00`);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    return today;
  });

  const blockedMonths = useMemo(() => {
    const selected = units.find((unit) => unit.id === unitId);
    return new Set((selected?.blockedMonths ?? []) as MonthKey[]);
  }, [unitId, units]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthLabel = viewDate.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ date: Date | null }> = [];

    for (let i = 0; i < startOffset; i++) {
      cells.push({ date: null });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({ date: new Date(year, month, day) });
    }
    return cells;
  }, [year, month]);

  function shiftMonth(delta: number) {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  }

  if (!unitId) {
    return (
      <div className="rounded border border-navy/10 bg-sage-light/40 p-4 text-sm text-navy/70">
        Select a preferred unit to view availability and choose a move-in date.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          className="p-2 text-navy/60 hover:text-navy"
          aria-label="Previous month"
        >
          <ChevronLeft size={18} />
        </button>
        <p className="font-display text-lg text-navy">{monthLabel}</p>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          className="p-2 text-navy/60 hover:text-navy"
          aria-label="Next month"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs uppercase tracking-widest text-navy/50">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((cell, index) => {
          if (!cell.date) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const iso = toIsoDate(cell.date);
          const monthKey = monthKeyFromIso(iso);
          const monthBlocked = blockedMonths.has(monthKey);
          const isPast = cell.date < today;
          const isSelectable = !monthBlocked && !isPast;
          const isSelected = selectedDate === iso;

          return (
            <button
              key={iso}
              type="button"
              disabled={!isSelectable}
              onClick={() => isSelectable && onSelect(iso)}
              className={[
                "aspect-square rounded text-sm transition-colors",
                monthBlocked || isPast
                  ? "bg-navy/10 text-navy/30 cursor-not-allowed"
                  : "bg-white border border-navy/15 text-navy hover:border-gold",
                isSelected ? "border-gold bg-gold/15 font-semibold" : "",
              ].join(" ")}
              aria-label={`${cell.date.toLocaleDateString()}${monthBlocked ? " unavailable" : ""}`}
            >
              {cell.date.getDate()}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-navy/60">
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-white border border-navy/15" />
          Available
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-navy/10" />
          Booked (entire month unavailable)
        </span>
      </div>

      {units.length > 1 && (
        <details className="text-xs text-navy/60">
          <summary className="cursor-pointer hover:text-navy">
            View booked months for all units
          </summary>
          <ul className="mt-2 space-y-1">
            {units.map((unit) => (
              <li key={unit.id}>
                <span className="font-medium text-navy/80">{unit.name}:</span>{" "}
                {unit.blockedMonths.length > 0
                  ? unit.blockedMonths
                      .map((key) => {
                        const { year: y, month: m } = parseMonthKey(key as MonthKey);
                        return new Date(y, m - 1, 1).toLocaleDateString(undefined, {
                          month: "short",
                          year: "numeric",
                        });
                      })
                      .join(", ")
                  : "No booked months"}
              </li>
            ))}
          </ul>
        </details>
      )}

      {selectedDate && isDateInBlockedMonth(new Date(`${selectedDate}T12:00:00`), blockedMonths) && (
        <p className="text-xs text-red-700">
          The selected month is booked for this unit. Please choose another date.
        </p>
      )}

      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
