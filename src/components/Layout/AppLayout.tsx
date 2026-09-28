"use client";

import { useState } from "react";

import Sidebar from "../Sidebar/Sidebar";
import SwissMap from "../Map/SwissMap";

import { GuideFilters } from "@/Types/GuideFilters";
import { OfficialLayerFilters } from "@/Types/OfficialLayerFilters";
import { GPXRoute } from "@/Types/GPXRoute";
import { GuideSection } from "@/Types/GuideSection";
import { useGuideSections } from "@/hooks/useGuideSections";

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
      transportStops: false,
      slopeAngle: false,
    });

  const [gpxRoute, setGpxRoute] = useState<GPXRoute | null>(null);
  const [routeSectionDraft, setRouteSectionDraft] =
    useState<GPXRoute | null>(null);

  const { sections, setSections } = useGuideSections();

  const updateSection = (updated: GuideSection | null) => {
    if (!updated) return;
    setSections(current =>
      current.map(section =>
        section.id === updated.id ? updated : section
      )
    );
  };

  const removeSection = (id: number) => {
    setSections(current =>
      current.filter(section => section.id !== id)
    );
  };

  return (
    <div className="flex h-screen">
      <Sidebar
        filters={filters}
        setFilters={setFilters}
        officialLayers={officialLayers}
        setOfficialLayers={setOfficialLayers}
        gpxRoute={gpxRoute}
        setGpxRoute={setGpxRoute}
        routeSectionDraft={routeSectionDraft}
        setRouteSectionDraft={setRouteSectionDraft}
        guideSections={sections}
        onRouteSectionCreated={(section) => {
          if (!section) return;
          setSections(current => [...current, section]);
        }}
        onRouteSectionUpdated={updateSection}
        onRouteSectionDeleted={removeSection}
      />

      <main className="flex-1">
        <SwissMap
          filters={filters}
          officialLayers={officialLayers}
          gpxRoute={gpxRoute}
          setGpxRoute={setGpxRoute}
          guideSections={sections}
          routeSectionDraft={routeSectionDraft}
        />
      </main>
    </div>
  );
}
