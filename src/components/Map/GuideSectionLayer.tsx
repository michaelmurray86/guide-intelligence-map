"use client";

import { Source, Layer } from "react-map-gl/maplibre";
import { GuideSection } from "@/types/GuideSection";

type Props = {
  section: GuideSection;
};

export default function GuideSectionLayer({
  section,
}: Props) {

  const data = {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: section.coordinates,
    },
    properties: {},
  };

  return (
    <Source
      id={`section-${section.id}`}
      type="geojson"
      data={data as any}
    >
      <Layer
        id={`line-${section.id}`}
        type="line"
        paint={{
          "line-color": "#f97316",
          "line-width": 6,
          "line-opacity": 0.9,
        }}
        layout={{
          "line-cap": "round",
          "line-join": "round",
        }}
      />
    </Source>
  );
}