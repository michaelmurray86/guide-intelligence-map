"use client";

import { useState } from "react";
import { parseGPX } from "@/lib/parseGPX";
import {
  createGuideSection,
  updateGuideSection,
  GUIDE_SECTION_COLORS,
} from "@/lib/guideSectionDatabase";
import {
  GuideSection,
  GuideSectionGuidanceLevel,
} from "@/Types/GuideSection";
import { GPXRoute } from "@/Types/GPXRoute";

type Props = {
  onCancel: () => void;
  onCreated?: (section: Awaited<ReturnType<typeof createGuideSection>>) => void;
  onUpdated?: (section: GuideSection | null) => void;
  onPreview: (route: GPXRoute | null) => void;
  createdBy?: string;
  existingSection?: GuideSection | null;
};

const levels: {
  value: GuideSectionGuidanceLevel;
  label: string;
  description: string;
}[] = [
  {
    value: "suitable",
    label: "Green — Suitable",
    description: "Suitable for groups.",
  },
  {
    value: "caution",
    label: "Orange — Caution",
    description: "Use caution and consider group ability.",
  },
  {
    value: "do_not_take",
    label: "Red — Do not take groups",
    description: "Instructors should not take groups along this section.",
  },
];

export default function RouteSectionEditor({
  onCancel,
  onCreated,
  onUpdated,
  onPreview,
  createdBy,
  existingSection,
}: Props) {
  const isEditing = Boolean(existingSection);
  const [route, setRoute] = useState<GPXRoute | null>(
    existingSection
      ? {
          name: existingSection.title,
          coordinates: existingSection.coordinates,
          geojson: {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: {
                  type: "LineString",
                  coordinates: existingSection.coordinates,
                },
                properties: {},
              },
            ],
          },
          previewColor:
            GUIDE_SECTION_COLORS[existingSection.guidanceLevel],
        }
      : null
  );
  const [title, setTitle] = useState(existingSection?.title ?? "");
  const [description, setDescription] = useState(
    existingSection?.description ?? ""
  );
  const [guidanceLevel, setGuidanceLevel] =
    useState<GuideSectionGuidanceLevel>(
      existingSection?.guidanceLevel ?? "caution"
    );
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setWorking(true);

    try {
      const parsed = await parseGPX(file);
      const previewRoute = {
        ...parsed,
        previewColor: GUIDE_SECTION_COLORS[guidanceLevel],
      };
      setRoute(previewRoute);
      setTitle(parsed.name);
      onPreview(previewRoute);
    } catch (err) {
      setRoute(null);
      onPreview(null);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to read this GPX file."
      );
    } finally {
      setWorking(false);
    }
  };

  const handleGuidanceChange = (
    level: GuideSectionGuidanceLevel
  ) => {
    setGuidanceLevel(level);

    if (route) {
      const updatedRoute = {
        ...route,
        previewColor: GUIDE_SECTION_COLORS[level],
      };
      setRoute(updatedRoute);
      onPreview(updatedRoute);
    }
  };

  const handleSave = async () => {
    if (!route) {
      setError("Import a GPX file first.");
      return;
    }

    if (!title.trim()) {
      setError("Enter a name for this Route Section.");
      return;
    }

    if (route.coordinates.length < 2) {
      setError("The Route Section does not contain enough coordinates.");
      return;
    }

    setError(null);
    setWorking(true);

    if (isEditing && existingSection) {
      const section = await updateGuideSection(existingSection.id, {
        title: title.trim(),
        description: description.trim(),
        guidanceLevel,
        updatedBy: createdBy,
      });

      setWorking(false);

      if (!section) {
        setError("The Route Section could not be updated.");
        return;
      }

      onPreview(null);
      onUpdated?.(section);
      return;
    }

    const section = await createGuideSection({
      title: title.trim(),
      description: description.trim(),
      coordinates: route.coordinates,
      guidanceLevel,
      createdBy,
    });

    setWorking(false);

    if (!section) {
      setError("The Route Section could not be saved.");
      return;
    }

    onPreview(null);
    onCreated?.(section);
  };

  return (
    <div className="space-y-4 rounded-lg border border-slate-300 bg-white p-4 shadow-sm">
      <div>
        <h2 className="font-semibold text-slate-900">
          {isEditing ? "Edit Route Section" : "Add Route Section"}
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          {isEditing
            ? "Update the name, description or guidance level. The route geometry stays unchanged."
            : "Import a GPX track or route, check it on the map, then save it as a centrally controlled Route Section."}
        </p>
      </div>

      {!isEditing && (
        <label className="block text-sm font-medium text-slate-700">
          GPX file
          <div className="mt-2">
            <input
              id="route-section-gpx"
              type="file"
              accept=".gpx,application/gpx+xml,application/xml,text/xml"
              onChange={handleFile}
              disabled={working}
              className="sr-only"
            />
            <label
              htmlFor="route-section-gpx"
              className="inline-flex cursor-pointer items-center rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              Choose GPX file
            </label>
            <p className="mt-2 text-xs text-slate-500">
              Click the button to select a .gpx file from your computer.
            </p>
          </div>
        </label>
      )}

      {route && (
        <div className="rounded border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          {isEditing ? (
            <>Editing route with {route.coordinates.length.toLocaleString()} coordinates.</>
          ) : (
            <>Imported {route.coordinates.length.toLocaleString()} coordinates.</>
          )}
          <br />
          The route is shown on the map as a preview.
        </div>
      )}

      <label className="block text-sm font-medium text-slate-700">
        Name
        <input
          value={title}
          onChange={event => setTitle(event.target.value)}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          placeholder="Route Section name"
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Guidance
        <select
          value={guidanceLevel}
          onChange={event =>
            handleGuidanceChange(
              event.target.value as GuideSectionGuidanceLevel
            )
          }
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
        >
          {levels.map(level => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
        <span
          className="mt-1 block h-2 rounded"
          style={{ backgroundColor: GUIDE_SECTION_COLORS[guidanceLevel] }}
        />
        <span className="mt-1 block text-xs text-slate-500">
          {levels.find(level => level.value === guidanceLevel)?.description}
        </span>
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Description
        <textarea
          value={description}
          onChange={event => setDescription(event.target.value)}
          rows={4}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          placeholder="What should instructors know about this section?"
        />
      </label>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={working}
          className="flex-1 rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={working || !route}
          className="flex-1 rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {working
            ? "Working..."
            : isEditing
              ? "Save Changes"
              : "Save Route Section"}
        </button>
      </div>
    </div>
  );
}
