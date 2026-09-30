import { supabase } from "@/lib/supabase";
import { Hut } from "@/Types/Hut";

export type HutEditPayload = Omit<
  Hut,
  "id" | "guideNoteId" | "updatedAt" | "createdAt"
>;

export type HutChangeRequest = {
  id: number;
  hutId: number;
  requestedBy: string;
  requestedAt: string;
  proposedData: HutEditPayload;
  status: "pending" | "approved" | "rejected";
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComment?: string;
};

function normalizeRequest(row: any): HutChangeRequest {
  return {
    id: row.id,
    hutId: row.hut_id,
    requestedBy: row.requested_by,
    requestedAt: row.requested_at,
    proposedData: row.proposed_data,
    status: row.status,
    reviewedBy: row.reviewed_by ?? undefined,
    reviewedAt: row.reviewed_at ?? undefined,
    reviewComment: row.review_comment ?? undefined,
  };
}

export async function submitHutChange(
  hutId: number,
  proposedData: HutEditPayload
): Promise<HutChangeRequest | null> {
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return null;
  }

  const { data, error } = await supabase
    .from("hut_change_requests")
    .insert({
      hut_id: hutId,
      requested_by: userData.user.id,
      proposed_data: proposedData,
    })
    .select("*")
    .single();

  if (error || !data) {
    console.error("Error submitting Hut change:", error);
    return null;
  }

  return normalizeRequest(data);
}

export async function getPendingHutChanges(): Promise<HutChangeRequest[]> {
  const { data, error } = await supabase
    .from("hut_change_requests")
    .select("*")
    .eq("status", "pending")
    .order("requested_at", { ascending: true });

  if (error) {
    console.error("Error loading pending Hut changes:", error);
    throw error;
  }

  return (data ?? []).map(normalizeRequest);
}

export async function reviewHutChange(
  requestId: number,
  decision: "approved" | "rejected",
  comment?: string
): Promise<HutChangeRequest | null> {
  const { data, error } = await supabase.rpc(
    "review_hut_change_request",
    {
      request_id: requestId,
      decision,
      comment: comment ?? null,
    }
  );

  if (error || !data) {
    console.error("Error reviewing Hut change:", error);
    return null;
  }

  return normalizeRequest(data);
}
