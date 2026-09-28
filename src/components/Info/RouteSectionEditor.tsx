"use client";

import { useState } from "react";
import { parseGPX } from "@/lib/parseGPX";
import {
  createGuideSection,
  GUIDE_SECTION_COLORS,
} from "@/lib/guideSectionDatabase";
import {
  GuideSectionGuidanceLevel,
} from "@/Types/GuideSection";
import { GPXRoute } from "@/Types/GPXRoute";

type Props = {
  onCancel: () => void;
  onCreated: (section: Awaited<ReturnType<typeof createGuideSection>>) => void;
  onPreview: (route: GPXRoute | null) => void;
  createdBy?: string;
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
  onPreview,
  createdBy,
}: Props) {
  const [route, setRoute] = useState<GPXRoute | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [guidanceLevel, setGuidanceLevel] =
    useState<GuideSectionGuidanceLevel>("caution");
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
      setRoute(parsed);
      setTitle(parsed.name);
      onPreview(parsed);
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
      setError("The imported route does not contain enough coordinates.");
      return;
    }

    setError(null);
    setWorking(true);

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
    onCreated(section);
  };

  return (
    <div className="space-y-4 rounded-lg border border-slate-300 bg-white p-4 shadow-sm">
      <div>
        <h2 className="font-semibold text-slate-900">
          Add Route Section
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Import a GPX track or route, check it on the map, then save it as a
          centrally controlled Route Section.
        </p>
      </div>

      <label className="block text-sm font-medium text-slate-700">
        GPX file
        <input
          type="file"
          accept=".gpx,application/gpx+xml,application/xml,text/xml"
          onChange={handleFile}
          disabled={working}
          className="mt-1 block w-full text-sm"
        />
      </label>

      {route && (
        <div className="rounded border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          Imported {route.coordinates.length.toLocaleString()} coordinates.
          <br />
          Preview uses [longitude, latitude] coordinates.
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
            setGuidanceLevel(
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
          {working ? "Working..." : "Save Route Section"}
        </button>
      </div>
    </div>
  );
}
