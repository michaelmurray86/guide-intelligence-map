export type GuideNote = {
  id: number;
  category: "water" | "hazard" | "hut" | "cafe" | "information";
  title: string;
 description: string;
 longitude: number;
 latitude: number;
 updated: string;
};