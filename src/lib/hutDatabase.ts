import { supabase } from "@/lib/supabase";
import { Hut } from "@/Types/Hut";
import { getGuideNotePhotoUrls } from "@/lib/guideNoteStorage";

type HutRow = {
  id: number;
  guide_note_id: number;
  name: string;
  short_description: string | null;
  elevation_m: number | null;
  sleeping_beds: number | null;
  sleeping_dormitories: number | null;
  winter_room_capacity: number | null;
  winter_room_details: string | null;
  opening_date: string | null;
  closing_date: string | null;
  showers: string | null;
  picnic_lunches: boolean | null;
  picnic_lunch_cost: string | null;
  dinner_time: string | null;
  water_drinkable: boolean | null;
  booking_url: string | null;
  phone: string | null;
  email: string | null;
  guardian_name: string | null;
  vendor: boolean | null;
  costs: string | null;
  guide_rate_offered: boolean | null;
  other_notes: string | null;
  photos: string[] | null;
  last_checked_at: string | null;
  last_checked_by: string | null;
  updated_at: string;
  updated_by: string | null;
  created_at: string;
  created_by: string | null;
};

function normalizeHut(row: HutRow): Hut {
  return {
    id: row.id,
    guideNoteId: row.guide_note_id,
    name: row.name,
    shortDescription: row.short_description ?? undefined,
    elevationM: row.elevation_m ?? undefined,
    sleepingBeds: row.sleeping_beds ?? undefined,
    sleepingDormitories: row.sleeping_dormitories ?? undefined,
    winterRoomCapacity: row.winter_room_capacity ?? undefined,
    winterRoomDetails: row.winter_room_details ?? undefined,
    openingDate: row.opening_date ?? undefined,
    closingDate: row.closing_date ?? undefined,
    showers: row.showers ?? undefined,
    picnicLunches: row.picnic_lunches ?? undefined,
    picnicLunchCost: row.picnic_lunch_cost ?? undefined,
    dinnerTime: row.dinner_time ?? undefined,
    waterDrinkable: row.water_drinkable ?? undefined,
    bookingUrl: row.booking_url ?? undefined,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    guardianName: row.guardian_name ?? undefined,
    vendor: row.vendor ?? undefined,
    costs: row.costs ?? undefined,
    guideRateOffered: row.guide_rate_offered ?? undefined,
    otherNotes: row.other_notes ?? undefined,
    photos: row.photos ?? [],
    lastCheckedAt: row.last_checked_at ?? undefined,
    lastCheckedBy: row.last_checked_by ?? undefined,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by ?? undefined,
    createdAt: row.created_at,
    createdBy: row.created_by ?? undefined,
  };
}

export async function getHuts(): Promise<Hut[]> {
  const { data, error } = await supabase
    .from("huts")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error loading huts:", JSON.stringify(error, null, 2));
    throw error;
  }

  return Promise.all(((data ?? []) as HutRow[]).map(async row => ({
    ...normalizeHut(row),
    photoUrls: await getGuideNotePhotoUrls(row.photos ?? []),
  })));
}

export async function upsertHut(
  guideNoteId: number,
  input: Omit<Hut, "id" | "guideNoteId" | "updatedAt" | "createdAt"> & {
    updatedBy?: string;
    createdBy?: string;
  }
): Promise<Hut | null> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("huts")
    .upsert(
      {
        guide_note_id: guideNoteId,
        name: input.name,
        short_description: input.shortDescription ?? null,
        elevation_m: input.elevationM ?? null,
        sleeping_beds: input.sleepingBeds ?? null,
        sleeping_dormitories: input.sleepingDormitories ?? null,
        winter_room_capacity: input.winterRoomCapacity ?? null,
        winter_room_details: input.winterRoomDetails ?? null,
        opening_date: input.openingDate ?? null,
        closing_date: input.closingDate ?? null,
        showers: input.showers ?? null,
        picnic_lunches: input.picnicLunches ?? null,
        picnic_lunch_cost: input.picnicLunchCost ?? null,
        dinner_time: input.dinnerTime ?? null,
        water_drinkable: input.waterDrinkable ?? null,
        booking_url: input.bookingUrl ?? null,
        phone: input.phone ?? null,
        email: input.email ?? null,
        guardian_name: input.guardianName ?? null,
        vendor: input.vendor ?? null,
        costs: input.costs ?? null,
        guide_rate_offered: input.guideRateOffered ?? null,
        other_notes: input.otherNotes ?? null,
        photos: input.photos ?? [],
        last_checked_at: input.lastCheckedAt ?? null,
        last_checked_by: input.lastCheckedBy ?? null,
        updated_at: now,
        updated_by: input.updatedBy ?? null,
        created_by: input.createdBy ?? null,
      },
      { onConflict: "guide_note_id" }
    )
    .select("*")
    .single();

  if (error || !data) {
    console.error("Error saving hut:", JSON.stringify(error, null, 2));
    return null;
  }

  return normalizeHut(data as HutRow);
}

export async function getHutByGuideNoteId(
  guideNoteId: number
): Promise<Hut | null> {
  const { data, error } = await supabase
    .from("huts")
    .select("*")
    .eq("guide_note_id", guideNoteId)
    .maybeSingle();

  if (error) {
    console.error("Error loading hut:", JSON.stringify(error, null, 2));
    throw error;
  }

  return data ? {
    ...normalizeHut(data as HutRow),
    photoUrls: await getGuideNotePhotoUrls((data as HutRow).photos ?? []),
  } : null;
}
