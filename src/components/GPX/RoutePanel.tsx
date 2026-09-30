"use client";

import { useEffect, useState } from "react";

import { GPXRoute } from "@/Types/GPXRoute";
import { GuideNote } from "@/Types/GuideNote";
import { GuideSection } from "@/Types/GuideSection";

import {
  findNotesNearRoute,
  findRouteSectionsNearRoute,
  RouteKnowledgeItem,
  RouteSectionMatch,
} from "@/lib/gpxAnalysis";

import GPXReport from "./GPXReport";

type Props = {
  route: GPXRoute | null;
  notes: GuideNote[];
  guideSections: GuideSection[];
  clearRoute: () => void;

  onOverview?: () => void;

  onSelectNote?: (
    note: RouteKnowledgeItem
  ) => void;

onFocusNote?: (
    note: RouteKnowledgeItem
  ) => void;

};

export default function RoutePanel({
  route,
  notes,
  guideSections,
  clearRoute,
  onOverview,
  onSelectNote,
  onFocusNote,
  onSelectSection,
}: Props) {

  const [routeKnowledge, setRouteKnowledge] =
    useState<RouteKnowledgeItem[]>([]);

  const [routeSections, setRouteSections] =
    useState<RouteSectionMatch[]>([]);

  const [collapsed, setCollapsed] =
    useState(true);

useEffect(() => {

  if (!route) {

    setRouteKnowledge([]);

    return;

  }

  const results =
    findNotesNearRoute(
      route,
      notes
    );

  setRouteKnowledge(results);

  const sectionResults =
    findRouteSectionsNearRoute(
      route,
      guideSections
    );

  setRouteSections(sectionResults);


}, [
  route,
  notes,
  guideSections,
]);


  if (!route) return null;

  return (

    <div
      className={`
        fixed
        top-4
        left-4
        right-4
        w-auto
        max-w-[calc(100vw-6rem)]
        ${collapsed ? "" : "h-[75vh]"}
        md:top-6
        md:left-[22rem]
        md:right-auto
        md:w-80
        md:max-w-none
        flex
        flex-col
        overflow-hidden
        rounded-xl
        bg-white
        shadow-xl
        border
        border-slate-300
        z-20
      `}
    >

      {/* Header */}

      <div
        className="
          flex
          items-center
          justify-between
          cursor-pointer
          border-b
          p-4
          hover:bg-slate-50
        "
        onClick={() =>
          setCollapsed(!collapsed)
        }
      >

        <div>

          <h2
            className="
              text-lg
              font-bold
              text-slate-900
            "
          >
            🥾 Route Overview
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-slate-600
            "
          >
            {route.name}
          </p>

        </div>

        <span
          className="
            text-xl
            text-slate-500
          "
        >
          {collapsed ? "▲" : "▼"}
        </span>

      </div>

      {
        !collapsed && (

          <>

            {/* Summary */}

            <div
              className="
                border-b
                p-4
                text-sm
                text-slate-700
              "
            >

              📍{" "}
              <span className="font-medium">
                {routeKnowledge.length}
              </span>{" "}
              knowledge items found
              <span className="mx-2 text-slate-400">·</span>
              <span className="font-medium">
                {routeSections.length}
              </span>{" "}
              route sections encountered

            </div>

            {/* Route Sections */}

            {routeSections.length > 0 && (
              <div className="border-b border-slate-200 p-4">
                <h3 className="mb-3 text-sm font-bold text-slate-800">
                  🥾 Route Sections encountered
                </h3>

                <div className="space-y-2">
                  {routeSections.map(match => {
                    const label =
                      match.section.guidanceLevel === "do_not_take"
                        ? "Do not take"
                        : match.section.guidanceLevel === "caution"
                          ? "Caution"
                          : "Suitable";

                    return (
                      <button
                        key={match.section.id}
                        type="button"
                        onClick={() => onSelectSection?.(match.section)}
                        className="w-full rounded-md border border-slate-200 bg-slate-50 p-3 text-left transition hover:bg-slate-100"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="font-semibold text-slate-800">
                            {match.section.title}
                          </span>
                          <span
                            className="shrink-0 text-xs font-semibold"
                            style={{ color: match.section.color }}
                          >
                            {label}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          Around {(match.distanceAlongRoute / 1000).toFixed(1)} km into route
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Report */}

            <div
              className="
                flex-1
                min-h-0
                overflow-y-auto
              "
            >

              <GPXReport
                notes={routeKnowledge}
                onSelectNote={onSelectNote}
                onFocusNote={onFocusNote}
              />

            </div>

            {/* Footer */}

            <div
              className="
                border-t
                bg-white
                p-3
              "
            >


{onOverview && (

  <button
    onClick={onOverview}
    className="
      mt-3
      w-full
      rounded-md
      border
      border-slate-300
      bg-white
      px-3
      py-2
      text-sm
      font-medium
      text-slate-700
      hover:bg-slate-50
      transition
    "
  >
    🗺 Show Full Route
  </button>

)}

              <button

                onClick={clearRoute}

                className="
                  mt-3
                  w-full
                  rounded-md
                  bg-slate-700
                  px-3
                  py-2
                  text-sm
                  font-medium
                  text-white
                  hover:bg-slate-800
                  transition
                "

              >

                🗑 Clear Route

              </button>

            </div>

          </>

        )
      }

    </div>

  );

}