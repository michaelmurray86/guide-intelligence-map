export type GuideSectionGuidanceLevel =
  | "suitable"
  | "caution"
  | "do_not_take";

export type GuideSection = {
  id: number;
  title: string;
  description: string;
  coordinates: [number, number][];
  guidanceLevel: GuideSectionGuidanceLevel;
  color?: string;
  photos?: string[];
  photoUrls?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  status?: string;
};
