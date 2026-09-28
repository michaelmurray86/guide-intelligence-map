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
  id: number,
  reason?: string
): Promise<boolean> {

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error(
      "Unable to identify the signed-in user for deletion request:",
      userError
    );
    return false;
  }

  const { error } =
    await supabase
      .from("guide_note_deletion_requests")
      .insert({
        guide_note_id: id,
        requested_by: user.id,
        reason: reason ?? null,
        status: "pending",
      });

  if (error) {

    console.error(
      "Error requesting guide note deletion:",
      JSON.stringify(error, null, 2)
    );

    return false;

  }

  return true;

}


export async function getPendingGuideNoteDeletionRequests() {
  const { data, error } = await supabase
    .from("guide_note_deletion_requests")
    .select("id, guide_note_id, requested_by, requested_at, reason, status")
    .eq("status", "pending")
    .order("requested_at", { ascending: true });

  if (error) {
    console.error(
      "Error loading guide note deletion requests:",
      JSON.stringify(error, null, 2)
    );
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  const noteIds = data.map(request => request.guide_note_id);

  const { data: notes, error: notesError } = await supabase
    .from("guide_notes")
    .select("id, title")
    .in("id", noteIds);

  if (notesError) {
    console.error(
      "Error loading guide notes for deletion requests:",
      JSON.stringify(notesError, null, 2)
    );
    return [];
  }

  const titleById = new Map(
    (notes ?? []).map(note => [note.id, note.title])
  );

  return data.map(request => ({
    id: request.id,
    guideNoteId: request.guide_note_id,
    requestedBy: request.requested_by,
    requestedAt: request.requested_at,
    reason: request.reason,
    status: request.status,
    noteTitle: titleById.get(request.guide_note_id) ?? "Unknown knowledge item",
  }));
}


export async function approveGuideNoteDeletion(
  requestId: number,
  reviewComment?: string
): Promise<boolean> {
  const { error } = await supabase.rpc(
    "approve_guide_note_deletion",
    {
      request_id: requestId,
      review_comment: reviewComment ?? null,
    }
  );

  if (error) {
    console.error(
      "Error approving guide note deletion:",
      JSON.stringify(error, null, 2)
    );
    return false;
  }

  return true;
}


export async function rejectGuideNoteDeletion(
  requestId: number,
  reviewComment?: string
): Promise<boolean> {
  const { error } = await supabase.rpc(
    "reject_guide_note_deletion",
    {
      request_id: requestId,
      review_comment: reviewComment ?? null,
    }
  );

  if (error) {
    console.error(
      "Error rejecting guide note deletion:",
      JSON.stringify(error, null, 2)
    );
    return false;
  }

  return true;
}
