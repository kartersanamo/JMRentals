import { ActionForm } from "@/components/portal/ActionForm";
import { PortalCard, PortalPageHeader } from "@/components/portal/PortalCard";
import { changePassword, updateProfile } from "@/lib/actions/portal";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { residentProfile: true },
  });
  if (!user) redirect("/login");

  return (
    <div>
      <PortalPageHeader title="My Account" />
      {session.user.mustChangePassword && (
        <div className="mb-6 bg-gold/20 border border-gold/40 p-4 text-sm text-navy">
          Please change your temporary password below.
        </div>
      )}
      <PortalCard title="Profile" className="mb-8">
        <ActionForm action={updateProfile} successMessage="Profile updated." className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <input name="firstName" defaultValue={user.firstName} required className="border border-navy/20 px-4 py-3 bg-white" />
            <input name="lastName" defaultValue={user.lastName} required className="border border-navy/20 px-4 py-3 bg-white" />
          </div>
          <input name="phone" defaultValue={user.phone ?? ""} placeholder="Phone" className="w-full border border-navy/20 px-4 py-3 bg-white" />
          {user.role === "RESIDENT" && (
            <>
              <input name="emergencyName" defaultValue={user.residentProfile?.emergencyName ?? ""} placeholder="Emergency contact name" className="w-full border border-navy/20 px-4 py-3 bg-white" />
              <input name="emergencyPhone" defaultValue={user.residentProfile?.emergencyPhone ?? ""} placeholder="Emergency contact phone" className="w-full border border-navy/20 px-4 py-3 bg-white" />
              <textarea name="vehicles" rows={2} defaultValue={user.residentProfile?.vehicles ?? ""} placeholder="Vehicles" className="w-full border border-navy/20 px-4 py-3 bg-white resize-y" />
            </>
          )}
        </ActionForm>
      </PortalCard>
      <PortalCard title={session.user.mustChangePassword ? "Set New Password" : "Change Password"}>
        {session.user.mustChangePassword ? (
          <p className="text-sm text-navy/60 mb-4">
            You&apos;re using a temporary password. Choose a new password below — no need to enter the temporary one again.
          </p>
        ) : null}
        <ActionForm
          action={changePassword}
          successMessage="Password updated."
          submitLabel={session.user.mustChangePassword ? "Set new password" : "Update password"}
          className="space-y-4"
        >
          {!session.user.mustChangePassword && (
            <input
              type="password"
              name="currentPassword"
              required
              placeholder="Current password"
              autoComplete="current-password"
              className="w-full border border-navy/20 px-4 py-3 bg-white"
            />
          )}
          <input
            type="password"
            name="newPassword"
            required
            placeholder="New password"
            autoComplete="new-password"
            className="w-full border border-navy/20 px-4 py-3 bg-white"
          />
          <input
            type="password"
            name="confirmPassword"
            required
            placeholder="Confirm new password"
            autoComplete="new-password"
            className="w-full border border-navy/20 px-4 py-3 bg-white"
          />
        </ActionForm>
      </PortalCard>
      <p className="mt-6 text-sm text-navy/50">Signed in as {user.email} ({user.role})</p>
    </div>
  );
}
