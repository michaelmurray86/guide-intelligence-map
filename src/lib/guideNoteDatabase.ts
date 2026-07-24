import { supabase } from "@/lib/supabase";
import { GuideNote } from "@/types/GuideNote";

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


  return data as GuideNote[];

}