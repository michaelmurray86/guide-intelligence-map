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

      {/* Invisible click area */}
      <Layer
        id={`hit-${section.id}`}
        type="line"
        paint={{
          "line-color": "#000000",
          "line-width": 25,
          "line-opacity": 0,
        }}
      />


      {/* Visible section */}
      <Layer
        id={`line-${section.id}`}
        type="line"
        paint={{
          "line-color": section.color,
          "line-width": 10,
          "line-opacity": 0.5,
        }}
        layout={{
          "line-cap": "round",
          "line-join": "round",
        }}
      />

    </Source>
  );
}