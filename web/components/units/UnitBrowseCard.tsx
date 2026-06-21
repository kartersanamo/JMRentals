import { StatusBadge } from "@/components/portal/PortalCard";
import { getUnitImageAlt, getUnitImageUrl } from "@/lib/unit-images";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export type UnitBrowseCardProps = {
  name: string;
  beds: string;
  baths: string;
  description: string;
  imageUrl?: string | null;
  monthlyRent?: number;
  status?: string;
  actionHref?: string;
  actionLabel?: string;
  overlay?: ReactNode;
  className?: string;
};

export function UnitBrowseCard({
  name,
  beds,
  baths,
  description,
  imageUrl,
  monthlyRent,
  status,
  actionHref,
  actionLabel,
  overlay,
  className = "",
}: UnitBrowseCardProps) {
  const src = getUnitImageUrl(imageUrl, name);

  return (
    <article
      className={`relative bg-white border border-navy/10 overflow-hidden shadow-sm group ${className}`}
    >
      <div className="relative aspect-[4/3] bg-navy/5">
        <Image
          src={src}
          alt={getUnitImageAlt(name)}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {overlay}
      </div>
      <div className="p-5">
        <p className="text-xs uppercase tracking-widest text-gold mb-1">
          {beds} · {baths}
        </p>
        <h3 className="font-display text-2xl text-navy mb-2">{name}</h3>
        <p className="text-sm text-navy/70 mb-4 line-clamp-3">{description}</p>
        {monthlyRent !== undefined && (
          <p className="font-display text-2xl text-navy mb-3">
            ${monthlyRent.toLocaleString()}
            <span className="text-sm font-body text-navy/50">/mo</span>
          </p>
        )}
        {status && <StatusBadge status={status} />}
        {actionHref && actionLabel && (
          <Link
            href={actionHref}
            className="block mt-4 text-center bg-navy text-cream py-2 text-sm uppercase tracking-wider hover:bg-gold hover:text-navy transition-colors"
          >
            {actionLabel}
          </Link>
        )}
      </div>
    </article>
  );
}
