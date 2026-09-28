import { DOMParser } from "xmldom";
import { GPXRoute } from "@/Types/GPXRoute";

type Coordinate = [number, number];

function localName(node: Element): string {
  return (node.localName || node.nodeName.split(":").pop() || "").toLowerCase();
}

function getElementsByLocalName(root: Document | Element, name: string): Element[] {
  return Array.from(root.getElementsByTagName("*")).filter(
    element => localName(element) === name
  );
}

function getFirstText(root: Document | Element, name: string): string | null {
  const element = getElementsByLocalName(root, name)[0];
  const value = element?.textContent?.trim();
  return value || null;
}

function extractPointCoordinates(
  elements: Element[],
  sourceName: string
): Coordinate[] {
  const coordinates: Coordinate[] = [];

  for (const element of elements) {
    const lat = Number(element.getAttribute("lat"));
    const lon = Number(element.getAttribute("lon"));

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon) ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180
    ) {
      continue;
    }

    // GPX stores attributes as lat/lon, while GeoJSON and MapLibre
    // require coordinates in [longitude, latitude] order.
    coordinates.push([lon, lat]);
  }

  if (coordinates.length < 2) {
    throw new Error(
      "The GPX file " + sourceName + " does not contain at least two valid route or track points."
    );
  }

  return coordinates;
}

export async function parseGPX(file: File): Promise<GPXRoute> {
  const text = await file.text();

  const xml = new DOMParser().parseFromString(text, "text/xml");

  const parserErrors = getElementsByLocalName(xml, "parsererror");
  if (parserErrors.length > 0) {
    throw new Error("The selected file is not valid GPX/XML.");
  }

  const trackPoints = getElementsByLocalName(xml, "trkpt");
  const routePoints = getElementsByLocalName(xml, "rtept");

  // Prefer recorded tracks. If a file only contains a planned GPX route,
  // fall back to its ordered route points.
  const pointElements =
    trackPoints.length >= 2 ? trackPoints : routePoints;

  const coordinates = extractPointCoordinates(
    pointElements,
    file.name
  );

  const metadataElements = getElementsByLocalName(xml, "metadata");
  const metadataName =
    metadataElements.length > 0
      ? getFirstText(metadataElements[0], "name")
      : null;

  const trackElements = getElementsByLocalName(xml, "trk");
  const routeElements = getElementsByLocalName(xml, "rte");

  const trackName =
    trackElements.length > 0
      ? getFirstText(trackElements[0], "name")
      : null;

  const routeName =
    routeElements.length > 0
      ? getFirstText(routeElements[0], "name")
      : null;

  const name =
    metadataName ??
    trackName ??
    routeName ??
    file.name.replace(/\.gpx$/i, "");

  const geojson: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates,
        },
        properties: {},
      },
    ],
  };

  return {
    name,
    coordinates,
    geojson,
  };
}
