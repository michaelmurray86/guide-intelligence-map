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
};


export default function RoutePanel({
  route,
  notes,
  clearRoute,
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
                overflow-y-auto
                max-h-[45vh]
              "
            >

              <GPXReport
                notes={routeKnowledge}
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