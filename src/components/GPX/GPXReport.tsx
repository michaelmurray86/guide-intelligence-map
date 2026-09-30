"use client";

import { useMemo, useRef, useState } from "react";

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

type ReportItem =
  | {
      type: "note";
      item: RouteKnowledgeItem;
    }
  | {
      type: "section";
      item: RouteSectionMatch;
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

  const reportItems = useMemo<ReportItem[]>(() => {
    const items: ReportItem[] = [
      ...notes.map(item => ({
        type: "note" as const,
        item,
      })),
      ...routeSections.map(item => ({
        type: "section" as const,
        item,
      })),
    ];

    return items.sort(
      (a, b) => a.item.distanceAlongRoute - b.item.distanceAlongRoute
    );
  }, [notes, routeSections]);

  const selectItem = (index: number) => {
    setSelectedIndex(index);

    const selectedItem = reportItems[index];

    if (!selectedItem) return;

    if (selectedItem.type === "note") {
      onFocusNote?.(selectedItem.item);
    } else {
      onSelectSection?.(selectedItem.item.section);
    }

    itemRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  const previousItem = () => {
    selectItem(Math.max(selectedIndex - 1, 0));
  };

  const nextItem = () => {
    selectItem(
      Math.min(selectedIndex + 1, reportItems.length - 1)
    );
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

      {reportItems.length === 0 ? (
        <p className="text-slate-600">
          No nearby knowledge items or route sections found.
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
              onClick={previousItem}
              disabled={selectedIndex === 0}
              className="
                rounded-md
                border
                px-3
                py-1
                text-sm
                font-semibold
                text-slate-800
                bg-white
                disabled:text-slate-400
                disabled:bg-slate-50
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
              {selectedIndex + 1} / {reportItems.length}
            </span>

            <button
              onClick={nextItem}
              disabled={selectedIndex === reportItems.length - 1}
              className="
                rounded-md
                border
                px-3
                py-1
                text-sm
                font-semibold
                text-slate-800
                bg-white
                disabled:text-slate-400
                disabled:bg-slate-50
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
            {reportItems.map((reportItem, index) => {
              if (reportItem.type === "section") {
                const section = reportItem.item.section;

                const label =
                  section.guidanceLevel === "do_not_take"
                    ? "Do not take"
                    : section.guidanceLevel === "caution"
                      ? "Caution"
                      : "Suitable";

                return (
                  <div
                    key={`section-${section.id}`}
                    ref={el => {
                      itemRefs.current[index] = el;
                    }}
                    onClick={() => {
                      setSelectedIndex(index);
                      onSelectSection?.(section);
                    }}
                    className={`
                      cursor-pointer
                      rounded-md
                      border
                      border-slate-200
                      bg-slate-50
                      p-3
                      transition
                      hover:bg-slate-100
                      ${
                        selectedIndex === index
                          ? "border-l-4 border-blue-600"
                          : ""
                      }
                    `}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">🥾</span>

                        <div>
                          <h3 className="font-semibold text-slate-800">
                            {section.title}
                          </h3>

                          <p className="mt-1 text-sm text-slate-600">
                            Route section
                          </p>
                        </div>
                      </div>

                      <span
                        className="shrink-0 text-xs font-semibold"
                        style={{ color: section.color }}
                      >
                        {label}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                      {(reportItem.item.distanceAlongRoute / 1000).toFixed(1)} km
                    </p>
                  </div>
                );
              }

              const item = reportItem.item;

              return (
                <div
                  key={`note-${item.note.id}`}
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
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
