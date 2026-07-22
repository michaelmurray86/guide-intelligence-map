"use client";

import { Source, Layer } from "react-map-gl/maplibre";
import { GuideSection } from "@/types/GuideSection";


type Props = {
  section: GuideSection;
  hovered: boolean;
};

export default function GuideSectionLayer({
  section,
  hovered,
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

      {/* Invisible interaction area */}
<Layer
  id={`hit-${section.id}`}
  type="line"
  paint={{
    "line-color": "#000000",
    "line-width": 25,
    "line-opacity": 0,
  }}
/>


{/* Glow underneath on hover */}
<Layer
  id={`glow-${section.id}`}
  type="line"
  paint={{
    "line-color": section.color,
    "line-width": hovered ? 22 : 10,
    "line-opacity": hovered ? 0.25 : 0,
  }}
  layout={{
    "line-cap": "round",
    "line-join": "round",
  }}
/>


{/* Glow effect */}
<Layer
  id={`glow-${section.id}`}
  type="line"
  paint={{
    "line-color": section.color,
    "line-width": hovered ? 22 : 10,
    "line-opacity": hovered ? 0.25 : 0,
  }}
  layout={{
    "line-cap": "round",
    "line-join": "round",
  }}
/>


{/* Visible section */}
<Layer
  id={`line-${section.id}`}
  type="line"
  paint={{
    "line-color": section.color,
    "line-width": hovered ? 14 : 10,
    "line-opacity": hovered ? 0.9 : 0.5,
  }}
  layout={{
    "line-cap": "round",
    "line-join": "round",
  }}
/>
    </Source>
  );
}