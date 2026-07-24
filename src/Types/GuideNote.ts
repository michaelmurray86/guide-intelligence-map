export type GuideNoteCategory =
  | "water"
  | "hazard"
  | "hut"
  | "cafe"
  | "toilet"
  | "snow"
  | "information";

export type GuideNote = {
  id: number;
  category: GuideNoteCategory;
  title: string;
  description: string;
  longitude: number;
  latitude: number;
  severity?: "low" | "medium" | "high";
  photos?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  status?: string;
};