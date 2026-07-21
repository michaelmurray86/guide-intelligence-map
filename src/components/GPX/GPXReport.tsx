"use client";

import { useState } from "react";

import { RouteKnowledgeItem } from "@/lib/gpxAnalysis";

import { markerIcons } from "../map/markerIcons";


type Props = {
  notes: RouteKnowledgeItem[];

  onSelectNote?: (
    note: RouteKnowledgeItem
  ) => void;

  onFocusNote?: (
    note: RouteKnowledgeItem
  ) => void;

};


export default function GPXReport({
  notes,
  onSelectNote,
  onFocusNote,
}: Props) {


  const [selectedIndex, setSelectedIndex] =
    useState(0);



  const selectItem = (
    index:number
  ) => {

    setSelectedIndex(index);

    onFocusNote?.(
    notes[index]
    );

  };



  const previousNote = () => {

    const newIndex =
      Math.max(
        selectedIndex - 1,
        0
      );

    selectItem(newIndex);

  };



  const nextNote = () => {

    const newIndex =
      Math.min(
        selectedIndex + 1,
        notes.length - 1
      );

    selectItem(newIndex);

  };



  return (

    <div
      className="
        rounded-xl
        bg-white
        border
        border-slate-200
        shadow-md
        p-5
      "
    >


      <h2
        className="
          font-bold
          text-lg
          mb-4
          text-slate-800
        "
      >
        🥾 Route Knowledge Report
      </h2>



      {
        notes.length === 0 ?

        (

          <p className="text-slate-600">
            No nearby knowledge notes found.
          </p>

        )

        :

        (

          <>



          {/* Navigation */}

          <div
            className="
              mb-4
              flex
              items-center
              justify-between
              border-t
              pt-3
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
                disabled:opacity-40
              "

            >
              ◀ Previous
            </button>



            <span
              className="
                text-sm
                font-medium
                text-slate-600
              "
            >
              {selectedIndex + 1} / {notes.length}
            </span>



            <button

              onClick={nextNote}

              disabled={
                selectedIndex === notes.length - 1
              }

              className="
                rounded-md
                border
                px-3
                py-1
                text-sm
                disabled:opacity-40
              "

            >
              Next ▶
            </button>


          </div>


          <div
            className="
              space-y-3
            "
          >


          {
            notes.map((item,index)=>(

              <div

                key={item.note.id}

                onClick={() => {

                  setSelectedIndex(index);

                  onSelectNote?.(item);

                }}


                className={`
                  border-b
                  border-slate-200
                  pb-3
                  cursor-pointer
                  rounded-md
                  p-2
                  transition

                  ${
                    selectedIndex === index
                    ? 
                    "bg-slate-100 border-l-4 border-blue-600"
                    :
                    "hover:bg-slate-50"
                  }

                `}

              >


               <div
  className="
    flex
    items-start
    gap-3
  "
>

  <span className="text-2xl">
    {
      markerIcons[
        item.note.category
      ]
    }
  </span>


  <div className="flex-1">

    <h3
      className="
        font-semibold
        text-slate-800
      "
    >
      {item.note.title}
    </h3>

  </div>


  <span
    className="
      text-xs
      whitespace-nowrap
      text-slate-500
    "
  >
    {(
      item.distanceAlongRoute / 1000
    ).toFixed(1)} km
  </span>


</div>



                <p
                  className="
                    text-sm
                    text-slate-600
                    mt-1
                  "
                >
                  {item.note.description}
                </p>


              </div>

            ))

          }

          </div>





          </>

        )

      }


    </div>

  );

}