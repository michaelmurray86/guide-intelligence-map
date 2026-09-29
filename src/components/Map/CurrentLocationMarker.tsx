"use client";

import { Marker } from "react-map-gl/maplibre";

type Props = {
  latitude: number;
  longitude: number;
};

export default function CurrentLocationMarker({
  latitude,
  longitude,
}: Props) {
  return (
    <Marker
      longitude={longitude}
      latitude={latitude}
      anchor="center"
    >
      <div
        aria-label="Your current location"
        title="Your current location"
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "#2563eb",
          border: "3px solid white",
          boxShadow: "0 0 0 2px rgba(37, 99, 235, 0.35), 0 3px 10px rgba(0, 0, 0, 0.3)",
        }}
      />
    </Marker>
  );
}
