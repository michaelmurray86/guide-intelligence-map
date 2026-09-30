import { supabase } from "@/lib/supabase";
import { Hut } from "@/Types/Hut";

type HutRow = {
  id: number;
  guide_note_id: number;
  name: string;
  alternative_names: string[] | null;
  country: string | null;
  region: string | null;
  latitude: number | null;
  longitude: number | null;
  elevation_m: number | null;
  summer_access: string | null;
  winter_access: string | null;
  approach_routes: string | null;
  typical_approach_time: string | null;
  approach_difficulty: string | null;
  seasonal_restrictions: string | null;
  sleeping_capacity: number | null;
  winter_room: string | null;
  food_and_meals: string | null;
  picnic_lunches: boolean | null;
  water: string | null;
  water_drinkable: boolean | null;
  toilets: string | null;
  showers: string | null;
  electricity: string | null;
  wifi: string | null;
  cooking: string | null;
  blankets_mattresses: string | null;
  booking_required: boolean | null;
  booking_url: string | null;
  phone: string | null;
  email: string | null;
  vendor: boolean | null;
  vendor_status_expires_at: string | null;
  guide_rate_offered: boolean | null;
  guardian_name: string | null;
  guardian_email: string | null;
  guardian_phone: string | null;
  max_capacity: number | null;
  emergency_information: string | null;
  nearby_hazards: string | null;
  useful_route_information: string | null;
  instructor_notes: string | null;
  photos: string[] | null;
  last_checked_at: string | null;
  last_checked_by: string | null;
  source: string | null;
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
    alternativeNames: row.alternative_names ?? [],
    country: row.country ?? undefined,
    region: row.region ?? undefined,
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
    elevationM: row.elevation_m ?? undefined,
    summerAccess: row.summer_access ?? undefined,
    winterAccess: row.winter_access ?? undefined,
    approachRoutes: row.approach_routes ?? undefined,
    typicalApproachTime: row.typical_approach_time ?? undefined,
    approachDifficulty: row.approach_difficulty ?? undefined,
    seasonalRestrictions: row.seasonal_restrictions ?? undefined,
    sleepingCapacity: row.sleeping_capacity ?? undefined,
    winterRoom: row.winter_room ?? undefined,
    foodAndMeals: row.food_and_meals ?? undefined,
    picnicLunches: row.picnic_lunches ?? undefined,
    water: row.water ?? undefined,
    waterDrinkable: row.water_drinkable ?? undefined,
    toilets: row.toilets ?? undefined,
    showers: row.showers ?? undefined,
    electricity: row.electricity ?? undefined,
    wifi: row.wifi ?? undefined,
    cooking: row.cooking ?? undefined,
    blanketsMattresses: row.blankets_mattresses ?? undefined,
    bookingRequired: row.booking_required ?? undefined,
    bookingUrl: row.booking_url ?? undefined,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    vendor: row.vendor ?? undefined,
    vendorStatusExpiresAt: row.vendor_status_expires_at ?? undefined,
    guideRateOffered: row.guide_rate_offered ?? undefined,
    guardianName: row.guardian_name ?? undefined,
    guardianEmail: row.guardian_email ?? undefined,
    guardianPhone: row.guardian_phone ?? undefined,
    maxCapacity: row.max_capacity ?? undefined,
    emergencyInformation: row.emergency_information ?? undefined,
    nearbyHazards: row.nearby_hazards ?? undefined,
    usefulRouteInformation: row.useful_route_information ?? undefined,
    instructorNotes: row.instructor_notes ?? undefined,
    photos: row.photos ?? [],
    lastCheckedAt: row.last_checked_at ?? undefined,
    lastCheckedBy: row.last_checked_by ?? undefined,
    source: row.source ?? undefined,
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

  return ((data ?? []) as HutRow[]).map(normalizeHut);
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

  return data ? normalizeHut(data as HutRow) : null;
}
