"use client";

import Map, { NavigationControl } from "react-map-gl/maplibre";

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
      style={{ width: "100vw", height: "100vh" }}
    >
      <NavigationControl position="top-right" />
    </Map>
  );
}