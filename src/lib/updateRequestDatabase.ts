import { supabase } from "@/lib/supabase";
import { HutEditPayload } from "@/lib/hutChangeDatabase";

export type UpdateRequest = {
  id: number; requestType: "edit" | "delete"; guideNoteId?: number; hutId?: number;
  requestedBy: string; requestedAt: string; reason?: string; proposedData?: HutEditPayload;
  currentData?: HutEditPayload; status: "pending" | "approved" | "rejected";
  noteTitle?: string; noteCategory?: string;
};

type HutRow = {
  id: number; name: string; short_description: string | null; elevation_m: number | null;
  sleeping_beds: number | null; sleeping_dormitories: number | null; winter_room_capacity: number | null;
  winter_room_details: string | null; opening_date: string | null; closing_date: string | null;
  showers: string | null; picnic_lunches: boolean | null; picnic_lunch_cost: string | null;
  dinner_time: string | null; water_drinkable: boolean | null; booking_url: string | null;
  phone: string | null; email: string | null; guardian_name: string | null; vendor: boolean | null;
  costs: string | null; guide_rate_offered: boolean | null; other_notes: string | null; photos: string[] | null;
  last_checked_at: string | null; last_checked_by: string | null;
};

function hutRowToEditPayload(row: HutRow): HutEditPayload {
  return {
    name: row.name, shortDescription: row.short_description ?? undefined, elevationM: row.elevation_m ?? undefined,
    sleepingBeds: row.sleeping_beds ?? undefined, sleepingDormitories: row.sleeping_dormitories ?? undefined,
    winterRoomCapacity: row.winter_room_capacity ?? undefined, winterRoomDetails: row.winter_room_details ?? undefined,
    openingDate: row.opening_date ?? undefined, closingDate: row.closing_date ?? undefined, showers: row.showers ?? undefined,
    picnicLunches: row.picnic_lunches ?? false, picnicLunchCost: row.picnic_lunch_cost ?? undefined, dinnerTime: row.dinner_time ?? undefined,
    waterDrinkable: row.water_drinkable ?? false, bookingUrl: row.booking_url ?? undefined, phone: row.phone ?? undefined,
    email: row.email ?? undefined, guardianName: row.guardian_name ?? undefined, vendor: row.vendor ?? false,
    costs: row.costs ?? undefined, guideRateOffered: row.guide_rate_offered ?? false, otherNotes: row.other_notes ?? undefined,
    photos: row.photos ?? [], lastCheckedAt: row.last_checked_at ?? undefined, lastCheckedBy: row.last_checked_by ?? undefined,
    updatedBy: undefined, createdBy: undefined,
  };
}

export async function getPendingUpdateRequests(): Promise<UpdateRequest[]> {
  const { data, error } = await supabase.from("update_requests")
    .select("id, request_type, guide_note_id, hut_id, requested_by, requested_at, reason, proposed_data, status, guide_notes(title, category)")
    .eq("status", "pending").order("requested_at", { ascending: true });
  if (error) { console.error("Error loading update requests:", error); throw error; }

  const rows = data ?? [];
  const hutIds = rows.map((row: any) => row.hut_id).filter((id): id is number => typeof id === "number");
  let hutsById = new Map<number, HutEditPayload>();

  if (hutIds.length > 0) {
    const { data: huts, error: hutsError } = await supabase.from("huts")
      .select("id, name, short_description, elevation_m, sleeping_beds, sleeping_dormitories, winter_room_capacity, winter_room_details, opening_date, closing_date, showers, picnic_lunches, picnic_lunch_cost, dinner_time, water_drinkable, booking_url, phone, email, guardian_name, vendor, costs, guide_rate_offered, other_notes, photos, last_checked_at, last_checked_by")
      .in("id", hutIds);
    if (hutsError) console.error("Error loading current Hut data for update requests:", hutsError);
    else hutsById = new Map((huts ?? []).map(row => [row.id, hutRowToEditPayload(row as HutRow)]));
  }

  return rows.map((row: any) => ({
    id: row.id, requestType: row.request_type, guideNoteId: row.guide_note_id ?? undefined, hutId: row.hut_id ?? undefined,
    requestedBy: row.requested_by, requestedAt: row.requested_at, reason: row.reason ?? undefined,
    proposedData: row.proposed_data ?? undefined, currentData: row.hut_id ? hutsById.get(row.hut_id) : undefined,
    status: row.status, noteTitle: row.guide_notes?.title ?? undefined, noteCategory: row.guide_notes?.category ?? undefined,
  }));
}

export async function reviewUpdateRequest(requestId: number, decision: "approved" | "rejected", comment?: string): Promise<boolean> {
  const { error } = await supabase.rpc("review_update_request", { request_id: requestId, decision, comment: comment ?? null });
  if (error) { console.error("Error reviewing update request:", error); return false; }
  return true;
}