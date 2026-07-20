"use client";

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

  onSelectNote?: (
    note: RouteKnowledgeItem
  ) => void;
};



export default function RoutePanel({
  route,
  notes,
  clearRoute,
  onSelectNote,
}: Props) {


  const [routeKnowledge, setRouteKnowledge] =
    useState<RouteKnowledgeItem[]>([]);


  const [collapsed, setCollapsed] =
    useState(false);



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
    notes,
  ]);



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



            {/* Clear button */}

            <div
              className="
                border-t
                p-3
              "
            >

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