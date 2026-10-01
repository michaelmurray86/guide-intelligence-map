"use client";

import { useState } from "react";

import Sidebar from "../Sidebar/Sidebar";
import SwissMap from "../Map/SwissMap";

import { GuideFilters } from "@/Types/GuideFilters";
import { OfficialLayerFilters } from "@/Types/OfficialLayerFilters";
import { GPXRoute } from "@/Types/GPXRoute";
import { GuideSection } from "@/Types/GuideSection";
import { useGuideSections } from "@/hooks/useGuideSections";
import { useRouteLibrary } from "@/hooks/useRouteLibrary";

export default function AppLayout() {
  const [filters, setFilters] = useState<GuideFilters>({
    water: true,
    cattle: true,
    guardian_dog: true,
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

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [gpxRoute, setGpxRoute] = useState<GPXRoute | null>(null);
  const [routeSectionDraft, setRouteSectionDraft] =
    useState<GPXRoute | null>(null);
  const [focusedRouteSectionId, setFocusedRouteSectionId] =
    useState<number | null>(null);

  const { sections, setSections } = useGuideSections();
  const { routes: routeLibrary, setRoutes: setRouteLibrary } = useRouteLibrary();

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
      <div
        className={`hidden md:block shrink-0 overflow-hidden transition-[width] duration-500 ease-in-out ${
          sidebarCollapsed ? "w-12" : "w-80"
        }`}
      >
        <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed(current => !current)}
        filters={filters}
        setFilters={setFilters}
        officialLayers={officialLayers}
        setOfficialLayers={setOfficialLayers}
        gpxRoute={gpxRoute}
        setGpxRoute={setGpxRoute}
        routeSectionDraft={routeSectionDraft}
        setRouteSectionDraft={setRouteSectionDraft}
        guideSections={sections}
        routeLibrary={routeLibrary}
        setRouteLibrary={setRouteLibrary}
        onRouteSectionCreated={(section) => {
          if (!section) return;
          setSections(current => [...current, section]);
        }}
        onRouteSectionUpdated={updateSection}
        onRouteSectionDeleted={removeSection}
        onRouteSectionFocus={setFocusedRouteSectionId}
        />
      </div>

      <main className="min-w-0 flex-1">
        <SwissMap
          filters={filters}
          setFilters={setFilters}
          officialLayers={officialLayers}
          setOfficialLayers={setOfficialLayers}
          gpxRoute={gpxRoute}
          setGpxRoute={setGpxRoute}
          routeLibrary={routeLibrary}
          guideSections={sections}
          routeSectionDraft={routeSectionDraft}
          focusedRouteSectionId={focusedRouteSectionId}
          onRouteSectionUpdated={updateSection}
          onRouteSectionDeleted={removeSection}
        />
      </main>
    </div>
  );
}
