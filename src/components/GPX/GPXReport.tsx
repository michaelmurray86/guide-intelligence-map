"use client";

import { useRef, useState } from "react";

import {
  RouteKnowledgeItem,
  RouteSectionMatch,
} from "@/lib/gpxAnalysis";

import { markerIcons } from "../Map/markerIcons";

type Props = {
  notes: RouteKnowledgeItem[];
  routeSections: RouteSectionMatch[];
  onSelectNote?: (note: RouteKnowledgeItem) => void;
  onFocusNote?: (note: RouteKnowledgeItem) => void;
  onSelectSection?: (section: RouteSectionMatch["section"]) => void;
};

export default function GPXReport({
  notes,
  routeSections,
  onSelectNote,
  onFocusNote,
  onSelectSection,
}: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const selectItem = (index: number) => {
    setSelectedIndex(index);

    onFocusNote?.(notes[index]);

    itemRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  const previousNote = () => {
    selectItem(Math.max(selectedIndex - 1, 0));
  };

  const nextNote = () => {
    selectItem(Math.min(selectedIndex + 1, notes.length - 1));
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
        flex
        flex-col
        h-full
        min-h-0
      "
    >
      <h2
        className="
          font-bold
          text-lg
          mb-5
          text-slate-800
        "
      >
        🥾 Route Knowledge Report
      </h2>

      {routeSections.length > 0 && (
        <div className="mb-5 border-b border-slate-200 pb-4">
          <h3 className="mb-3 text-sm font-bold text-slate-800">
            🥾 Route Sections Encountered
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
                    Around{" "}
                    {(match.distanceAlongRoute / 1000).toFixed(1)} km into route
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {notes.length === 0 ? (
        <p className="text-slate-600">
          No nearby knowledge notes found.
        </p>
      ) : (
        <>
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
              disabled={selectedIndex === notes.length - 1}
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
              flex-1
              min-h-0
              overflow-y-auto
              space-y-3
              pr-1
            "
          >
            {notes.map((item, index) => (
              <div
                key={item.note.id}
                ref={el => {
                  itemRefs.current[index] = el;
                }}
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
                      ? "bg-slate-100 border-l-4 border-blue-600"
                      : "hover:bg-slate-50"
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
                    {markerIcons[item.note.category]}
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
                    {(item.distanceAlongRoute / 1000).toFixed(1)} km
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
            ))}
          </div>
        </>
      )}
    </div>
  );
}
