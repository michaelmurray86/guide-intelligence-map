"use client";

import { Source, Layer } from "react-map-gl/maplibre";
import { GPXRoute } from "@/Types/GPXRoute";

type Props = {
  route: GPXRoute | null;
  idPrefix?: string;
  color?: string;
  showArrows?: boolean;
};

export default function GPXLayer({
  route,
  idPrefix = "gpx",
  color = "#2563eb",
  showArrows = true,
}: Props) {
  if (!route) return null;

  return (
    <Source
      id={`${idPrefix}-route`}
      type="geojson"
      data={route.geojson}
    >
      <Layer
        id={`${idPrefix}-line`}
        type="line"
        paint={{
          "line-color": color,
          "line-width": 4,
        }}
      />

      {showArrows && (
        <Layer
          id={`${idPrefix}-direction-arrows`}
          type="symbol"
          layout={{
            "symbol-placement": "line",
            "symbol-spacing": 100,
            "text-field": "➤",
            "text-size": 16,
            "text-keep-upright": false,
            "text-rotation-alignment": "map",
          }}
          paint={{
            "text-color": color,
            "text-halo-color": "#ffffff",
            "text-halo-width": 2,
          }}
        />
      )}
    </Source>
  );
}
