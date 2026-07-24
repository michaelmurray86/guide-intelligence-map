import { createClient } from "@supabase/supabase-js";
import { guideNotes } from "../src/data/guideNotes";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

async function importGuideNotes() {
  const rows = guideNotes.map((note) => ({
    category: note.category,
    title: note.title,
    description: note.description,
    longitude: note.longitude,
    latitude: note.latitude,
    severity: note.severity ?? null,
    photos: note.photos ?? [],
    created_at: note.createdAt,
    updated_at: note.updatedAt,
  }));

  const { data, error } = await supabase
    .from("guide_notes")
    .insert(rows)
    .select();

  if (error) {
    console.error(error);
    return;
  }

  console.log(`Imported ${data.length} guide notes.`);
}

importGuideNotes();