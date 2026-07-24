import { supabase } from "@/lib/supabase";
import { GuideNote } from "@/Types/GuideNote";


export async function getGuideNotes(): Promise<GuideNote[]> {

  const { data, error } =
    await supabase
      .from("guide_notes")
      .select("*");


  if (error) {

    console.error(
      "Error loading guide notes:",
      error
    );

    return [];

  }


return data.map(note => ({
  ...note,

  createdAt: note.created_at,
  updatedAt: note.updated_at,

  createdBy: note.created_by,
  updatedBy: note.updated_by,
  approvedBy: note.approved_by,
  approvedAt: note.approved_at,
  status: note.status,

})) as GuideNote[];

}



export async function createGuideNote(
  note: Omit<GuideNote, "id">
): Promise<GuideNote | null> {

  const { data, error } =
    await supabase
      .from("guide_notes")
        .insert({

  category: note.category,
  title: note.title,
  description: note.description,
  longitude: note.longitude,
  latitude: note.latitude,
  severity: note.severity,
  photos: note.photos ?? [],

  created_at: note.createdAt,
  updated_at: note.updatedAt,

  created_by: note.createdBy ?? null,
  updated_by: note.updatedBy ?? null,

  approved_by: note.approvedBy ?? null,
  approved_at: note.approvedAt ?? null,

  status: note.status ?? "approved",

})
      .select()
      .single();


  if (error) {

    console.error(
      "Error creating guide note:",
      JSON.stringify(error, null, 2)
    );

    return null;

  }


  return {

    ...data,

    createdAt: data.created_at,
    updatedAt: data.updated_at,

  } as GuideNote;

}



export async function updateGuideNote(
  id: number,
  updates: Partial<GuideNote>,
  updatedBy?: string
): Promise<GuideNote | null> {


  const { data, error } =
    await supabase
      .from("guide_notes")
      .update({

  title: updates.title,
  description: updates.description,
  category: updates.category,
  longitude: updates.longitude,
  latitude: updates.latitude,
  severity: updates.severity,
  photos: updates.photos,

  updated_at:
    new Date().toISOString(),

  updated_by:
    updatedBy ?? null,

})
      .eq("id", id)
      .select()
      .single();



  if (error) {

    console.error(
      "Error updating guide note:",
      JSON.stringify(error, null, 2)
    );

    return null;

  }



  return {

    ...data,

    createdAt: data.created_at,
    updatedAt: data.updated_at,

  } as GuideNote;

}

export async function deleteGuideNote(
  id: number
): Promise<boolean> {


  const { error } =
    await supabase
      .from("guide_notes")
      .delete()
      .eq("id", id);


  if (error) {

    console.error(
      "Error deleting guide note:",
      JSON.stringify(error, null, 2)
    );

    return false;

  }


  return true;

}