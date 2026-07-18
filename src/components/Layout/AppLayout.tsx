"use client";

import { useState } from "react";
import Sidebar from "../Sidebar/Sidebar";
import SwissMap from "../map/SwissMap";
import { GuideFilters } from "@/types/GuideFilters";
import { OfficialLayerFilters } from "@/types/OfficialLayerFilters";

export default function AppLayout() {

  const [filters, setFilters] = useState<GuideFilters>({
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
  });

  return (
    <div className="flex h-screen">

      <Sidebar
        filters={filters}
        setFilters={setFilters}
        officialLayers={officialLayers}
        setOfficialLayers={setOfficialLayers}
      />

      <main className="flex-1">
        <SwissMap
          filters={filters}
          officialLayers={officialLayers}
        />
      </main>

    </div>
  );
}