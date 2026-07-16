"use client";

import { useState } from "react";
import { GuideNote } from "@/types/GuideNote";
import GuideNotePanel from "../info/GuideNotePanel";
import Map, { NavigationControl } from "react-map-gl/maplibre";
import { Marker } from "react-map-gl/maplibre";
import { guideNotes } from "@/data/guideNotes";
import GuideMarker from "./GuideMarker";

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

const [selectedNote, setSelectedNote] =
  useState<GuideNote | null>(null);

  return (
    <>
      <Map
        initialViewState={{
          longitude: 7.092,
          latitude: 46.248,
          zoom: 12,
        }}
        mapStyle={mapStyle as any}
        style={{ width: "100%", height: "100%", position: "relative" }}
      >
        <NavigationControl position="top-right" />
        {guideNotes.map((note) => (
          <GuideMarker
            key={note.id}
            note={note}
            onClick={setSelectedNote}
          />
        ))}
      </Map>
      <GuideNotePanel
        note={selectedNote}
        onClose={() => setSelectedNote(null)}
      />
    </>
  );
}