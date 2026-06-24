import { PortalCard, PortalPageHeader } from "@/components/portal/PortalCard";
import { site } from "@/lib/site-config";
import { getSiteContent } from "@/lib/settings/store";

export default async function ResidentCommunityPage() {
  const content = await getSiteContent();

  return (
    <div>
      <PortalPageHeader title="Community" subtitle="Amenities, hours, and neighborhood highlights." />
      <PortalCard title="Office Hours" className="mb-6">
        <ul className="space-y-2 text-sm text-navy/80">
          {content.hours.map((h) => (
            <li key={h.day} className="flex justify-between">
              <span>{h.day}</span>
              <span>
                {h.closed ? "Closed" : `${h.open} – ${h.close}`}
              </span>
            </li>
          ))}
        </ul>
      </PortalCard>
      <PortalCard title="Amenities">
        <ul className="grid sm:grid-cols-2 gap-3 text-sm text-navy/80">
          {site.amenities.map((a) => (
            <li key={a.title}>
              <strong className="text-navy">{a.title}</strong>
              <p className="text-navy/65">{a.description}</p>
            </li>
          ))}
        </ul>
      </PortalCard>
      <PortalCard title="Neighborhood" className="mt-6">
        <ul className="list-disc list-inside text-sm text-navy/80 space-y-1">
          {content.neighborhood.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </PortalCard>
    </div>
  );
}
