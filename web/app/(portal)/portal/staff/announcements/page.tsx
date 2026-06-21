import { ActionForm } from "@/components/portal/ActionForm";
import { PortalCard, PortalPageHeader } from "@/components/portal/PortalCard";
import { createAnnouncement } from "@/lib/actions/portal";
import { db } from "@/lib/db";

export default async function StaffAnnouncementsPage() {
  const [announcements, units] = await Promise.all([
    db.announcement.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        author: { select: { firstName: true, lastName: true } },
        unit: true,
      },
    }),
    db.unit.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <PortalPageHeader title="Announcements" subtitle="Post updates for residents." />
      <PortalCard title="New Announcement" className="mb-8">
        <ActionForm action={createAnnouncement} successMessage="Announcement posted." className="space-y-3">
          <input name="title" required placeholder="Title" className="w-full border border-navy/20 px-4 py-3 bg-white" />
          <textarea name="body" rows={4} required placeholder="Message…" className="w-full border border-navy/20 px-4 py-3 bg-white resize-y" />
          <select name="unitId" className="w-full border border-navy/20 px-4 py-3 bg-white">
            <option value="">All residents</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>{u.name} only</option>
            ))}
          </select>
        </ActionForm>
      </PortalCard>
      <PortalCard title="Recent Announcements">
        <ul className="space-y-4">
          {announcements.map((a) => (
            <li key={a.id} className="border-b border-navy/10 pb-4">
              <p className="font-medium text-navy">{a.title}</p>
              <p className="text-xs text-navy/50 mb-2">
                {a.author.firstName} {a.author.lastName} · {a.createdAt.toLocaleDateString()}
                {a.unit ? ` · ${a.unit.name}` : " · All residents"}
              </p>
              <p className="text-sm text-navy/80 whitespace-pre-wrap">{a.body}</p>
            </li>
          ))}
        </ul>
      </PortalCard>
    </div>
  );
}
