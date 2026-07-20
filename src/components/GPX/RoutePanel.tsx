"use client";

import { useEffect, useState } from "react";

import { GPXRoute } from "@/types/GPXRoute";
import { GuideNote } from "@/types/GuideNote";

import { findNotesNearRoute, RouteKnowledgeItem } from "@/lib/gpxAnalysis";

import GPXReport from "./GPXReport";


type Props = {
  route: GPXRoute | null;
  notes: GuideNote[];
  clearRoute: () => void;
};


export default function RoutePanel({
  route,
  notes,
  clearRoute,
}: Props) {


  const [routeKnowledge, setRouteKnowledge] =
    useState<RouteKnowledgeItem[]>([]);



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


  }, [
    route,
    notes
  ]);



  if (!route) return null;



  return (

    <div
      className="
        absolute
        top-4
        right-4
        w-96
        max-h-[70vh]
        overflow-hidden
        rounded-xl
        bg-white
        shadow-xl
        border
        border-slate-300
        z-20
      "
    >


      <div
        className="
          border-b
          p-4
        "
      >

        <h2
          className="
            text-lg
            font-bold
          "
        >
          🥾 Imported Route
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


        <p
          className="
            mt-2
            text-sm
            font-medium
          "
        >
          {routeKnowledge.length} knowledge items
        </p>


      </div>


      <div
        className="
          overflow-y-auto
          max-h-[55vh]
        "
      >

        <GPXReport
          notes={routeKnowledge}
        />

        <div className="border-t p-3">

        <button
            onClick={clearRoute}
            className="
            w-full
            rounded-md
            bg-slate-700
            px-3
            py-2
            text-sm
            font-medium
            text-white
            hover:bg-slate-800
            "
        >
            🗑 Clear Route
        </button>

        </div>

      </div>


    </div>

  );

}