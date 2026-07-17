"use client";

import { Marker } from "react-map-gl/maplibre";
import { GuideNote } from "@/types/GuideNote";
import { markerIcons } from "./markerIcons";

type Props = {
  note: GuideNote;
  onClick: (note: GuideNote) => void;
};

export default function GuideMarker({
  note,
  onClick,
}: Props) {
  return (
    <Marker
      longitude={note.longitude}
      latitude={note.latitude}
    >
      <div
  onClick={() => onClick(note)}
  title={note.title}
  style={{
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "white",
    border: "3px solid white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
    transition: "all 0.15s ease",
  }}
  onMouseEnter={(e) =>
    (e.currentTarget.style.transform = "scale(1.2)")
  }
  onMouseLeave={(e) =>
    (e.currentTarget.style.transform = "scale(1)")
  }
>
  {markerIcons[note.category]}
</div>
    </Marker>
  );
}