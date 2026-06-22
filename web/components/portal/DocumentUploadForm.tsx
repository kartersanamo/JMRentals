"use client";

import { Button } from "@/components/ui/Button";
import { uploadDocument } from "@/lib/actions/billing";
import { useState } from "react";

export function DocumentUploadForm({
  residents,
  units,
  leases,
}: {
  residents: Array<{ id: string; label: string }>;
  units: Array<{ id: string; label: string }>;
  leases: Array<{ id: string; label: string }>;
}) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError("");
    setSuccess(false);
    setPending(true);
    const result = await uploadDocument(formData);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <input
        name="title"
        required
        placeholder="Document title"
        className="w-full border border-navy/20 px-4 py-3 bg-white text-navy"
      />
      <select
        name="category"
        required
        defaultValue="OTHER"
        className="w-full border border-navy/20 px-4 py-3 bg-white text-navy"
      >
        <option value="LEASE">Lease</option>
        <option value="ADDENDUM">Addendum</option>
        <option value="RULES">House Rules</option>
        <option value="RECEIPT">Receipt</option>
        <option value="OTHER">Other</option>
      </select>
      <select name="residentId" className="w-full border border-navy/20 px-4 py-3 bg-white text-navy">
        <option value="">All residents (optional)</option>
        {residents.map((resident) => (
          <option key={resident.id} value={resident.id}>
            {resident.label}
          </option>
        ))}
      </select>
      <select name="unitId" className="w-full border border-navy/20 px-4 py-3 bg-white text-navy">
        <option value="">All units (optional)</option>
        {units.map((unit) => (
          <option key={unit.id} value={unit.id}>
            {unit.label}
          </option>
        ))}
      </select>
      <select name="leaseId" className="w-full border border-navy/20 px-4 py-3 bg-white text-navy">
        <option value="">Link to lease (optional)</option>
        {leases.map((lease) => (
          <option key={lease.id} value={lease.id}>
            {lease.label}
          </option>
        ))}
      </select>
      <label className="flex items-center gap-2 text-sm text-navy">
        <input type="checkbox" name="isGlobal" className="h-4 w-4 accent-gold" />
        Visible to all residents
      </label>
      <input
        type="file"
        name="file"
        required
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,application/pdf"
        className="w-full border border-navy/20 px-4 py-3 bg-white text-navy"
      />
      {error && <p className="text-sm text-red-700 bg-red-50 p-3">{error}</p>}
      {success && (
        <p className="text-sm text-green-800 bg-green-50 p-3">Document uploaded.</p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Uploading…" : "Upload Document"}
      </Button>
    </form>
  );
}
