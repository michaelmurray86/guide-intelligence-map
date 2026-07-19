"use client";

import { Source, Layer } from "react-map-gl/maplibre";
import { GPXRoute } from "@/types/GPXRoute";

type Props = {
  route: GPXRoute | null;
};

export default function GPXLayer({
  route,
}: Props) {
  if (!route) return null;

  return (
    <Source
      id="gpx-route"
      type="geojson"
      data={route.geojson}
    >
      <Layer
        id="gpx-line"
        type="line"
        paint={{
          "line-color": "#2563eb",
          "line-width": 4,
        }}
      />
    </Source>
  );
}