import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});


async function importGuideSections() {

  const { guideSections } =
    await import("../src/data/guideSections");

  const { supabase } =
    await import("../src/lib/supabase");


  const sections = guideSections.map(section => ({

    title: section.title,

    description: section.description,

    coordinates: section.coordinates,

    color: section.color,

    created_at: new Date().toISOString(),

    updated_at: new Date().toISOString(),

  }));


  const { data, error } =
    await supabase
      .from("guide_sections")
      .insert(sections)
      .select();


  if(error){

    console.error(
      "Import failed:",
      error
    );

    return;

  }


  console.log(
    "Imported sections:",
    data
  );

}


importGuideSections();