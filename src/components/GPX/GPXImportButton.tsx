"use client";

import { useRef } from "react";
import { GPXRoute } from "@/types/GPXRoute";
import { parseGPX } from "@/lib/parseGPX";

type Props = {
  gpxRoute: GPXRoute | null;

  setGpxRoute: React.Dispatch<
    React.SetStateAction<GPXRoute | null>
  >;
};

export default function GPXImportButton({
  gpxRoute,
  setGpxRoute,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const route = await parseGPX(file);
      setGpxRoute(route);
    } catch (error) {
      console.error(
        "Failed to import GPX:",
        error
      );

      alert("Unable to import GPX file.");
    }

    event.target.value = "";
  };

  return (
    <div className="space-y-3">

      <button
        onClick={() =>
          inputRef.current?.click()
        }
        className="w-full rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 transition"
      >
        📂 Import GPX
      </button>


      {gpxRoute && (
        <>

          <div className="rounded-md bg-white border border-slate-300 p-3 text-sm">

            <div className="font-semibold">
              🥾 {gpxRoute.name}
            </div>

            <button
              onClick={() =>
                setGpxRoute(null)
              }
              className="mt-3 w-full rounded-md bg-red-500 px-3 py-2 text-white hover:bg-red-600 transition"
            >
              ❌ Remove Route
            </button>

          </div>

        </>
      )}


      <input
        ref={inputRef}
        type="file"
        accept=".gpx"
        onChange={handleImport}
        className="hidden"
      />

    </div>
  );
}