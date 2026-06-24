"use client";

import { ActionForm } from "@/components/portal/ActionForm";
import { MoveInCalendar } from "@/components/portal/MoveInCalendar";
import { RentTermPicker } from "@/components/portal/RentTermPicker";
import { Button } from "@/components/ui/Button";
import {
  proposeApplicationChanges,
  reviewApplication,
} from "@/lib/actions/portal";
import { formatRentTerm } from "@/lib/applications/effective";
import { isDateInBlockedMonth, type MonthKey } from "@/lib/availability/unit-availability";
import { useEffect, useState } from "react";

const fieldClass =
  "w-full border border-navy/20 px-3 py-2 text-sm bg-white focus:outline-none focus:border-gold";
const labelClass =
  "block text-xs uppercase tracking-widest text-navy/70 mb-2";

type UnitOption = {
  id: string;
  name: string;
  monthlyRent: number;
  status: string;
};

type ApplicationRecord = {
  id: string;
  status: string;
  reviewNotes: string | null;
  moveInDate: string | null;
  rentTerm: string;
  desiredUnitId: string | null;
  proposedUnitId: string | null;
  proposedMoveInDate: string | null;
  proposedRentTerm: string | null;
  proposedMonthlyRent: number | null;
  proposalStatus: string | null;
  proposalNotes: string | null;
  guestConfirmedAt: string | null;
};

type UnitAvailability = {
  id: string;
  name: string;
  blockedMonths: string[];
};

