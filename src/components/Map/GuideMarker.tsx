"use client";

import { Marker } from "react-map-gl/maplibre";
import { GuideNote } from "@/types/GuideNote";
import { markerColours } from "./markerColours";

type Props = {
  note: GuideNote;
};

export default function GuideMarker({ note }: Props) {
  return (
    <Marker
      longitude={note.longitude}
      latitude={note.latitude}
    >
      <div
        title={note.title}
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: markerColours[note.category],
          border: "2px solid white",
          cursor: "pointer",
          boxShadow: "0 0 4px rgba(0,0,0,0.4)",
        }}
      />
    </Marker>
  );
}