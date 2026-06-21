import {
  EmptyState,
  PortalCard,
  PortalPageHeader,
  StatusBadge,
} from "@/components/portal/PortalCard";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function GuestDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "GUEST") redirect("/portal");

  const [applications, units] = await Promise.all([
    db.application.findMany({
      where: { guestId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { desiredUnit: true },
    }),
    db.unit.count({ where: { status: "AVAILABLE" } }),
  ]);

  return (
    <div>
      <PortalPageHeader
        title={`Welcome, ${session.user.name?.split(" ")[0] ?? "Guest"}`}
        subtitle="Explore our bayou-side homes and submit your rental application."
      />
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <PortalCard title="Available Units">
          <p className="text-3xl font-display text-navy">{units}</p>
          <Link href="/portal/guest/units" className="text-sm text-gold hover:text-navy mt-2 inline-block">
            Browse units →
          </Link>
        </PortalCard>
        <PortalCard title="Applications">
          <p className="text-3xl font-display text-navy">{applications.length}</p>
          <Link href="/portal/guest/applications" className="text-sm text-gold hover:text-navy mt-2 inline-block">
            View status →
          </Link>
        </PortalCard>
        <PortalCard title="Get Started">
          <Link
            href="/portal/guest/apply"
            className="inline-block mt-2 bg-gold text-navy px-4 py-2 text-sm uppercase tracking-wider hover:bg-gold-light"
          >
            Apply Now
          </Link>
        </PortalCard>
      </div>
      <PortalCard title="Recent Applications">
        {applications.length === 0 ? (
          <EmptyState message="No applications yet. Browse units and apply when you're ready." />
        ) : (
          <ul className="divide-y divide-navy/10">
            {applications.map((app) => (
              <li key={app.id} className="py-3 flex justify-between items-center gap-4">
                <div>
                  <p className="font-medium text-navy">
                    {app.desiredUnit?.name ?? "General application"}
                  </p>
                  <p className="text-xs text-navy/50">
                    {app.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={app.status} />
              </li>
            ))}
          </ul>
        )}
      </PortalCard>
    </div>
  );
}
