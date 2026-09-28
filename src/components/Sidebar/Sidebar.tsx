"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

import Image from "next/image";

import { GuideFilters } from "@/Types/GuideFilters";
import { OfficialLayerFilters } from "@/Types/OfficialLayerFilters";
import { GPXRoute } from "@/Types/GPXRoute";
import { GuideSection } from "@/Types/GuideSection";

import GPXImportButton from "../GPX/GPXImportButton";
import RouteSectionEditor from "../Info/RouteSectionEditor";
import CollapsibleSection from "../UI/CollapsibleSection";
import ToggleSwitch from "../UI/ToggleSwitch";

import DataSources from "../UI/DataSources";
import DeletionRequestsPanel from "../Info/DeletionRequestsPanel";

type Props = {
  filters: GuideFilters;
  setFilters: React.Dispatch<React.SetStateAction<GuideFilters>>;
  officialLayers: OfficialLayerFilters;
  setOfficialLayers: React.Dispatch<React.SetStateAction<OfficialLayerFilters>>;
  gpxRoute: GPXRoute | null;
  setGpxRoute: React.Dispatch<React.SetStateAction<GPXRoute | null>>;
  routeSectionDraft: GPXRoute | null;
  setRouteSectionDraft: React.Dispatch<React.SetStateAction<GPXRoute | null>>;
  onRouteSectionCreated: (section: GuideSection | null) => void;
};

export default function Sidebar({
  filters,
  setFilters,
  officialLayers,
  setOfficialLayers,
  gpxRoute,
  setGpxRoute,
  routeSectionDraft,
  setRouteSectionDraft,
  onRouteSectionCreated,
}: Props) {
  const router = useRouter();

  const { logout } = useAuth();
  const { profile } = useProfile();

  const [addingRouteSection, setAddingRouteSection] =
    useState(false);

  const toggle = (key: keyof GuideFilters) => {
    setFilters({
      ...filters,
      [key]: !filters[key],
    });
  };

  const toggleOfficial = (key: keyof OfficialLayerFilters) => {
    setOfficialLayers({
      ...officialLayers,
      [key]: !officialLayers[key],
    });
  };

  const canManageRouteSections =
    profile?.role === "admin" ||
    profile?.role === "superadmin";

  const canReviewDeletions =
    profile?.role === "approver" ||
    profile?.role === "admin" ||
    profile?.role === "superadmin";

  return (
    <aside
      className="
        w-80
        bg-slate-50
        border-r
        border-slate-300
        p-5
        overflow-y-auto
        flex
        flex-col
        h-full
      "
    >
      <div className="mb-8 flex flex-col items-center">
        <Image
          src="/nae-logo-cropped.png"
          alt="Nord Anglia Education"
          width={319}
          height={70}
          className="mb-3"
          loading="eager"
        />

        <h1 className="
          text-center
          text-xl
          font-bold
          leading-tight
          text-slate-900
        ">
          Switzerland
          <br />
          Mountain Knowledge Hub
        </h1>
      </div>

      <CollapsibleSection title="🧭 NAE Knowledge Layers">
        <div className="space-y-4">
          <ToggleSwitch
            checked={filters.water}
            onChange={() => toggle("water")}
            label="💧 Water"
          />
          <ToggleSwitch
            checked={filters.hazard}
            onChange={() => toggle("hazard")}
            label="⚠️ Hazards"
          />
          <ToggleSwitch
            checked={filters.hut}
            onChange={() => toggle("hut")}
            label="🛖 Huts"
          />
          <ToggleSwitch
            checked={filters.cafe}
            onChange={() => toggle("cafe")}
            label="☕ Cafés"
          />
          <ToggleSwitch
            checked={filters.toilet}
            onChange={() => toggle("toilet")}
            label="🚻 Toilets"
          />
          <ToggleSwitch
            checked={filters.snow}
            onChange={() => toggle("snow")}
            label="❄️ Snow"
          />
          <ToggleSwitch
            checked={filters.information}
            onChange={() => toggle("information")}
            label="ℹ️ Information"
          />
          <ToggleSwitch
            checked={filters.sections}
            onChange={() => toggle("sections")}
            label="🟧 Route Sections"
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="🗺 SwissTopo Layers">
        <div className="space-y-4">
          <ToggleSwitch
            checked={officialLayers.hikingTrails}
            onChange={() => toggleOfficial("hikingTrails")}
            label="🥾 Hiking Trails"
          />
          <ToggleSwitch
            checked={officialLayers.closures}
            onChange={() => toggleOfficial("closures")}
            label="🚧 Closures & Diversions"
          />
          <ToggleSwitch
            checked={officialLayers.guardianDogs}
            onChange={() => toggleOfficial("guardianDogs")}
            label="🐕 Guardian Dogs"
          />
          <ToggleSwitch
            checked={officialLayers.shootingRanges}
            onChange={() => toggleOfficial("shootingRanges")}
            label="🎯 Shooting Bulletins"
          />
          <ToggleSwitch
            checked={officialLayers.transportStops}
            onChange={() => toggleOfficial("transportStops")}
            label="🚉 Transport Stops"
          />
          <ToggleSwitch
            checked={officialLayers.slopeAngle}
            onChange={() => toggleOfficial("slopeAngle")}
            label="⛰️ Slope angle >30°"
          />
        </div>
      </CollapsibleSection>

      {canReviewDeletions && (
        <CollapsibleSection title="🗑️ Deletion Requests">
          <DeletionRequestsPanel />
        </CollapsibleSection>
      )}

      <CollapsibleSection title="🥾 Routes">
        <GPXImportButton
          gpxRoute={gpxRoute}
          setGpxRoute={setGpxRoute}
        />
      </CollapsibleSection>

      {canManageRouteSections && (
        <CollapsibleSection title="🧭 Route Section Management">
          {!addingRouteSection ? (
            <button
              type="button"
              onClick={() => setAddingRouteSection(true)}
              className="w-full rounded bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              + Add Route Section
            </button>
          ) : (
            <RouteSectionEditor
              onCancel={() => {
                setAddingRouteSection(false);
                setRouteSectionDraft(null);
              }}
              onPreview={setRouteSectionDraft}
              onCreated={(section) => {
                onRouteSectionCreated(section);
                setAddingRouteSection(false);
                setRouteSectionDraft(null);
              }}
              createdBy={profile?.name}
            />
          )}
        </CollapsibleSection>
      )}

      <div className="
        mt-auto
        border-t
        border-slate-300
        pt-4
        space-y-3
      ">
        <div className="
          text-center
          text-sm
          text-slate-700
        ">
          <div className="font-medium">
            {profile?.name}
          </div>
          <div className="text-xs text-slate-500 capitalize">
            {profile?.role}
          </div>
        </div>

        <button
          onClick={async () => {
            await logout();
            router.push("/login");
          }}
          className="
            w-full
            bg-white
            text-slate-800
            border
            border-slate-300
            rounded
            px-3
            py-2
            font-medium
            hover:bg-slate-100
          "
        >
          Logout
        </button>

        <DataSources />

        <div className="
          text-center
          text-xs
          text-slate-500
        ">
          Version 0.8
        </div>
      </div>
    </aside>
  );
}
