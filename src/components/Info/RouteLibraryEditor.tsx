"use client";

import { useState } from "react";

import { parseGPX } from "@/lib/parseGPX";
import {
  createRouteLibraryRoute,
  updateRouteLibraryRoute,
} from "@/lib/routeLibraryDatabase";
import { RouteLibrary } from "@/Types/RouteLibrary";
import { GPXRoute } from "@/Types/GPXRoute";

type Props = {
  existingRoute?: RouteLibrary | null;
  onCancel: () => void;
  onCreated?: (route: RouteLibrary | null) => void;
  onUpdated?: (route: RouteLibrary | null) => void;
  createdBy?: string;
};

export default function RouteLibraryEditor({
  existingRoute,
  onCancel,
  onCreated,
  onUpdated,
  createdBy,
}: Props) {
  const isEditing = Boolean(existingRoute);

  const [route, setRoute] = useState<GPXRoute | null>(
    existingRoute
      ? {
          name: existingRoute.name,
          coordinates: existingRoute.geojson.features.flatMap(feature => {
            if (feature.geometry.type === "LineString") {
              return feature.geometry.coordinates as [number, number][];
            }

            if (feature.geometry.type === "MultiLineString") {
              return feature.geometry.coordinates.flat() as [number, number][];
            }

            return [];
          }),
          geojson: existingRoute.geojson,
        }
      : null
  );

  const [name, setName] = useState(existingRoute?.name ?? "");
  const [description, setDescription] = useState(
    existingRoute?.description ?? ""
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
      setRoute(parsed);
      if (!name.trim()) {
        setName(parsed.name);
      }
    } catch (err) {
      setRoute(null);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to read this GPX file."
      );
    } finally {
      setWorking(false);
      event.target.value = "";
    }
  };

  const handleSave = async () => {
    if (!route) {
      setError(
        isEditing
          ? "Import a replacement GPX file, or keep the existing route."
          : "Import a GPX file first."
      );
      return;
    }

    if (!name.trim()) {
      setError("Enter a name for this route.");
      return;
    }

    if (route.coordinates.length < 2) {
      setError("The route does not contain enough coordinates.");
      return;
    }

    setError(null);
    setWorking(true);

    const saved = isEditing && existingRoute
      ? await updateRouteLibraryRoute(existingRoute.id, {
          name: name.trim(),
          description: description.trim(),
          geojson: route.geojson,
          updatedBy: createdBy,
        })
      : await createRouteLibraryRoute({
          name: name.trim(),
          description: description.trim(),
          geojson: route.geojson,
          createdBy,
        });

    setWorking(false);

    if (!saved) {
      setError(
        isEditing
          ? "The route could not be updated. Check that the route name is unique."
          : "The route could not be saved. Check that the route name is unique."
      );
      return;
    }

    if (isEditing) {
      onUpdated?.(saved);
    } else {
      onCreated?.(saved);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border border-slate-300 bg-white p-4 shadow-sm">
      <div>
        <h2 className="font-semibold text-slate-900">
          {isEditing ? "Edit Library Route" : "Add Library Route"}
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          {isEditing
            ? "Update the route name, description or GPX geometry."
            : "Import a GPX file and save it as a centrally managed standard route."}
        </p>
      </div>

      <div className="block text-sm font-medium text-slate-700">
        GPX file
        <div className="mt-2">
          <input
            id="route-library-gpx"
            type="file"
            accept=".gpx,application/gpx+xml,application/xml,text/xml"
            onChange={handleFile}
            disabled={working}
            className="sr-only"
          />
          <label
            htmlFor="route-library-gpx"
            className="inline-flex cursor-pointer items-center rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            {isEditing ? "Replace GPX file" : "Choose GPX file"}
          </label>
        </div>
      </div>

      {route && (
        <div className="rounded border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          {route.coordinates.length.toLocaleString()} route coordinates loaded.
        </div>
      )}

      <label className="block text-sm font-medium text-slate-700">
        Name
        <input
          value={name}
          onChange={event => setName(event.target.value)}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          placeholder="e.g. Experience Switzerland"
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Description
        <textarea
          value={description}
          onChange={event => setDescription(event.target.value)}
          rows={3}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          placeholder="Brief description for instructors."
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
          {working ? "Working..." : isEditing ? "Save Changes" : "Save Route"}
        </button>
      </div>
    </div>
  );
}
