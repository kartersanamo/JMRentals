"use client";

const labelClass =
  "block text-xs uppercase tracking-widest text-navy/70 mb-2";

type RentTermPickerProps = {
  value: "MONTHLY" | "ANNUALLY";
  onChange: (value: "MONTHLY" | "ANNUALLY") => void;
  name?: string;
};

export function RentTermPicker({
  value,
  onChange,
  name = "rentTerm",
}: RentTermPickerProps) {
  return (
    <div>
      <p className={labelClass}>Rent Payment</p>
      <input type="hidden" name={name} value={value} />
      <div className="grid sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange("MONTHLY")}
          className={[
            "border px-4 py-3 text-left transition-colors",
            value === "MONTHLY"
              ? "border-gold bg-gold/10 text-navy"
              : "border-navy/20 bg-white text-navy hover:border-gold/60",
          ].join(" ")}
        >
          <span className="block font-medium">Monthly</span>
          <span className="block text-xs text-navy/60 mt-1">
            Pay rent each month
          </span>
        </button>
        <button
          type="button"
          disabled
          className="border border-navy/10 bg-navy/5 px-4 py-3 text-left text-navy/40 cursor-not-allowed"
        >
          <span className="block font-medium">Annually</span>
          <span className="block text-xs mt-1">Coming soon</span>
        </button>
      </div>
    </div>
  );
}
