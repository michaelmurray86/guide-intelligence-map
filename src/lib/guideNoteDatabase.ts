import { supabase } from "@/lib/supabase";
import { GuideNote } from "@/Types/GuideNote";
import { getGuideNotePhotoUrls } from "@/lib/guideNoteStorage";


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

    throw error;

  }


  return Promise.all(
    data.map(async note => {

      const photos = note.photos ?? [];

      return {
        ...note,

        createdAt: note.created_at,
        updatedAt: note.updated_at,

        createdBy: note.created_by,
        updatedBy: note.updated_by,
        approvedBy: note.approved_by,
        approvedAt: note.approved_at,
        status: note.status,

        photos,
        photoUrls: await getGuideNotePhotoUrls(photos),

      } as GuideNote;

    })
  );

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

    createdBy: data.created_by,
    updatedBy: data.updated_by,
    approvedBy: data.approved_by,
    approvedAt: data.approved_at,
    status: data.status,
    photos: data.photos ?? [],
    photoUrls: [],

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



  const photos = data.photos ?? [];

  return {

    ...data,

    createdAt: data.created_at,
    updatedAt: data.updated_at,

    createdBy: data.created_by,
    updatedBy: data.updated_by,
    approvedBy: data.approved_by,
    approvedAt: data.approved_at,
    status: data.status,
    photos,
    photoUrls: await getGuideNotePhotoUrls(photos),

  } as GuideNote;

}


export async function deleteGuideNote(
  id: number,
  reason?: string
): Promise<boolean> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Unable to identify the signed-in user for update request:", userError);
    return false;
  }

  const { data: existingRequest, error: existingRequestError } = await supabase
    .from("update_requests")
    .select("id")
    .eq("request_type", "delete")
    .eq("guide_note_id", id)
    .eq("requested_by", user.id)
    .eq("status", "pending")
    .maybeSingle();

  if (existingRequestError) {
    console.error("Unable to check for an existing update request:", existingRequestError);
    return false;
  }

  if (existingRequest) return true;

  const { error } = await supabase
    .from("update_requests")
    .insert({
      request_type: "delete",
      guide_note_id: id,
      requested_by: user.id,
      reason: reason ?? null,
      status: "pending",
    });

  if (error) {
    console.error("Error requesting guide note deletion:", error);
    return false;
  }

  return true;
}

export async function hasPendingGuideNoteDeletionRequest(id: number): Promise<boolean> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return false;

  const { data, error } = await supabase
    .from("update_requests")
    .select("id")
    .eq("request_type", "delete")
    .eq("guide_note_id", id)
    .eq("requested_by", user.id)
    .eq("status", "pending")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error checking update request:", error);
    return false;
  }

  return !!data;
}

export async function getPendingGuideNoteDeletionRequests() {
  const { data, error } = await supabase
    .from("update_requests")
    .select("id, guide_note_id, requested_by, requested_at, reason, status")
    .eq("request_type", "delete")
    .eq("status", "pending")
    .order("requested_at", { ascending: true });

  if (error) {
    console.error("Error loading update requests:", error);
    return [];
  }

  return (data ?? []).map(request => ({
    id: request.id,
    guideNoteId: request.guide_note_id,
    requestedBy: request.requested_by,
    requestedAt: request.requested_at,
    reason: request.reason,
    status: request.status,
    noteTitle: "Knowledge item",
  }));
}

export async function approveGuideNoteDeletion(
  requestId: number,
  reviewComment?: string
): Promise<boolean> {
  const { error } = await supabase.rpc("review_update_request", {
    request_id: requestId,
    decision: "approved",
    comment: reviewComment ?? null,
  });

  if (error) {
    console.error("Error approving update request:", error);
    return false;
  }

  return true;
}

export async function rejectGuideNoteDeletion(
  requestId: number,
  reviewComment?: string
): Promise<boolean> {
  const { error } = await supabase.rpc("review_update_request", {
    request_id: requestId,
    decision: "rejected",
    comment: reviewComment ?? null,
  });

  if (error) {
    console.error("Error rejecting update request:", error);
    return false;
  }

  return true;
}
