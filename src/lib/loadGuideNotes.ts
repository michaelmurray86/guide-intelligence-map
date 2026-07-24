import { supabase } from "./supabase";
import { GuideNote } from "@/Types/GuideNote";

export async function loadGuideNotesFromSupabase(): Promise<GuideNote[]> {

  const { data, error } = await supabase
    .from("guide_notes")
    .select("*");

  if (error) {
    console.error("Error loading guide notes:", error);
    return [];
  }


  return data.map(note => ({
    id: note.id,

    category: note.category,

    title: note.title,

    description: note.description,

    longitude: note.longitude,

    latitude: note.latitude,

    severity: note.severity ?? undefined,

    photos: note.photos ?? [],

    createdAt: note.created_at,

    updatedAt: note.updated_at,

  }));

}