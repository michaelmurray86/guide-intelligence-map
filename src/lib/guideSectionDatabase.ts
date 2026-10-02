import { supabase } from "@/lib/supabase";
import {
  GuideSection,
  GuideSectionGuidanceLevel,
} from "@/Types/GuideSection";
import { getGuideNotePhotoUrls } from "@/lib/guideNoteStorage";

export const GUIDE_SECTION_COLORS: Record<
  GuideSectionGuidanceLevel,
  string
> = {
  suitable: "#16a34a",
  caution: "#ea580c",
  do_not_take: "#dc2626",
};

async function normalizeSection(section: any): Promise<GuideSection> {
  const guidanceLevel =
    section.guidance_level as GuideSectionGuidanceLevel;
  const photos = section.photos ?? [];

  return {
    ...section,
    createdAt: section.created_at,
    updatedAt: section.updated_at,
    createdBy: section.created_by,
    updatedBy: section.updated_by,
    approvedBy: section.approved_by,
    approvedAt: section.approved_at,
    status: section.status,
    guidanceLevel,
    photos,
    photoUrls: await getGuideNotePhotoUrls(photos),
    // Guidance level is the source of truth for Route Section colour.
    color: GUIDE_SECTION_COLORS[guidanceLevel],
  } as GuideSection;
}

export async function getGuideSections(): Promise<GuideSection[]> {
  const { data, error } = await supabase
    .from("guide_sections")
    .select("*")
    .order("id");

  if (error) {
    console.error(
      "Error loading guide sections:",
      JSON.stringify(error, null, 2)
    );
    throw error;
  }

  return Promise.all((data ?? []).map(normalizeSection));
}

export async function createGuideSection(input: {
  title: string;
  description: string;
  coordinates: [number, number][];
  guidanceLevel: GuideSectionGuidanceLevel;
  createdBy?: string;
  photos?: string[];
}): Promise<GuideSection | null> {
  const now = new Date().toISOString();

  const { data: section, error } = await supabase
    .from("guide_sections")
    .insert({
      title: input.title,
      description: input.description,
      coordinates: input.coordinates,
      guidance_level: input.guidanceLevel,
      photos: input.photos ?? [],
      color: GUIDE_SECTION_COLORS[input.guidanceLevel],
      created_at: now,
      updated_at: now,
      created_by: input.createdBy ?? null,
      updated_by: input.createdBy ?? null,
      status: "approved",
    })
    .select("*")
    .single();

  if (error || !section) {
    console.error(
      "Error creating guide section:",
      JSON.stringify(error, null, 2)
    );
    return null;
  }

  return normalizeSection(section);
}

export async function updateGuideSection(
  id: number,
  input: {
    title: string;
    description: string;
    guidanceLevel: GuideSectionGuidanceLevel;
    updatedBy?: string;
    photos?: string[];
  }
): Promise<GuideSection | null> {
  const now = new Date().toISOString();

  const { data: section, error } = await supabase
    .from("guide_sections")
    .update({
      title: input.title,
      description: input.description,
      guidance_level: input.guidanceLevel,
      photos: input.photos,
      // Keep the stored colour aligned with the guidance level.
      color: GUIDE_SECTION_COLORS[input.guidanceLevel],
      updated_at: now,
      updated_by: input.updatedBy ?? null,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !section) {
    console.error(
      "Error updating guide section:",
      JSON.stringify(error, null, 2)
    );
    return null;
  }

  return normalizeSection(section);
}

export async function deleteGuideSection(id: number): Promise<boolean> {
  const { error } = await supabase
    .from("guide_sections")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(
      "Error deleting guide section:",
      JSON.stringify(error, null, 2)
    );
    return false;
  }

  return true;
}
