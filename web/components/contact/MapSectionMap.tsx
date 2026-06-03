"use client";

import { site, getDirectionsUrl, getMapboxStyle } from "@/lib/site-config";
import Link from "next/link";
import { useMemo } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl/mapbox";

interface MapSectionMapProps {
  token: string;
}

export function MapSectionMap({ token }: MapSectionMapProps) {
  const { lng, lat } = site.coordinates;
  const mapStyle = getMapboxStyle();

  const initialViewState = useMemo(
    () => ({
      longitude: lng,
      latitude: lat,
      zoom: 15,
    }),
    [lng, lat]
  );

  return (
    <div className="h-full min-h-[320px] relative">
      <Map
        mapboxAccessToken={token}
        initialViewState={initialViewState}
        mapStyle={mapStyle}
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
