"use client";

import { Button } from "@/components/ui/Button";
import { EmailField } from "@/components/ui/EmailField";
import { PhoneField } from "@/components/ui/PhoneField";
import { updateProfile } from "@/lib/actions/portal";
import { profileSchema } from "@/lib/validators/portal";
import { useState } from "react";

type ProfileFormProps = {
  initial: {
    firstName: string;
    lastName: string;
    phone: string;
    emergencyName: string;
    emergencyPhone: string;
    vehicles: string;
  };
  isResident: boolean;
};

export function ProfileForm({ initial, isResident }: ProfileFormProps) {
  const [firstName, setFirstName] = useState(initial.firstName);
  const [lastName, setLastName] = useState(initial.lastName);
  const [phone, setPhone] = useState(initial.phone);
  const [emergencyName, setEmergencyName] = useState(initial.emergencyName);
  const [emergencyPhone, setEmergencyPhone] = useState(initial.emergencyPhone);
  const [vehicles, setVehicles] = useState(initial.vehicles);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess(false);

    const parsed = profileSchema.safeParse({
      firstName,
      lastName,
      phone: phone || undefined,
      emergencyName: emergencyName || undefined,
      emergencyPhone: emergencyPhone || undefined,
      vehicles: vehicles || undefined,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid profile data.");
      return;
    }

    setPending(true);
    const formData = new FormData();
    formData.set("firstName", parsed.data.firstName);
    formData.set("lastName", parsed.data.lastName);
    if (parsed.data.phone) formData.set("phone", parsed.data.phone);
    if (parsed.data.emergencyName) formData.set("emergencyName", parsed.data.emergencyName);
    if (parsed.data.emergencyPhone) formData.set("emergencyPhone", parsed.data.emergencyPhone);
    if (parsed.data.vehicles) formData.set("vehicles", parsed.data.vehicles);

    const result = await updateProfile(formData);
    setPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess(true);
  }

  const fieldClass = "w-full border border-navy/20 px-4 py-3 bg-white";

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid sm:grid-cols-2 gap-4">
        <input
          name="firstName"
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          required
          className={fieldClass}
        />
        <input
          name="lastName"
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
          required
          className={fieldClass}
        />
      </div>

      <PhoneField value={phone} onChange={setPhone} inputClassName={fieldClass} />

      {isResident && (
        <>
          <input
            name="emergencyName"
            value={emergencyName}
            onChange={(event) => setEmergencyName(event.target.value)}
            placeholder="Emergency contact name"
            className={fieldClass}
          />
          <PhoneField
            id="emergencyPhone"
            name="emergencyPhone"
            label="Emergency contact phone"
            value={emergencyPhone}
            onChange={setEmergencyPhone}
            inputClassName={fieldClass}
          />
          <textarea
            name="vehicles"
            rows={2}
            value={vehicles}
            onChange={(event) => setVehicles(event.target.value)}
            placeholder="Vehicles"
            className={`${fieldClass} resize-y`}
          />
        </>
      )}

      {error && <p className="text-sm text-red-700 bg-red-50 p-3">{error}</p>}
      {success && (
        <p className="text-sm text-green-800 bg-green-50 p-3">Profile updated.</p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save Profile"}
      </Button>
    </form>
  );
}
