"use client";

import { useEffect } from "react";

import { GuideNote } from "@/types/GuideNote";
import { markerIcons } from "../map/markerIcons";


type Props = {
  note: GuideNote | null;
  onClose: () => void;
  onDelete: (id: number) => void;
  onEdit: (note: GuideNote) => void;
};


export default function GuideNotePanel({
  note,
  onClose,
  onDelete,
  onEdit,
}: Props) {


  useEffect(() => {

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {

      if (
        event.key === "Escape" &&
        note
      ) {
        onClose();
      }

    };


    window.addEventListener(
      "keydown",
      handleKeyDown
    );


    return () => {

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

    };


  }, [
    note,
    onClose,
  ]);



  if (!note) return null;



  return (

    <aside
      className="
        fixed
        top-6
        right-15
        w-96
        h-[70vh]
        flex
        flex-col
        overflow-hidden
        rounded-xl
        bg-white
        border
        border-slate-300
        shadow-xl
        z-30
      "
    >


      {/* Header */}

      <div
        className="
          border-b
          border-slate-200
          p-6
        "
      >

        <div
          className="
            flex
            items-start
            justify-between
            gap-4
          "
        >


          <div
            className="
              flex
              gap-3
            "
          >

            <div className="text-3xl">
              {markerIcons[note.category]}
            </div>


            <div>

              <p
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-wider
                  text-slate-500
                "
              >
                Knowledge Item
              </p>


              <h2
                className="
                  text-2xl
                  font-bold
                  text-slate-900
                "
              >
                {note.title}
              </h2>


              <span
                className="
                  mt-2
                  inline-block
                  rounded-full
                  bg-slate-100
                  px-3
                  py-1
                  text-sm
                  font-medium
                  capitalize
                  text-slate-700
                "
              >
                {note.category}
              </span>


            </div>


          </div>



          <button

            onClick={onClose}

            className="
              rounded-lg
              px-2
              py-1
              text-xl
              text-slate-400
              hover:bg-slate-100
              hover:text-slate-800
            "

            aria-label="Close"

          >

            ✕

          </button>


        </div>


      </div>





      {/* Scrollable content */}

      <div
        className="
          flex-1
          min-h-0
          overflow-y-auto
          p-6
        "
      >


        <h3
          className="
            mb-2
            text-xs
            font-bold
            uppercase
            tracking-wider
            text-slate-500
          "
        >
          Description
        </h3>


        <p
          className="
            leading-7
            text-slate-800
          "
        >
          {note.description}
        </p>



        <div className="my-6 border-t border-slate-200" />



        <h3
          className="
            mb-2
            text-xs
            font-bold
            uppercase
            tracking-wider
            text-slate-500
          "
        >
          Last Updated
        </h3>


        <p className="text-slate-700">

          {new Date(
            note.updatedAt
          ).toLocaleDateString("en-GB")}

        </p>



        <div className="my-6 border-t border-slate-200" />



        <h3
          className="
            mb-2
            text-xs
            font-bold
            uppercase
            tracking-wider
            text-slate-500
          "
        >
          Photo
        </h3>


        <div
          className="
            flex
            h-32
            items-center
            justify-center
            rounded-lg
            border
            border-dashed
            border-slate-300
            bg-slate-50
            text-slate-500
          "
        >

          No photo attached

        </div>


      </div>





      {/* Fixed footer buttons */}

      <div
        className="
          border-t
          border-slate-200
          p-4
          flex
          gap-3
        "
      >


        <button

          className="
            flex-1
            rounded-lg
            bg-blue-600
            py-3
            font-semibold
            text-white
            hover:bg-blue-700
          "

          onClick={() => onEdit(note)}

        >

          Edit Note

        </button>



        <button

          className="
            flex-1
            rounded-lg
            bg-red-600
            py-3
            font-semibold
            text-white
            hover:bg-red-700
          "

          onClick={() => {

            if (
              confirm(
                "Delete this knowledge item?"
              )
            ) {

              onDelete(note.id);
              onClose();

            }

          }}

        >

          Delete

        </button>


      </div>


    </aside>

  );

}