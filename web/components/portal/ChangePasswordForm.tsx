"use client";

import { Button } from "@/components/ui/Button";
import { PasswordFields } from "@/components/ui/PasswordFields";
import { changePassword } from "@/lib/actions/portal";
import {
  changePasswordSchema,
  forcedPasswordChangeSchema,
} from "@/lib/validators/portal";
import { useState } from "react";

export function ChangePasswordForm({
  mustChangePassword,
}: {
  mustChangePassword: boolean;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const schema = mustChangePassword
      ? forcedPasswordChangeSchema
      : changePasswordSchema;

    const parsed = schema.safeParse({
      ...(mustChangePassword ? {} : { currentPassword }),
      newPassword,
      confirmPassword,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid password data.");
      return;
    }

    setPending(true);
    const formData = new FormData();
    if (!mustChangePassword) {
      formData.set("currentPassword", currentPassword);
    }
    formData.set("newPassword", newPassword);
    formData.set("confirmPassword", confirmPassword);

    const result = await changePassword(formData);
    setPending(false);

    if (result.error) {
      setError(result.error);
    }
  }

  const fieldClass = "w-full border border-navy/20 px-4 py-3 bg-white";

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {!mustChangePassword && (
        <div>
          <label htmlFor="currentPassword" className="block text-xs uppercase tracking-widest text-navy/70 mb-2">
            Current password
          </label>
          <input
            id="currentPassword"
            type="password"
            name="currentPassword"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            autoComplete="current-password"
            className={fieldClass}
          />
        </div>
      )}

      <PasswordFields
        password={newPassword}
        confirmPassword={confirmPassword}
        onPasswordChange={setNewPassword}
        onConfirmPasswordChange={setConfirmPassword}
        passwordLabel="New password"
        confirmLabel="Confirm new password"
        passwordId="newPassword"
        confirmId="confirmPassword"
        inputClassName={fieldClass}
      />

      {error && <p className="text-sm text-red-700 bg-red-50 p-3">{error}</p>}

      <Button type="submit" disabled={pending}>
        {pending
          ? "Saving…"
          : mustChangePassword
            ? "Set new password"
            : "Update password"}
      </Button>
    </form>
  );
}