export function ApplicationReviewPanel({
  application,
  units,
}: {
  application: ApplicationRecord;
  units: UnitOption[];
}) {
  const initialUnitId =
    application.proposedUnitId ?? application.desiredUnitId ?? "";
  const initialMoveIn =
    application.proposedMoveInDate ?? application.moveInDate ?? "";
  const initialRent =
    application.proposedMonthlyRent ??
    units.find((unit) => unit.id === initialUnitId)?.monthlyRent ??
    0;

  const [proposedUnitId, setProposedUnitId] = useState(initialUnitId);
  const [proposedMoveInDate, setProposedMoveInDate] = useState(initialMoveIn);
  const [proposedRentTerm, setProposedRentTerm] = useState<"MONTHLY" | "ANNUALLY">(
    "MONTHLY"
  );
  const [proposedMonthlyRent, setProposedMonthlyRent] = useState(
    String(initialRent || "")
  );
  const [proposalNotes, setProposalNotes] = useState(
    application.proposalNotes ?? ""
  );
  const [reviewNotes, setReviewNotes] = useState(application.reviewNotes ?? "");
  const [availability, setAvailability] = useState<UnitAvailability[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [proposalError, setProposalError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadAvailability() {
      setAvailabilityLoading(true);
      try {
        const res = await fetch(
          `/api/portal/unit-availability?excludeApplicationId=${application.id}`
        );
        const json = await res.json();
        if (!cancelled && res.ok) {
          setAvailability(json.units ?? []);
        }
      } catch {
        // Availability is helpful but not required for staff edits.
      } finally {
        if (!cancelled) {
          setAvailabilityLoading(false);
        }
      }
    }

    void loadAvailability();
    return () => {
      cancelled = true;
    };
  }, [application.id]);

  useEffect(() => {
    const unit = units.find((entry) => entry.id === proposedUnitId);
    if (unit && !application.proposedMonthlyRent) {
      setProposedMonthlyRent(String(unit.monthlyRent));
    }
  }, [proposedUnitId, units, application.proposedMonthlyRent]);

  async function handleProposal(formData: FormData) {
    setProposalError("");

    if (!proposedUnitId || !proposedMoveInDate) {
      return { error: "Unit and move-in date are required." };
    }

    const unitAvailability = availability.find((unit) => unit.id === proposedUnitId);
    const blockedMonths = new Set((unitAvailability?.blockedMonths ?? []) as MonthKey[]);
    if (
      isDateInBlockedMonth(
        new Date(`${proposedMoveInDate}T12:00:00`),
        blockedMonths
      )
    ) {
      return { error: "The selected move-in month is booked for that unit." };
    }

    formData.set("applicationId", application.id);
    formData.set("proposedUnitId", proposedUnitId);
    formData.set("proposedMoveInDate", proposedMoveInDate);
    formData.set("proposedRentTerm", proposedRentTerm);
    formData.set("proposedMonthlyRent", proposedMonthlyRent);
    formData.set("proposalNotes", proposalNotes);
    formData.set("reviewNotes", reviewNotes);
    return proposeApplicationChanges(formData);
  }

  const isApproved = application.status === "APPROVED";
  const canApprove =
    !isApproved && application.proposalStatus !== "PENDING";

  return (
    <div className="space-y-6 border-t border-navy/10 pt-4">
      {application.moveInDate && (
        <p className="text-sm text-navy/70">
          Guest requested move-in:{" "}
          {new Date(application.moveInDate).toLocaleDateString()} ·{" "}
          {formatRentTerm(application.rentTerm)}
        </p>
      )}

      {application.proposalStatus && (
        <p className="text-sm text-navy/80 bg-sage-light/50 border border-navy/10 p-3">
          Proposal status: {application.proposalStatus.replace(/_/g, " ")}
          {application.guestConfirmedAt
            ? ` · Guest confirmed ${new Date(application.guestConfirmedAt).toLocaleDateString()}`
            : ""}
        </p>
      )}

      {!isApproved && (
        <ActionForm
          action={handleProposal}
          successMessage="Lease terms sent to guest for confirmation."
          className="space-y-4"
        >
          <div>
            <label htmlFor={`unit-${application.id}`} className={labelClass}>
              Unit
            </label>
            <select
              id={`unit-${application.id}`}
              value={proposedUnitId}
              onChange={(event) => {
                setProposedUnitId(event.target.value);
                setProposedMoveInDate("");
              }}
              className={fieldClass}
            >
              <option value="">Select unit</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name} — ${unit.monthlyRent.toLocaleString()}/mo (
                  {unit.status.toLowerCase()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className={labelClass}>Move-In Date</p>
            {availabilityLoading ? (
              <p className="text-sm text-navy/60 animate-pulse" aria-live="polite">
                Loading availability calendar…
              </p>
            ) : (
              <MoveInCalendar
                unitId={proposedUnitId}
                units={availability}
                selectedDate={proposedMoveInDate}
                onSelect={setProposedMoveInDate}
              />
            )}
          </div>

          <RentTermPicker
            value={proposedRentTerm}
            onChange={setProposedRentTerm}
            name="proposedRentTerm"
          />

          <div>
            <label htmlFor={`rent-${application.id}`} className={labelClass}>
              Monthly Rent (USD)
            </label>
            <input
              id={`rent-${application.id}`}
              type="number"
              min="0"
              step="1"
              value={proposedMonthlyRent}
              onChange={(event) => setProposedMonthlyRent(event.target.value)}
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor={`proposal-notes-${application.id}`} className={labelClass}>
              Message to Guest
            </label>
            <textarea
              id={`proposal-notes-${application.id}`}
              rows={2}
              value={proposalNotes}
              onChange={(event) => setProposalNotes(event.target.value)}
              placeholder="Optional note explaining the proposed lease terms"
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor={`review-notes-${application.id}`} className={labelClass}>
              Internal / Guest Review Notes
            </label>
            <textarea
              id={`review-notes-${application.id}`}
              rows={2}
              value={reviewNotes}
              onChange={(event) => setReviewNotes(event.target.value)}
              placeholder="Visible to guest on their application"
              className={fieldClass}
            />
          </div>

          {proposalError && (
            <p className="text-sm text-red-700">{proposalError}</p>
          )}

          <Button type="submit" variant="outline">
            Send to Guest for Confirmation
          </Button>
        </ActionForm>
      )}

      <ActionForm
        action={reviewApplication}
        successMessage="Application updated."
        className="space-y-2"
      >
        <input type="hidden" name="id" value={application.id} />
        <select
          name="status"
          defaultValue={application.status}
          disabled={isApproved}
          className={fieldClass}
        >
          <option value="SUBMITTED">Submitted</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="APPROVED" disabled={!canApprove}>
            Approved
          </option>
          <option value="DENIED">Denied</option>
        </select>
        {!canApprove && !isApproved && (
          <p className="text-xs text-navy/60">
            Approval is available after the guest confirms proposed lease terms,
            or if no proposal is pending.
          </p>
        )}
        <textarea
          name="reviewNotes"
          rows={2}
          defaultValue={application.reviewNotes ?? ""}
          placeholder="Review notes (visible to guest)…"
          className={fieldClass}
          disabled={isApproved}
        />
        {!isApproved && (
          <Button type="submit">Update Application Status</Button>
        )}
      </ActionForm>
    </div>
  );
}
