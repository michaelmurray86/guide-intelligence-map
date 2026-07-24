import { supabase } from "@/lib/supabase";
import { GuideSection } from "@/types/GuideSection";


export async function getGuideSections(): Promise<GuideSection[]> {


  const { data, error } =
    await supabase
      .from("guide_sections")
      .select("*");


  if(error){

    console.error(
      "Error loading guide sections:",
      error
    );

    return [];

  }


return data.map(section => ({
  ...section,

  createdAt:
    section.created_at,

  updatedAt:
    section.updated_at,

  createdBy:
    section.created_by,

  updatedBy:
    section.updated_by,

  approvedBy:
    section.approved_by,

  approvedAt:
    section.approved_at,

  status:
    section.status,

})) as GuideSection[];

}