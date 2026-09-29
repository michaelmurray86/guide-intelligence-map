import { supabase } from "@/lib/supabase";
import { RouteLibrary } from "@/Types/RouteLibrary";

function normalizeRoute(route: any): RouteLibrary {
  return {
    ...route,
    createdAt: route.created_at,
    updatedAt: route.updated_at,
    createdBy: route.created_by,
    updatedBy: route.updated_by,
    geojson: route.geojson as GeoJSON.FeatureCollection,
  };
}

export async function getRouteLibrary(): Promise<RouteLibrary[]> {
  const { data, error } = await supabase
    .from("route_library")
    .select("*")
    .order("name");

  if (error) {
    console.error(
      "Error loading route library:",
      JSON.stringify(error, null, 2)
    );
    return [];
  }

  return (data ?? []).map(normalizeRoute);
}

export async function createRouteLibraryRoute(input: {
  name: string;
  description: string;
  geojson: GeoJSON.FeatureCollection;
  createdBy?: string;
}): Promise<RouteLibrary | null> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("route_library")
    .insert({
      name: input.name,
      description: input.description,
      geojson: input.geojson,
      created_at: now,
      updated_at: now,
      created_by: input.createdBy ?? null,
      updated_by: input.createdBy ?? null,
    })
    .select("*")
    .single();

  if (error || !data) {
    console.error(
      "Error creating route library route:",
      JSON.stringify(error, null, 2)
    );
    return null;
  }

  return normalizeRoute(data);
}

export async function updateRouteLibraryRoute(
  id: number,
  input: {
    name: string;
    description: string;
    geojson?: GeoJSON.FeatureCollection;
    updatedBy?: string;
  }
): Promise<RouteLibrary | null> {
  const now = new Date().toISOString();

  const updates: Record<string, unknown> = {
    name: input.name,
    description: input.description,
    updated_at: now,
    updated_by: input.updatedBy ?? null,
  };

  if (input.geojson) {
    updates.geojson = input.geojson;
  }

  const { data, error } = await supabase
    .from("route_library")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    console.error(
      "Error updating route library route:",
      JSON.stringify(error, null, 2)
    );
    return null;
  }

  return normalizeRoute(data);
}

export async function deleteRouteLibraryRoute(
  id: number
): Promise<boolean> {
  const { error } = await supabase
    .from("route_library")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(
      "Error deleting route library route:",
      JSON.stringify(error, null, 2)
    );
    return false;
  }

  return true;
}
