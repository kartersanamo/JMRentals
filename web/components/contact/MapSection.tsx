"use client";

import { getDirectionsUrl } from "@/lib/site-config";
import { MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

const MapSectionMap = dynamic(
  () => import("./MapSectionMap").then((mod) => mod.MapSectionMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full min-h-[320px] bg-sage-light flex items-center justify-center">
        <p className="text-sm text-navy/60">Loading map…</p>
      </div>
    ),
  }
);

export function MapSection() {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (!token) {
    return (
      <div className="h-full min-h-[320px] bg-sage-light flex flex-col items-center justify-center p-8 text-center border border-navy/10">
        <MapPin className="h-10 w-10 text-gold mb-4" aria-hidden />
        <p className="font-display text-xl text-navy mb-2">Map Preview</p>
        <p className="text-sm text-navy/60 mb-4 max-w-sm">
          Add <code className="text-xs bg-navy/5 px-1">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code> to
          your environment to enable the interactive map.
        </p>
        <Link
          href={getDirectionsUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm uppercase tracking-widest text-gold hover:text-navy transition-colors"
        >
          Get Directions
        </Link>
      </div>
    );
  }

  return <MapSectionMap token={token} />;
}
