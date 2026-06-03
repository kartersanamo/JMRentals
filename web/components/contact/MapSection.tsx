"use client";

import { site, getDirectionsUrl, getMapboxStyle } from "@/lib/site-config";
import { MapPin } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl/mapbox";

export function MapSection() {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const { lng, lat } = site.coordinates;

  const initialViewState = useMemo(
    () => ({
      longitude: lng,
      latitude: lat,
      zoom: 15,
    }),
    [lng, lat]
  );

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

  return (
    <div className="h-full min-h-[320px] relative">
      <Map
        mapboxAccessToken={token}
        initialViewState={initialViewState}
        mapStyle={getMapboxStyle()}
        style={{ width: "100%", height: "100%", minHeight: 320 }}
        attributionControl
        reuseMaps
      >
        <NavigationControl position="top-right" />
        <Marker longitude={lng} latitude={lat} anchor="bottom">
          <div className="flex flex-col items-center">
            <div className="bg-gold text-navy px-3 py-1.5 text-xs font-bold uppercase tracking-wider shadow-lg">
              {site.name}
            </div>
            <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gold" />
          </div>
        </Marker>
      </Map>
      <Link
        href={getDirectionsUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-4 left-4 bg-navy text-cream text-xs uppercase tracking-widest px-4 py-2 hover:bg-gold hover:text-navy transition-colors shadow-md z-10"
      >
        Get Directions
      </Link>
    </div>
  );
}
