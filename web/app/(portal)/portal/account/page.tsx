import { ChangePasswordForm } from "@/components/portal/ChangePasswordForm";
import { ProfileForm } from "@/components/portal/ProfileForm";
import { PortalCard, PortalPageHeader } from "@/components/portal/PortalCard";
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
        <ProfileForm
          isResident={user.role === "RESIDENT"}
          initial={{
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone ?? "",
            emergencyName: user.residentProfile?.emergencyName ?? "",
            emergencyPhone: user.residentProfile?.emergencyPhone ?? "",
            vehicles: user.residentProfile?.vehicles ?? "",
          }}
        />
      </PortalCard>
      <PortalCard title={session.user.mustChangePassword ? "Set New Password" : "Change Password"}>
        {session.user.mustChangePassword ? (
          <p className="text-sm text-navy/60 mb-4">
            You&apos;re using a temporary password. Choose a new password below — no need to enter the temporary one again.
          </p>
        ) : null}
        <ChangePasswordForm mustChangePassword={session.user.mustChangePassword} />
      </PortalCard>
      <p className="mt-6 text-sm text-navy/50">Signed in as {user.email} ({user.role})</p>
      <p className="mt-2 text-sm">
        <a href="/portal/notifications" className="text-gold hover:text-navy">
          Manage email notifications →
        </a>
      </p>
    </div>
  );
}
