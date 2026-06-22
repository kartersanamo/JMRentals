"use client";

import { Button } from "@/components/ui/Button";
import { EmailField } from "@/components/ui/EmailField";
import { PasswordFields } from "@/components/ui/PasswordFields";
import { PhoneField } from "@/components/ui/PhoneField";
import { createUserAccount } from "@/lib/actions/portal";
import { createUserSchema } from "@/lib/validators/portal";
import { useState } from "react";

export function CreateUserForm({ role }: { role: "ADMIN" | "STAFF" }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess(false);

    const parsed = createUserSchema.safeParse({
      firstName,
      lastName,
      email,
      phone: phone || undefined,
      password,
      confirmPassword,
      role,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid account details.");
      return;
    }

    setPending(true);
    const formData = new FormData();
    formData.set("role", role);
    formData.set("firstName", parsed.data.firstName);
    formData.set("lastName", parsed.data.lastName);
    formData.set("email", parsed.data.email);
    if (parsed.data.phone) formData.set("phone", parsed.data.phone);
    formData.set("password", parsed.data.password);
    formData.set("confirmPassword", parsed.data.confirmPassword);

    const result = await createUserAccount(formData);
    setPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess(true);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setConfirmPassword("");
  }

  const fieldClass = "border border-navy/20 px-4 py-3 bg-white w-full";

  return (
    <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4" noValidate>
      <input
        name="firstName"
        required
        placeholder="First name"
        value={firstName}
        onChange={(event) => setFirstName(event.target.value)}
        className={fieldClass}
      />
      <input
        name="lastName"
        required
        placeholder="Last name"
        value={lastName}
        onChange={(event) => setLastName(event.target.value)}
        className={fieldClass}
      />

      <div className="sm:col-span-2">
        <EmailField
          value={email}
          onChange={setEmail}
          label="Email"
          required
          inputClassName={fieldClass}
        />
      </div>

      <div className="sm:col-span-2">
        <PhoneField
          value={phone}
          onChange={setPhone}
          inputClassName={fieldClass}
        />
      </div>

      <div className="sm:col-span-2">
        <PasswordFields
          password={password}
          confirmPassword={confirmPassword}
          onPasswordChange={setPassword}
          onConfirmPasswordChange={setConfirmPassword}
          passwordLabel="Temporary password"
          confirmLabel="Confirm temporary password"
          inputClassName={fieldClass}
        />
      </div>

      {error && (
        <p className="sm:col-span-2 text-sm text-red-700 bg-red-50 p-3">{error}</p>
      )}
      {success && (
        <p className="sm:col-span-2 text-sm text-green-800 bg-green-50 p-3">
          {role} account created.
        </p>
      )}

      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create Account"}
        </Button>
      </div>
    </form>
  );
}
