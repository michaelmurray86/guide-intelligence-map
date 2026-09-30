import { supabase } from "@/lib/supabase";
import { HutEditPayload } from "@/lib/hutChangeDatabase";

export type UpdateRequest = {
  id: number;
  requestType: "edit" | "delete";
  guideNoteId?: number;
  hutId?: number;
  requestedBy: string;
  requestedAt: string;
  reason?: string;
  proposedData?: HutEditPayload;
  status: "pending" | "approved" | "rejected";
};

export async function getPendingUpdateRequests(): Promise<UpdateRequest[]> {
  const { data, error } = await supabase
    .from("update_requests")
    .select("id, request_type, guide_note_id, hut_id, requested_by, requested_at, reason, proposed_data, status, guide_notes(title)")
    .eq("status", "pending")
    .order("requested_at", { ascending: true });

  if (error) {
    console.error("Error loading update requests:", error);
    throw error;
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    requestType: row.request_type,
    guideNoteId: row.guide_note_id ?? undefined,
    hutId: row.hut_id ?? undefined,
    requestedBy: row.requested_by,
    requestedAt: row.requested_at,
    reason: row.reason ?? row.guide_notes?.title,
    proposedData: row.proposed_data ?? undefined,
    status: row.status,
    noteTitle: row.guide_notes?.title ?? undefined,
  }));
}

export async function reviewUpdateRequest(
  requestId: number,
  decision: "approved" | "rejected",
  comment?: string
): Promise<boolean> {
  const { error } = await supabase.rpc("review_update_request", {
    request_id: requestId,
    decision,
    comment: comment ?? null,
  });

  if (error) {
    console.error("Error reviewing update request:", error);
    return false;
  }

  return true;
}
