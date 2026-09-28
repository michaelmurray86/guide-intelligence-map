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
import { deleteGuideSection, GUIDE_SECTION_COLORS } from "@/lib/guideSectionDatabase";

type Props = {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  filters: GuideFilters;
  setFilters: React.Dispatch<React.SetStateAction<GuideFilters>>;
  officialLayers: OfficialLayerFilters;
  setOfficialLayers: React.Dispatch<React.SetStateAction<OfficialLayerFilters>>;
  gpxRoute: GPXRoute | null;
  setGpxRoute: React.Dispatch<React.SetStateAction<GPXRoute | null>>;
  routeSectionDraft: GPXRoute | null;
  setRouteSectionDraft: React.Dispatch<React.SetStateAction<GPXRoute | null>>;
  guideSections: GuideSection[];
  onRouteSectionCreated: (section: GuideSection | null) => void;
  onRouteSectionUpdated: (section: GuideSection | null) => void;
  onRouteSectionDeleted: (id: number) => void;
  onRouteSectionFocus: (id: number) => void;
};

export default function Sidebar({
  collapsed,
  onToggleCollapsed,
  filters,
  setFilters,
  officialLayers,
  setOfficialLayers,
  gpxRoute,
  setGpxRoute,
  routeSectionDraft,
  setRouteSectionDraft,
  guideSections,
  onRouteSectionCreated,
  onRouteSectionUpdated,
  onRouteSectionDeleted,
  onRouteSectionFocus,
}: Props) {
  const router = useRouter();
  const { logout } = useAuth();
  const { profile } = useProfile();

  const [addingRouteSection, setAddingRouteSection] = useState(false);
  const [editingRouteSection, setEditingRouteSection] =
    useState<GuideSection | null>(null);
  const [deletingRouteSectionId, setDeletingRouteSectionId] =
    useState<number | null>(null);

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

  const handleDeleteRouteSection = async (section: GuideSection) => {
    const confirmed = window.confirm(
      `Delete the Route Section "${section.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingRouteSectionId(section.id);
    const success = await deleteGuideSection(section.id);
    setDeletingRouteSectionId(null);

    if (!success) {
      window.alert("The Route Section could not be deleted.");
      return;
    }

    onRouteSectionDeleted(section.id);
  };

  if (collapsed) {
    return (
      <aside className="w-12 shrink-0 bg-slate-50 border-r border-slate-300 flex items-start justify-center pt-4 h-full overflow-hidden transition-[width] duration-300 ease-in-out">
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label="Expand sidebar"
          title="Expand sidebar"
          className="flex h-8 w-8 items-center justify-center rounded border border-slate-300 bg-white text-lg text-slate-700 shadow-sm hover:bg-slate-100"
        >
          ›
        </button>
      </aside>
    );
  }

  return (
    <aside
      className="
        w-80
        shrink-0
        bg-slate-50
        border-r
        border-slate-300
        p-5
        overflow-y-auto
        flex
        flex-col
        h-full
        overflow-hidden
        transition-[width] duration-300 ease-in-out
      "
    >
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label="Collapse sidebar"
          title="Collapse sidebar"
          className="flex h-8 w-8 items-center justify-center rounded border border-slate-300 bg-white text-lg text-slate-700 shadow-sm hover:bg-slate-100"
        >
          ‹
        </button>
      </div>

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
          <ToggleSwitch checked={filters.water} onChange={() => toggle("water")} label="💧 Water" />
          <ToggleSwitch checked={filters.cattle} onChange={() => toggle("cattle")} label="🐄 Cattle" />
          <ToggleSwitch checked={filters.hazard} onChange={() => toggle("hazard")} label="⚠️ Hazards" />
          <ToggleSwitch checked={filters.hut} onChange={() => toggle("hut")} label="🛖 Huts" />
          <ToggleSwitch checked={filters.cafe} onChange={() => toggle("cafe")} label="☕ Cafés" />
          <ToggleSwitch checked={filters.toilet} onChange={() => toggle("toilet")} label="🚻 Toilets" />
          <ToggleSwitch checked={filters.snow} onChange={() => toggle("snow")} label="❄️ Snow" />
          <ToggleSwitch checked={filters.information} onChange={() => toggle("information")} label="ℹ️ Information" />
          <ToggleSwitch checked={filters.sections} onChange={() => toggle("sections")} label="🟧 Route Sections" />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="🗺 SwissTopo Layers">
        <div className="space-y-4">
          <ToggleSwitch checked={officialLayers.hikingTrails} onChange={() => toggleOfficial("hikingTrails")} label="🥾 Hiking Trails" />
          <ToggleSwitch checked={officialLayers.closures} onChange={() => toggleOfficial("closures")} label="🚧 Closures & Diversions" />
          <ToggleSwitch checked={officialLayers.guardianDogs} onChange={() => toggleOfficial("guardianDogs")} label="🐕 Guardian Dogs" />
          <ToggleSwitch checked={officialLayers.shootingRanges} onChange={() => toggleOfficial("shootingRanges")} label="🎯 Shooting Bulletins" />
          <ToggleSwitch checked={officialLayers.transportStops} onChange={() => toggleOfficial("transportStops")} label="🚉 Transport Stops" />
          <ToggleSwitch checked={officialLayers.slopeAngle} onChange={() => toggleOfficial("slopeAngle")} label="⛰️ Slope angle >30°" />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="🥾 Routes">
        <GPXImportButton gpxRoute={gpxRoute} setGpxRoute={setGpxRoute} />
      </CollapsibleSection>

      {(canManageRouteSections || canReviewDeletions) && (
        <>
          <div className="my-4 border-t border-slate-300" />

          {canManageRouteSections && (
            <CollapsibleSection title="🧭 Route Section Management">
              {!addingRouteSection && !editingRouteSection && (
                <>
                  <button
                    type="button"
                    onClick={() => setAddingRouteSection(true)}
                    className="w-full rounded bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    + Add Route Section
                  </button>

                  <div className="mt-4 space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Existing sections
                    </div>

                    {guideSections.length === 0 ? (
                      <p className="text-xs text-slate-500">No Route Sections yet.</p>
                    ) : (
                      guideSections.map(section => (
                        <div
                          key={section.id}
                          className="rounded border border-slate-200 bg-white p-3"
                        >
                          <div className="flex items-start gap-2">
                            <span
                              className="mt-1 h-3 w-3 shrink-0 rounded-full"
                              style={{
                                backgroundColor:
                                  GUIDE_SECTION_COLORS[section.guidanceLevel],
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => onRouteSectionFocus(section.id)}
                              className="min-w-0 flex-1 rounded px-1 py-0.5 text-left transition-colors hover:bg-slate-100 focus-visible:bg-slate-100 focus-visible:outline-none"
                            >
                              <div className="text-sm font-semibold text-slate-800">
                                {section.title}
                              </div>
                              <div className="text-xs text-slate-500">
                                {section.guidanceLevel === "suitable"
                                  ? "Suitable"
                                  : section.guidanceLevel === "caution"
                                    ? "Caution"
                                    : "Do not take groups"}
                              </div>
                            </button>
                          </div>

                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingRouteSection(section)}
                              className="flex-1 rounded border border-slate-300 px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRouteSection(section)}
                              disabled={deletingRouteSectionId === section.id}
                              className="flex-1 rounded border border-red-200 px-2 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                            >
                              {deletingRouteSectionId === section.id ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}

              {addingRouteSection && (
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

              {editingRouteSection && (
                <RouteSectionEditor
                  existingSection={editingRouteSection}
                  onCancel={() => setEditingRouteSection(null)}
                  onPreview={setRouteSectionDraft}
                  onUpdated={(section) => {
                    onRouteSectionUpdated(section);
                    setEditingRouteSection(null);
                    setRouteSectionDraft(null);
                  }}
                  createdBy={profile?.name}
                />
              )}
            </CollapsibleSection>
          )}

          {canReviewDeletions && (
            <CollapsibleSection title="🗑️ Deletion Requests">
              <DeletionRequestsPanel />
            </CollapsibleSection>
          )}
        </>
      )}

      <div className="mt-auto border-t border-slate-300 pt-4 space-y-3">
        <div className="text-center text-sm text-slate-700">
          <div className="font-medium">{profile?.name}</div>
          <div className="text-xs text-slate-500 capitalize">{profile?.role}</div>
        </div>

        <button
          onClick={async () => {
            await logout();
            router.push("/login");
          }}
          className="w-full bg-white text-slate-800 border border-slate-300 rounded px-3 py-2 font-medium hover:bg-slate-100"
        >
          Logout
        </button>

        <DataSources />

        <div className="text-center text-xs text-slate-500">
          Version 0.8
        </div>
      </div>
    </aside>
  );
}
