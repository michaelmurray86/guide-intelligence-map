export type GPXRoute = {
  name: string;
  coordinates: [number, number][];
  geojson: GeoJSON.FeatureCollection;
  previewColor?: string;
};
