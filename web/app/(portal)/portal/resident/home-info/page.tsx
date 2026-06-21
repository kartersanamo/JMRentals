import { PortalCard, PortalPageHeader } from "@/components/portal/PortalCard";
import { getHomeInfo } from "@/lib/portal-queries";

const labels: Record<string, string> = {
  utilities: "Utilities",
  trash: "Trash & Recycling",
  parking: "Parking",
  wifi: "Internet / Wi-Fi",
  emergency: "Emergency Contacts",
};

export default async function ResidentHomeInfoPage() {
  const info = await getHomeInfo();

  return (
    <div>
      <PortalPageHeader title="Home Info" subtitle="Everything you need for day-to-day living." />
      <div className="grid md:grid-cols-2 gap-6">
        {Object.entries(labels).map(([key, label]) => (
          <PortalCard key={key} title={label}>
            <p className="text-sm text-navy/80 whitespace-pre-wrap">
              {info[key] || "Contact the office for details."}
            </p>
          </PortalCard>
        ))}
      </div>
    </div>
  );
}
