"use client";

import Map, { NavigationControl } from "react-map-gl/maplibre";
import { Marker } from "react-map-gl/maplibre";
import { guideNotes } from "@/data/guideNotes";
import { markerColours } from "./markerColours";

const mapStyle = {
  version: 8,
  sources: {
    swissTopo: {
      type: "raster",
      tiles: [
        "https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg"
      ],
      tileSize: 256,
      attribution: "© swisstopo",
    },
  },
  layers: [
    {
      id: "swisstopo",
      type: "raster",
      source: "swissTopo",
    },
  ],
};

export default function SwissMap() {
  return (
    <Map
      initialViewState={{
        longitude: 7.092,
        latitude: 46.248,
        zoom: 12,
      }}
      mapStyle={mapStyle as any}
      style={{ width: "100%", height: "100%" }}
    >
      <NavigationControl position="top-right" />
      {guideNotes.map((note) => (
  <Marker
    key={note.id}
    longitude={note.longitude}
    latitude={note.latitude}
  >
    <div
      style={{
        width: 16,
        height: 16,
        borderRadius: "50%",
        background: markerColours[note.category],
        border: "2px solid white",
        cursor: "pointer",
      }}
      title={note.title}
    />
  </Marker>
))}
    </Map>
  );
}