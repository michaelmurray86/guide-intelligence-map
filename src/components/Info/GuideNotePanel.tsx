"use client";

import { useEffect, useState } from "react";

import { GuideNote } from "@/Types/GuideNote";
import { hasPendingGuideNoteDeletionRequest } from "@/lib/guideNoteDatabase";
import { markerIcons } from "../Map/markerIcons";


type Props = {
  note: GuideNote | null;
  onClose: () => void;
  onDelete: (id: number) => Promise<boolean>;
  onEdit: (note: GuideNote) => void;
};


export default function GuideNotePanel({
  note,
  onClose,
  onDelete,
  onEdit,
}: Props) {

  const [selectedPhoto, setSelectedPhoto] =
    useState<string | null>(null);

  const [deletionRequested, setDeletionRequested] =
    useState(false);

  const [deletionWorking, setDeletionWorking] =
    useState(false);


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



  useEffect(() => {
    let cancelled = false;

    setDeletionRequested(false);
    setDeletionWorking(false);

    const noteId = note?.id;

    if (noteId === undefined) {
      return;
    }

    async function loadDeletionStatus(id: number) {
      const pending = await hasPendingGuideNoteDeletionRequest(id);

      if (!cancelled) {
        setDeletionRequested(pending);
      }
    }

    loadDeletionStatus(noteId);

    return () => {
      cancelled = true;
    };
  }, [note?.id]);

  if (!note) return null;

  const photos = note.photoUrls ?? note.photos ?? [];


  return (

    <>

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
          {new Date(note.updatedAt).toLocaleDateString("en-GB")} · {note.updatedBy || "Unknown"}
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
          Photos
        </h3>


        {
          photos.length > 0 ? (

            <div className="grid grid-cols-2 gap-3">

              {
                photos.map(photo => (

                  <img
                    key={photo}
                    src={photo}
                    alt=""
                    onClick={() =>
                      setSelectedPhoto(photo)
                    }
                    className="
                      aspect-square
                      w-full
                      rounded-lg
                      cursor-pointer
                      object-cover
                      hover:opacity-90
                      transition
                    "
                  />

                ))
              }

            </div>

          ) : (

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

          )
        }

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

          disabled={deletionRequested || deletionWorking}
          onClick={async () => {

            if (
              !confirm(
                "Request deletion of this knowledge item?"
              )
            ) {
              return;
            }

            setDeletionWorking(true);

            const success = await onDelete(note.id);

            setDeletionWorking(false);

            if (success) {
              setDeletionRequested(true);
            }

          }}

        >

          {deletionWorking
            ? "Submitting..."
            : deletionRequested
              ? "Deletion requested"
              : "Request deletion"}

        </button>


      </div>

      {deletionRequested && (
        <div className="border-t border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Deletion requested. An approver or admin will review this knowledge item.
        </div>
      )}

    </aside>

    {
      selectedPhoto && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/70
            p-8
          "
          onClick={() =>
            setSelectedPhoto(null)
          }
        >

          <img
            src={selectedPhoto}
            alt=""
            className="
              max-w-full
              max-h-full
              rounded-xl
              shadow-2xl
            "
          />

        </div>

      )
    }

    </>

  );


}
