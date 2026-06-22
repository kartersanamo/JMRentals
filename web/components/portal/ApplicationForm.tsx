"use client";

import { ActionForm } from "@/components/portal/ActionForm";
import { MoveInCalendar } from "@/components/portal/MoveInCalendar";
import { RentTermPicker } from "@/components/portal/RentTermPicker";
import { Button } from "@/components/ui/Button";
import { PhoneField } from "@/components/ui/PhoneField";
import { submitApplication } from "@/lib/actions/portal";
import { isDateInBlockedMonth, type MonthKey } from "@/lib/availability/unit-availability";
import type { PreviousJob } from "@/lib/validators/portal";
import { employmentDetailsSchema } from "@/lib/validators/portal";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

const fieldClass =
  "w-full border border-navy/20 px-4 py-3 text-navy bg-white focus:outline-none focus:border-gold";
const labelClass =
  "block text-xs uppercase tracking-widest text-navy/70 mb-2";

const emptyPreviousJob = (): PreviousJob => ({
  employer: "",
  position: "",
  startDate: "",
  endDate: "",
});

type UnitOption = {
  id: string;
  name: string;
  monthlyRent: number;
};

type UnitAvailability = {
  id: string;
  name: string;
  blockedMonths: string[];
};

export function ApplicationForm({
  units,
  defaultUnitId,
}: {
  units: UnitOption[];
  defaultUnitId?: string;
}) {
  const [selectedUnitId, setSelectedUnitId] = useState(defaultUnitId ?? "");
  const [moveInDate, setMoveInDate] = useState("");
  const [rentTerm, setRentTerm] = useState<"MONTHLY" | "ANNUALLY">("MONTHLY");
  const [availability, setAvailability] = useState<UnitAvailability[]>([]);
  const [availabilityError, setAvailabilityError] = useState("");
  const [currentEmployer, setCurrentEmployer] = useState("");
  const [currentPosition, setCurrentPosition] = useState("");
  const [employmentStartDate, setEmploymentStartDate] = useState("");
  const [yearlyIncome, setYearlyIncome] = useState("");
  const [employerPhone, setEmployerPhone] = useState("");
  const [supervisorName, setSupervisorName] = useState("");
  const [previousJobs, setPreviousJobs] = useState<PreviousJob[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;

    async function loadAvailability() {
      setAvailabilityError("");
      try {
        const res = await fetch("/api/portal/unit-availability");
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error ?? "Could not load availability.");
        }
        if (!cancelled) {
          setAvailability(json.units ?? []);
        }
      } catch (error) {
        if (!cancelled) {
          setAvailabilityError(
            error instanceof Error ? error.message : "Could not load availability."
          );
        }
      }
    }

    void loadAvailability();
    return () => {
      cancelled = true;
    };
  }, []);

  function updatePreviousJob(
    index: number,
    field: keyof PreviousJob,
    value: string
  ) {
    setPreviousJobs((jobs) =>
      jobs.map((job, i) => (i === index ? { ...job, [field]: value } : job))
    );
  }

  function addPreviousJob() {
    setPreviousJobs((jobs) => [...jobs, emptyPreviousJob()]);
  }

  function removePreviousJob(index: number) {
    setPreviousJobs((jobs) => jobs.filter((_, i) => i !== index));
  }

  async function handleSubmit(formData: FormData) {
    setFieldErrors({});

    if (!selectedUnitId) {
      return { error: "Please select a preferred unit." };
    }
    if (!moveInDate) {
      return { error: "Please select a move-in date." };
    }

    const unitAvailability = availability.find((unit) => unit.id === selectedUnitId);
    const blockedMonths = new Set((unitAvailability?.blockedMonths ?? []) as MonthKey[]);
    if (isDateInBlockedMonth(new Date(`${moveInDate}T12:00:00`), blockedMonths)) {
      return { error: "The selected move-in month is booked for this unit." };
    }

    const filledPreviousJobs = previousJobs.filter(
      (job) =>
        job.employer.trim() ||
        job.position.trim() ||
        job.startDate ||
        job.endDate
    );

    const employmentDetails = {
      currentEmployer,
      currentPosition,
      employmentStartDate,
      yearlyIncome: yearlyIncome === "" ? NaN : Number(yearlyIncome),
      employerPhone: employerPhone || undefined,
      supervisorName: supervisorName || undefined,
      previousJobs: filledPreviousJobs,
    };

    const parsed = employmentDetailsSchema.safeParse(employmentDetails);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        if (!errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return { error: "Please fix the employment and income fields below." };
    }

    formData.set("desiredUnitId", selectedUnitId);
    formData.set("moveInDate", moveInDate);
    formData.set("rentTerm", rentTerm);
    formData.set("employmentDetails", JSON.stringify(parsed.data));
    return submitApplication(formData);
  }

  function errorFor(key: string) {
    return fieldErrors[key];
  }

  return (
    <ActionForm
      action={handleSubmit}
      successMessage="Application submitted! We'll be in touch soon."
    >
      <div>
        <label htmlFor="desiredUnitId" className={labelClass}>
          Preferred Unit *
        </label>
        <select
          id="desiredUnitId"
          value={selectedUnitId}
          onChange={(event) => {
            setSelectedUnitId(event.target.value);
            setMoveInDate("");
          }}
          className={fieldClass}
          required
        >
          <option value="">Select a unit</option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} — ${u.monthlyRent.toLocaleString()}/mo
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className={labelClass}>Desired Move-In Date *</p>
        {availabilityError ? (
          <p className="text-sm text-red-700 mb-2">{availabilityError}</p>
        ) : null}
        <MoveInCalendar
          unitId={selectedUnitId}
          units={availability}
          selectedDate={moveInDate}
          onSelect={setMoveInDate}
        />
        <input type="hidden" name="moveInDate" value={moveInDate} />
      </div>

      <RentTermPicker value={rentTerm} onChange={setRentTerm} />

      <fieldset className="border border-navy/10 p-5 space-y-5">
        <legend className="px-2 font-display text-lg text-navy">
          Current Employment
        </legend>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="currentEmployer" className={labelClass}>
              Employer *
            </label>
            <input
              id="currentEmployer"
              value={currentEmployer}
              onChange={(e) => setCurrentEmployer(e.target.value)}
              className={fieldClass}
              placeholder="Company or organization name"
            />
            {errorFor("currentEmployer") && (
              <p className="mt-1 text-xs text-red-700">
                {errorFor("currentEmployer")}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="currentPosition" className={labelClass}>
              Position / Title *
            </label>
            <input
              id="currentPosition"
              value={currentPosition}
              onChange={(e) => setCurrentPosition(e.target.value)}
              className={fieldClass}
              placeholder="Your job title"
            />
            {errorFor("currentPosition") && (
              <p className="mt-1 text-xs text-red-700">
                {errorFor("currentPosition")}
              </p>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="employmentStartDate" className={labelClass}>
              Start Date *
            </label>
            <input
              id="employmentStartDate"
              type="date"
              value={employmentStartDate}
              onChange={(e) => setEmploymentStartDate(e.target.value)}
              className={fieldClass}
            />
            {errorFor("employmentStartDate") && (
              <p className="mt-1 text-xs text-red-700">
                {errorFor("employmentStartDate")}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="yearlyIncome" className={labelClass}>
              Yearly Income (USD) *
            </label>
            <input
              id="yearlyIncome"
              type="number"
              min="0"
              step="1"
              value={yearlyIncome}
              onChange={(e) => setYearlyIncome(e.target.value)}
              className={fieldClass}
              placeholder="e.g. 45000"
            />
            {errorFor("yearlyIncome") && (
              <p className="mt-1 text-xs text-red-700">
                {errorFor("yearlyIncome")}
              </p>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <PhoneField
              id="employerPhone"
              label="Employer Phone"
              value={employerPhone}
              onChange={setEmployerPhone}
              inputClassName={fieldClass}
            />
            {errorFor("employerPhone") && (
              <p className="mt-1 text-xs text-red-700">
                {errorFor("employerPhone")}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="supervisorName" className={labelClass}>
              Supervisor Name
            </label>
            <input
              id="supervisorName"
              value={supervisorName}
              onChange={(e) => setSupervisorName(e.target.value)}
              className={fieldClass}
              placeholder="Optional"
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="border border-navy/10 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-display text-lg text-navy">Previous Employment</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addPreviousJob}
          >
            <Plus size={16} aria-hidden className="mr-1 inline" />
            Add previous job
          </Button>
        </div>

        {previousJobs.length === 0 ? (
          <p className="text-sm text-navy/50">
            Add any previous jobs you would like us to review.
          </p>
        ) : (
          <div className="space-y-4">
            {previousJobs.map((job, index) => (
              <div
                key={index}
                className="border border-navy/10 p-4 space-y-4 bg-sage-light/30"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-navy">
                    Previous job {index + 1}
                  </p>
                  <button
                    type="button"
                    onClick={() => removePreviousJob(index)}
                    className="text-navy/50 hover:text-red-700 p-1"
                    aria-label={`Remove previous job ${index + 1}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Employer *</label>
                    <input
                      value={job.employer}
                      onChange={(e) =>
                        updatePreviousJob(index, "employer", e.target.value)
                      }
                      className={fieldClass}
                    />
                    {errorFor(`previousJobs.${index}.employer`) && (
                      <p className="mt-1 text-xs text-red-700">
                        {errorFor(`previousJobs.${index}.employer`)}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Position *</label>
                    <input
                      value={job.position}
                      onChange={(e) =>
                        updatePreviousJob(index, "position", e.target.value)
                      }
                      className={fieldClass}
                    />
                    {errorFor(`previousJobs.${index}.position`) && (
                      <p className="mt-1 text-xs text-red-700">
                        {errorFor(`previousJobs.${index}.position`)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Start date *</label>
                    <input
                      type="date"
                      value={job.startDate}
                      onChange={(e) =>
                        updatePreviousJob(index, "startDate", e.target.value)
                      }
                      className={fieldClass}
                    />
                    {errorFor(`previousJobs.${index}.startDate`) && (
                      <p className="mt-1 text-xs text-red-700">
                        {errorFor(`previousJobs.${index}.startDate`)}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>End date *</label>
                    <input
                      type="date"
                      value={job.endDate}
                      onChange={(e) =>
                        updatePreviousJob(index, "endDate", e.target.value)
                      }
                      className={fieldClass}
                    />
                    {errorFor(`previousJobs.${index}.endDate`) && (
                      <p className="mt-1 text-xs text-red-700">
                        {errorFor(`previousJobs.${index}.endDate`)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </fieldset>

      <div>
        <label htmlFor="additionalNotes" className={labelClass}>
          Additional Notes
        </label>
        <textarea
          id="additionalNotes"
          name="additionalNotes"
          rows={3}
          className={`${fieldClass} resize-y`}
          placeholder="Anything else we should know about your application"
        />
      </div>
    </ActionForm>
  );
}
