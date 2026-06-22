import { Check, X } from "lucide-react";
import type { ValidationRequirement } from "@/lib/validators/fields";

export function ValidationChecklist({
  items,
  className = "",
}: {
  items: ValidationRequirement[];
  className?: string;
}) {
  if (items.length === 0) return null;

  return (
    <ul className={`space-y-1.5 ${className}`} aria-live="polite">
      {items.map((item) => (
        <li
          key={item.id}
          className={`flex items-start gap-2 text-xs ${
            item.met ? "text-green-800" : "text-red-700"
          }`}
        >
          {item.met ? (
            <Check size={14} className="shrink-0 mt-0.5" aria-hidden />
          ) : (
            <X size={14} className="shrink-0 mt-0.5" aria-hidden />
          )}
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
