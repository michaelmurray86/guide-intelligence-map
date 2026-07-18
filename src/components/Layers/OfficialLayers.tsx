"use client";

import { Source, Layer } from "react-map-gl/maplibre";
import { OfficialLayerFilters } from "@/types/OfficialLayerFilters";
import { officialSwissTopoLayers } from "@/data/officialSwissTopoLayers";

type Props = {
  layers: OfficialLayerFilters;
};

export default function OfficialLayers({
  layers,
}: Props) {

  return (
    <>
      {layers.hikingTrails && (
        <Source
          id="swisstopo-hiking-trails"
          type="raster"
          tiles={officialSwissTopoLayers.hikingTrails.tiles}
          tileSize={256}
        >
          <Layer
            id="swisstopo-hiking-trails-layer"
            type="raster"
          />
        </Source>
      )}

      {layers.closures && (
        <Source
          id="swisstopo-closures"
          type="raster"
          tiles={officialSwissTopoLayers.closures.tiles}
          tileSize={256}
        >
          <Layer
            id="swisstopo-closures-layer"
            type="raster"
            paint={{
                "raster-opacity": 0.75,
            }}
          />
        </Source>
      )}

      {layers.guardianDogs && (
        <Source
          id="swisstopo-guardian-dogs"
          type="raster"
          tiles={officialSwissTopoLayers.guardianDogs.tiles}
          tileSize={256}
        >
          <Layer
            id="swisstopo-guardian-dogs-layer"
            type="raster"
            paint={{
                "raster-opacity": 0.4,
            }}
          />
        </Source>
      )}

      {layers.shootingRanges && (
        <Source
          id="swisstopo-shooting-ranges"
          type="raster"
          tiles={officialSwissTopoLayers.shootingRanges.tiles}
          tileSize={256}
        >
          <Layer
            id="swisstopo-shooting-ranges-layer"
            type="raster"
            paint={{
                "raster-opacity": 0.4,
            }}
          />
        </Source>
      )}
    </>
  );
}