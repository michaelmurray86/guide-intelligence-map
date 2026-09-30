"use client";

import { useEffect, useMemo, useState } from "react";

import { supabase } from "@/lib/supabase";

import { GPXRoute } from "@/Types/GPXRoute";
import { markerIcons } from "../Map/markerIcons";
import {
  RouteKnowledgeItem,
  RouteSectionMatch,
} from "@/lib/gpxAnalysis";

type Props = {
  route: GPXRoute;
  notes: RouteKnowledgeItem[];
  routeSections: RouteSectionMatch[];
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

function formatCategory(category: string) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export default function GPXReportPrint({
  route,
  notes,
  routeSections,
}: Props) {
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

  const [profileNames, setProfileNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const ids = Array.from(
      new Set(
        reportItems
          .map(reportItem =>
            reportItem.type === "note"
              ? reportItem.item.note.updatedBy
              : reportItem.item.section.updatedBy
          )
          .filter((id): id is string => Boolean(id))
      )
    );

    if (ids.length === 0) {
      setProfileNames({});
      return;
    }

    async function loadProfileNames() {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, email")
        .in("id", ids);

      if (error) {
        console.error("Error loading report updater names:", error);
        return;
      }

      setProfileNames(
        Object.fromEntries(
          (data ?? []).map(profile => [
            profile.id,
            profile.name || profile.email || "Unknown user",
          ])
        )
      );
    }

    loadProfileNames();
  }, [reportItems]);

  const formatUpdated = (updatedAt: string, updatedBy?: string) => {
    const date = new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
    }).format(new Date(updatedAt));

    const name = updatedBy
      ? profileNames[updatedBy] ?? "Unknown user"
      : "Unknown user";

    return `Last updated ${date} by ${name}`;
  };

  const generatedAt = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());

  return (
    <div id="route-report-print" className="hidden print:block">
      <div className="route-report-print-page">
        <header className="route-report-print-header">
          <div>
            <p className="route-report-print-eyebrow">
              NAE Expeditions Knowledge Hub
            </p>
            <h1>{route.name}</h1>
            <p className="route-report-print-subtitle">
              Route Knowledge Report
            </p>
          </div>

          <div className="route-report-print-meta">
            <div>
              <strong>{reportItems.length}</strong>
              <span>route items</span>
            </div>
            <div>
              <strong>{notes.length}</strong>
              <span>knowledge points</span>
            </div>
            <div>
              <strong>{routeSections.length}</strong>
              <span>route sections</span>
            </div>
          </div>
        </header>

        <section className="route-report-print-warning">
          <strong>⚠️ Caution</strong>
          <p>
            This report only lists hazards and knowledge that have been
            imported into the Knowledge Hub and is not an exhaustive list of
            all possible hazards on the route. It is intended to highlight
            known possible issues and does not replace dynamic risk assessment
            whilst on the route.
          </p>
        </section>

        <section className="route-report-print-intro">
          <div>
            <strong>Route information</strong>
            <p>
              This report highlights NAE knowledge points and route sections
              located along or near the selected GPX route, ordered by their
              position along the route.
            </p>
          </div>
          <div className="route-report-print-generated">
            Generated {generatedAt}
          </div>
        </section>

        {reportItems.length === 0 ? (
          <div className="route-report-print-empty">
            No nearby knowledge items or route sections were found for this
            route.
          </div>
        ) : (
          <section>
            <div className="route-report-print-list">
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
                    <article
                      key={`section-${section.id}`}
                      className="route-report-print-item route-report-print-section"
                    >
                      <div className="route-report-print-number">
                        {index + 1}
                      </div>

                      <div className="route-report-print-item-content">
                        <div className="route-report-print-item-heading">
                          <div>
                            <p className="route-report-print-type">
                              Route Section
                            </p>
                            <h2>{section.title}</h2>
                          </div>

                          <span
                            className="route-report-print-guidance"
                            style={{ color: section.color }}
                          >
                            {label}
                          </span>
                        </div>

                        <p className="route-report-print-description">
                          {section.description}
                        </p>

                        <div className="route-report-print-meta-line">
                          <p className="route-report-print-distance">
                            {(
                              reportItem.item.distanceAlongRoute / 1000
                            ).toFixed(1)}{" "}
                            km along route
                          </p>
                          <p className="route-report-print-updated">
                            {formatUpdated(section.updatedAt, section.updatedBy)}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                }

                const item = reportItem.item;

                return (
                  <article
                    key={`note-${item.note.id}`}
                    className="route-report-print-item"
                  >
                    <div className="route-report-print-number">
                      {index + 1}
                    </div>

                    <div className="route-report-print-icon">
                      {markerIcons[item.note.category]}
                    </div>

                    <div className="route-report-print-item-content">
                      <div className="route-report-print-item-heading">
                        <div>
                          <p className="route-report-print-type">
                            {formatCategory(item.note.category)}
                          </p>
                          <h2>{item.note.title}</h2>
                        </div>
                      </div>

                      <p className="route-report-print-description">
                        {item.note.description}
                      </p>

                      <div className="route-report-print-meta-line">
                        <p className="route-report-print-distance">
                          {(item.distanceAlongRoute / 1000).toFixed(1)} km along
                          route
                        </p>
                        <p className="route-report-print-updated">
                          {formatUpdated(item.note.updatedAt, item.note.updatedBy)}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        <footer className="route-report-print-footer">
          <span>NAE Expeditions Knowledge Hub</span>
          <span>Route Knowledge Report · {route.name}</span>
        </footer>
      </div>
    </div>
  );
}
