"use client";

import {
  useState
} from "react";

import Sidebar from "../Sidebar/Sidebar";
import SwissMap from "../Map/SwissMap";

import {
  GuideFilters
} from "@/Types/GuideFilters";

import {
  OfficialLayerFilters
} from "@/Types/OfficialLayerFilters";

import {
  GPXRoute
} from "@/Types/GPXRoute";


export default function AppLayout() {

   const [filters, setFilters] =
    useState<GuideFilters>({

      water: true,
      hazard: true,
      hut: true,
      cafe: true,
      toilet: true,
      snow: true,
      information: true,
      sections: true,

    });



  const [officialLayers, setOfficialLayers] =
    useState<OfficialLayerFilters>({

      hikingTrails: false,
      closures: false,
      guardianDogs: false,
      shootingRanges: false,
      transportStops: false,

    });



  const [gpxRoute, setGpxRoute] =
    useState<GPXRoute | null>(null);

  return (

    <div className="flex h-screen">

      <Sidebar

        filters={filters}

        setFilters={setFilters}

        officialLayers={officialLayers}

        setOfficialLayers={setOfficialLayers}

        gpxRoute={gpxRoute}

        setGpxRoute={setGpxRoute}

      />



      <main className="flex-1">

        <SwissMap

          filters={filters}

          officialLayers={officialLayers}

          gpxRoute={gpxRoute}

          setGpxRoute={setGpxRoute}

        />

      </main>


    </div>

  );

}