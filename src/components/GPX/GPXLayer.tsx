"use client";

import { Source, Layer } from "react-map-gl/maplibre";
import { GPXRoute } from "@/types/GPXRoute";


type Props = {
  route: GPXRoute | null;
};


export default function GPXLayer({
  route,
}: Props) {

  if (!route) return null;


  return (

    <Source
      id="gpx-route"
      type="geojson"
      data={route.geojson}
    >


      {/* Route line */}

      <Layer

        id="gpx-line"

        type="line"

        paint={{

          "line-color": "#2563eb",

          "line-width": 4,

        }}

      />



      {/* Direction arrows */}

      <Layer

        id="gpx-direction-arrows"

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

          "text-color": "#1d4ed8",

          "text-halo-color": "#ffffff",

          "text-halo-width": 2,

        }}

      />


    </Source>

  );

}