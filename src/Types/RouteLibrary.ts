import { GPXRoute } from "@/Types/GPXRoute";

export type RouteLibrary = {
  id: number;
  name: string;
  description: string;
  geojson: GeoJSON.FeatureCollection;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
};

export function routeLibraryToGPXRoute(
  route: RouteLibrary
): GPXRoute {
  const coordinates: [number, number][] = [];

  route.geojson.features.forEach(feature => {
    if (feature.geometry.type === "LineString") {
      coordinates.push(
        ...(feature.geometry.coordinates as [number, number][])
      );
    }

    if (feature.geometry.type === "MultiLineString") {
      feature.geometry.coordinates.forEach(line => {
        coordinates.push(
          ...(line as [number, number][])
        );
      });
    }
  });

  return {
    name: route.name,
    coordinates,
    geojson: route.geojson,
  };
}
