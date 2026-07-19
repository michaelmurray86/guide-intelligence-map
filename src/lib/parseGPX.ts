import { DOMParser } from "xmldom";
import { gpx } from "@tmcw/togeojson";
import { GPXRoute } from "@/types/GPXRoute";

export async function parseGPX(file: File): Promise<GPXRoute> {
  const text = await file.text();

  const xml = new DOMParser().parseFromString(
    text,
    "text/xml"
  );

  const geojson = gpx(xml);

  return {
    name: file.name.replace(".gpx", ""),
    geojson,
  };
}