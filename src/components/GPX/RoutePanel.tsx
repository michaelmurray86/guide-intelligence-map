"use client";

import { markerIcons } from "../map/markerIcons";

import { useEffect, useState } from "react";

import { GPXRoute } from "@/types/GPXRoute";
import { GuideNote } from "@/types/GuideNote";

import {
  findNotesNearRoute,
  RouteKnowledgeItem,
} from "@/lib/gpxAnalysis";

import GPXReport from "./GPXReport";

type Props = {
  route: GPXRoute | null;
  notes: GuideNote[];
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
  clearRoute,
  onOverview,
  onSelectNote,
  onFocusNote,
}: Props) {

  const [routeKnowledge, setRouteKnowledge] =
    useState<RouteKnowledgeItem[]>([]);

  const [collapsed, setCollapsed] =
    useState(false);

  const [selectedIndex, setSelectedIndex] =
    useState(0);

  useEffect(() => {

  if (!route) {

    setRouteKnowledge([]);
    setSelectedIndex(0);

    return;

  }

  const results =
    findNotesNearRoute(
      route,
      notes
    );

  setRouteKnowledge(results);

  setSelectedIndex(0);


}, [
  route,
  notes,
  onSelectNote,
]);


  const previousNote = () => {

    if (
      !routeKnowledge.length ||
      !onSelectNote
    ) return;

    const newIndex =
      Math.max(
        selectedIndex - 1,
        0
      );

    setSelectedIndex(newIndex);

onFocusNote?.(
  routeKnowledge[newIndex]
);

  };


  const nextNote = () => {

    if (
      !routeKnowledge.length ||
      !onSelectNote
    ) return;

    const newIndex =
      Math.min(
        selectedIndex + 1,
        routeKnowledge.length - 1
      );

    setSelectedIndex(newIndex);

onFocusNote?.(
  routeKnowledge[newIndex]
);

  };


  if (!route) return null;

  return (

    <div
      className={`
        fixed
        top-6
        left-[22rem]
        w-80
        ${collapsed ? "" : "h-[75vh]"}
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

            </div>

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
                onSelectNote={
                  onSelectNote
                }
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

              {routeKnowledge.length > 0 && (

  <div
    className="
      mb-3
      rounded-lg
      border
      border-slate-200
      bg-slate-50
      p-3
    "
  >

    <div
      className="
        flex
        items-center
        justify-between
      "
    >

      <button
        onClick={previousNote}
        disabled={selectedIndex === 0}
        className="
          rounded-md
          border
          px-3
          py-1
          text-sm
          hover:bg-white
          disabled:cursor-not-allowed
          disabled:opacity-40
        "
      >
        ◀ Previous
      </button>

      <span
        className="
          text-sm
          font-semibold
          text-slate-700
        "
      >
        {selectedIndex + 1}
        {" / "}
        {routeKnowledge.length}
      </span>

      <button
        onClick={nextNote}
        disabled={
          selectedIndex ===
          routeKnowledge.length - 1
        }
        className="
          rounded-md
          border
          px-3
          py-1
          text-sm
          hover:bg-white
          disabled:cursor-not-allowed
          disabled:opacity-40
        "
      >
        Next ▶
      </button>

    </div>

    <div className="mt-3">

      <p className="text-xs text-slate-500">
        Distance along route
      </p>

      <p className="font-medium text-slate-800">
        {(
          routeKnowledge[selectedIndex]
            .distanceAlongRoute / 1000
        ).toFixed(1)}
        {" km"}
      </p>

<div className="mt-2 flex items-center gap-2">

  <span className="text-xl">
    {
      markerIcons[
        routeKnowledge[selectedIndex]
          .note.category
      ]
    }
  </span>

  <p className="font-semibold text-slate-900">
    {
      routeKnowledge[selectedIndex]
        .note.title
    }
  </p>

</div>

    </div>

  </div>

)}

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