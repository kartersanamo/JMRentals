"use client";

import { ActionForm } from "@/components/portal/ActionForm";
import { createUserAccount } from "@/lib/actions/portal";

export function CreateUserForm({ role }: { role: "ADMIN" | "STAFF" }) {
  return (
    <ActionForm action={createUserAccount} successMessage={`${role} account created.`} className="grid sm:grid-cols-2 gap-4">
      <input type="hidden" name="role" value={role} />
      <input name="firstName" required placeholder="First name" className="border border-navy/20 px-4 py-3 bg-white" />
      <input name="lastName" required placeholder="Last name" className="border border-navy/20 px-4 py-3 bg-white" />
      <input name="email" type="email" required placeholder="Email" className="border border-navy/20 px-4 py-3 bg-white sm:col-span-2" />
      <input name="phone" placeholder="Phone (optional)" className="border border-navy/20 px-4 py-3 bg-white sm:col-span-2" />
      <input name="password" type="password" required placeholder="Temporary password" className="border border-navy/20 px-4 py-3 bg-white sm:col-span-2" />
    </ActionForm>
  );
}
