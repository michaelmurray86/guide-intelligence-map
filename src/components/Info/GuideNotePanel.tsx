"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { GuideNote } from "@/Types/GuideNote";
import { hasPendingGuideNoteDeletionRequest } from "@/lib/guideNoteDatabase";
import { markerIcons } from "../Map/markerIcons";


type Props = {
  note: GuideNote | null;
  onClose: () => void;
  onDelete: (id: number) => Promise<boolean>;
  onEdit: (note: GuideNote) => void;
  onEditHut?: (note: GuideNote) => void;
  hutPhotoUrls?: string[];
};


export default function GuideNotePanel({
  note,
  onClose,
  onDelete,
  onEdit,
  onEditHut,
  hutPhotoUrls,
}: Props) {

  const [selectedPhotoIndex, setSelectedPhotoIndex] =
    useState<number | null>(null);

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

    if (noteId === undefined || note?.category === "hut") {
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

  const photos = note.category === "hut" ? (hutPhotoUrls ?? []) : (note.photoUrls ?? note.photos ?? []);


  return (

    <>

    <aside
      className="
        fixed
        top-4
        bottom-4
        left-4
        right-4
        w-auto
        max-h-none
        md:top-6
        md:bottom-auto
        md:left-auto
        md:right-15
        md:w-96
        md:h-[70vh]
        md:max-h-none
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


        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
          Description
        </h3>
        <p className="leading-7 text-slate-800">
          {note.category === "hut" ? note.description : note.description}
        </p>

        {note.category === "hut" && (
          <>
            <div className="my-6 border-t border-slate-200" />
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Photos</h3>
            {photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {photos.map(photo => (
                  <img key={photo} src={photo} alt="" onClick={() => setSelectedPhotoIndex(photos.indexOf(photo))} className="aspect-square w-full cursor-pointer rounded-lg object-cover transition hover:opacity-90" />
                ))}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-500">
                No photo attached
              </div>
            )}
          </>
        )}




        {note.category !== "hut" && (
          <>
            <div className="my-6 border-t border-slate-200" />
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Last Updated</h3>
            <p className="text-slate-700">
              {new Date(note.updatedAt).toLocaleDateString("en-GB")} · {note.updatedBy || "Unknown"}
            </p>
            <div className="my-6 border-t border-slate-200" />
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Photos</h3>
            {photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {photos.map(photo => (
                  <img key={photo} src={photo} alt="" onClick={() => setSelectedPhotoIndex(photos.indexOf(photo))} className="aspect-square w-full cursor-pointer rounded-lg object-cover hover:opacity-90 transition" />
                ))}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-500">
                No photo attached
              </div>
            )}
          </>
        )}      </div>





      {/* Fixed footer buttons */}
      <div className="border-t border-slate-200 p-4 flex gap-3">
        {note.category === "hut" ? (
          <button type="button" className="flex-1 rounded-lg bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700" onClick={() => onEditHut?.(note)}>
            Hut Details
          </button>
        ) : (
          <>
            <button className="flex-1 rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700" onClick={() => onEdit(note)}>
              Edit Note
            </button>
            <button className="flex-1 rounded-lg bg-red-600 py-3 font-semibold text-white hover:bg-red-700" disabled={deletionRequested || deletionWorking} onClick={async () => {
              if (!confirm("Request deletion of this knowledge item?")) return;
              setDeletionWorking(true);
              const success = await onDelete(note.id);
              setDeletionWorking(false);
              if (success) setDeletionRequested(true);
            }}>
              {deletionWorking ? "Submitting..." : deletionRequested ? "Deletion requested" : "Request deletion"}
            </button>
          </>
        )}
      </div>

      {deletionRequested && (
        <div className="border-t border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Deletion requested. An approver or admin will review this knowledge item.
        </div>
      )}

    </aside>

    {selectedPhotoIndex !== null && typeof document !== "undefined" && createPortal(
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4"
        onClick={() => setSelectedPhotoIndex(null)}
      >
        <button
          type="button"
          aria-label="Close photo viewer"
          onClick={() => setSelectedPhotoIndex(null)}
          className="fixed right-4 top-4 z-[102] flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl font-bold text-slate-800 shadow-lg hover:bg-slate-100"
        >
          ×
        </button>

        <div
          className="flex max-h-[calc(100vh-2rem)] w-full max-w-[calc(100vw-2rem)] items-center justify-center gap-3"
          onClick={event => event.stopPropagation()}
        >
          {photos.length > 1 && (
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => {
                setSelectedPhotoIndex(
                  current =>
                    current === null
                      ? null
                      : (current - 1 + photos.length) % photos.length
                );
              }}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/90 text-3xl text-slate-800 shadow-lg hover:bg-white"
            >
              ‹
            </button>
          )}

          <div className="flex max-h-[calc(100vh-2rem)] max-w-[calc(100vw-7rem)] items-center justify-center">
            <img
              src={photos[selectedPhotoIndex]}
              alt=""
              className="block max-h-[calc(100vh-2rem)] max-w-full rounded-xl object-contain shadow-2xl"
            />
          </div>

          {photos.length > 1 && (
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => {
                setSelectedPhotoIndex(
                  current =>
                    current === null
                      ? null
                      : (current + 1) % photos.length
                );
              }}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/90 text-3xl text-slate-800 shadow-lg hover:bg-white"
            >
              ›
            </button>
          )}
        </div>
      </div>,
      document.body
    )}

    </>

  );


}
