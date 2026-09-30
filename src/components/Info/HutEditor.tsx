"use client";

import { useState } from "react";

import { upsertHut } from "@/lib/hutDatabase";
import { Hut } from "@/Types/Hut";

type Props = {
  guideNoteId: number;
  guideNoteTitle: string;
  existingHut?: Hut | null;
  onCancel: () => void;
  onSaved?: (hut: Hut) => void;
  updatedBy?: string;
};

type FormState = {
  name: string;
  alternativeNames: string;
  country: string;
  region: string;
  latitude: string;
  longitude: string;
  elevationM: string;
  summerAccess: string;
  winterAccess: string;
  approachRoutes: string;
  typicalApproachTime: string;
  approachDifficulty: string;
  seasonalRestrictions: string;
  sleepingCapacity: string;
  winterRoom: string;
  foodAndMeals: string;
  picnicLunches: boolean;
  water: string;
  waterDrinkable: boolean;
  toilets: string;
  showers: string;
  electricity: string;
  wifi: string;
  cooking: string;
  blanketsMattresses: string;
  bookingRequired: boolean;
  bookingUrl: string;
  phone: string;
  email: string;
  vendor: boolean;
  vendorStatusExpiresAt: string;
  guideRateOffered: boolean;
  guardianName: string;
  guardianEmail: string;
  guardianPhone: string;
  maxCapacity: string;
  emergencyInformation: string;
  nearbyHazards: string;
  usefulRouteInformation: string;
  instructorNotes: string;
  lastCheckedAt: string;
  source: string;
};

function initialState(
  hut: Hut | null | undefined,
  title: string
): FormState {
  return {
    name: hut?.name ?? title,
    alternativeNames: hut?.alternativeNames.join(", ") ?? "",
    country: hut?.country ?? "",
    region: hut?.region ?? "",
    latitude: hut?.latitude?.toString() ?? "",
    longitude: hut?.longitude?.toString() ?? "",
    elevationM: hut?.elevationM?.toString() ?? "",
    summerAccess: hut?.summerAccess ?? "",
    winterAccess: hut?.winterAccess ?? "",
    approachRoutes: hut?.approachRoutes ?? "",
    typicalApproachTime: hut?.typicalApproachTime ?? "",
    approachDifficulty: hut?.approachDifficulty ?? "",
    seasonalRestrictions: hut?.seasonalRestrictions ?? "",
    sleepingCapacity: hut?.sleepingCapacity?.toString() ?? "",
    winterRoom: hut?.winterRoom ?? "",
    foodAndMeals: hut?.foodAndMeals ?? "",
    picnicLunches: hut?.picnicLunches ?? false,
    water: hut?.water ?? "",
    waterDrinkable: hut?.waterDrinkable ?? false,
    toilets: hut?.toilets ?? "",
    showers: hut?.showers ?? "",
    electricity: hut?.electricity ?? "",
    wifi: hut?.wifi ?? "",
    cooking: hut?.cooking ?? "",
    blanketsMattresses: hut?.blanketsMattresses ?? "",
    bookingRequired: hut?.bookingRequired ?? false,
    bookingUrl: hut?.bookingUrl ?? "",
    phone: hut?.phone ?? "",
    email: hut?.email ?? "",
    vendor: hut?.vendor ?? false,
    vendorStatusExpiresAt: hut?.vendorStatusExpiresAt?.slice(0, 10) ?? "",
    guideRateOffered: hut?.guideRateOffered ?? false,
    guardianName: hut?.guardianName ?? "",
    guardianEmail: hut?.guardianEmail ?? "",
    guardianPhone: hut?.guardianPhone ?? "",
    maxCapacity: hut?.maxCapacity?.toString() ?? "",
    emergencyInformation: hut?.emergencyInformation ?? "",
    nearbyHazards: hut?.nearbyHazards ?? "",
    usefulRouteInformation: hut?.usefulRouteInformation ?? "",
    instructorNotes: hut?.instructorNotes ?? "",
    lastCheckedAt: hut?.lastCheckedAt?.slice(0, 10) ?? "",
    source: hut?.source ?? "",
  };
}

export default function HutEditor({
  guideNoteId,
  guideNoteTitle,
  existingHut,
  onCancel,
  onSaved,
  updatedBy,
}: Props) {
  const [form, setForm] = useState(() =>
    initialState(existingHut, guideNoteTitle)
  );
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) => {
    setForm(current => ({ ...current, [key]: value }));
  };

  const inputClass =
    "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800";
  const labelClass = "block text-sm font-semibold text-slate-700";
  const sectionClass =
    "rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-4";

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError("Enter a hut name.");
      return;
    }

    setError(null);
    setWorking(true);

    const hut = await upsertHut(
      guideNoteId,
      {
        name: form.name.trim(),
        alternativeNames: form.alternativeNames
          .split(",")
          .map(value => value.trim())
          .filter(Boolean),
        country: form.country.trim() || undefined,
        region: form.region.trim() || undefined,
        latitude: form.latitude ? Number(form.latitude) : undefined,
        longitude: form.longitude ? Number(form.longitude) : undefined,
        elevationM: form.elevationM ? Number(form.elevationM) : undefined,
        summerAccess: form.summerAccess.trim() || undefined,
        winterAccess: form.winterAccess.trim() || undefined,
        approachRoutes: form.approachRoutes.trim() || undefined,
        typicalApproachTime: form.typicalApproachTime.trim() || undefined,
        approachDifficulty: form.approachDifficulty.trim() || undefined,
        seasonalRestrictions: form.seasonalRestrictions.trim() || undefined,
        sleepingCapacity: form.sleepingCapacity ? Number(form.sleepingCapacity) : undefined,
        winterRoom: form.winterRoom.trim() || undefined,
        foodAndMeals: form.foodAndMeals.trim() || undefined,
        picnicLunches: form.picnicLunches,
        water: form.water.trim() || undefined,
        waterDrinkable: form.waterDrinkable,
        toilets: form.toilets.trim() || undefined,
        showers: form.showers.trim() || undefined,
        electricity: form.electricity.trim() || undefined,
        wifi: form.wifi.trim() || undefined,
        cooking: form.cooking.trim() || undefined,
        blanketsMattresses: form.blanketsMattresses.trim() || undefined,
        bookingRequired: form.bookingRequired,
        bookingUrl: form.bookingUrl.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        vendor: form.vendor,
        vendorStatusExpiresAt: form.vendorStatusExpiresAt || undefined,
        guideRateOffered: form.guideRateOffered,
        guardianName: form.guardianName.trim() || undefined,
        guardianEmail: form.guardianEmail.trim() || undefined,
        guardianPhone: form.guardianPhone.trim() || undefined,
        maxCapacity: form.maxCapacity ? Number(form.maxCapacity) : undefined,
        emergencyInformation: form.emergencyInformation.trim() || undefined,
        nearbyHazards: form.nearbyHazards.trim() || undefined,
        usefulRouteInformation: form.usefulRouteInformation.trim() || undefined,
        instructorNotes: form.instructorNotes.trim() || undefined,
        photos: existingHut?.photos ?? [],
        lastCheckedAt: form.lastCheckedAt || undefined,
        lastCheckedBy: updatedBy,
        source: form.source.trim() || undefined,
        updatedBy,
        createdBy: existingHut?.createdBy ?? updatedBy,
      }
    );

    setWorking(false);

    if (!hut) {
      setError("The hut could not be saved. Check your permissions and try again.");
      return;
    }

    onSaved?.(hut);
  };

  return (
    <div className="fixed inset-4 z-50 flex flex-col overflow-hidden rounded-xl border border-slate-300 bg-white shadow-2xl md:left-1/2 md:right-auto md:w-[720px] md:-translate-x-1/2">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Hut Database
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">
            {existingHut ? "Edit Hut" : "Add Hut Details"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {guideNoteTitle}
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          disabled={working}
          className="rounded-lg px-2 py-1 text-xl text-slate-400 hover:bg-slate-100"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
        <section className={sectionClass}>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Basic information
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <label className={labelClass}>Hut name<input className={inputClass} value={form.name} onChange={e => update("name", e.target.value)} /></label>
            <label className={labelClass}>Alternative / local names<input className={inputClass} value={form.alternativeNames} onChange={e => update("alternativeNames", e.target.value)} placeholder="Separate names with commas" /></label>
            <label className={labelClass}>Country<input className={inputClass} value={form.country} onChange={e => update("country", e.target.value)} /></label>
            <label className={labelClass}>Region<input className={inputClass} value={form.region} onChange={e => update("region", e.target.value)} /></label>
            <label className={labelClass}>Latitude<input type="number" step="any" className={inputClass} value={form.latitude} onChange={e => update("latitude", e.target.value)} /></label>
            <label className={labelClass}>Longitude<input type="number" step="any" className={inputClass} value={form.longitude} onChange={e => update("longitude", e.target.value)} /></label>
            <label className={labelClass}>Elevation (m)<input type="number" className={inputClass} value={form.elevationM} onChange={e => update("elevationM", e.target.value)} /></label>
            <label className={labelClass}>Maximum capacity<input type="number" className={inputClass} value={form.maxCapacity} onChange={e => update("maxCapacity", e.target.value)} /></label>
          </div>
        </section>

        <section className={sectionClass}>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Access</h3>
          <label className={labelClass}>Summer access<textarea rows={3} className={inputClass} value={form.summerAccess} onChange={e => update("summerAccess", e.target.value)} /></label>
          <label className={labelClass}>Winter access<textarea rows={3} className={inputClass} value={form.winterAccess} onChange={e => update("winterAccess", e.target.value)} /></label>
          <label className={labelClass}>Approach routes<textarea rows={3} className={inputClass} value={form.approachRoutes} onChange={e => update("approachRoutes", e.target.value)} /></label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className={labelClass}>Typical approach time<input className={inputClass} value={form.typicalApproachTime} onChange={e => update("typicalApproachTime", e.target.value)} placeholder="e.g. 2h 30m" /></label>
            <label className={labelClass}>Approach difficulty<input className={inputClass} value={form.approachDifficulty} onChange={e => update("approachDifficulty", e.target.value)} /></label>
          </div>
          <label className={labelClass}>Seasonal restrictions<textarea rows={3} className={inputClass} value={form.seasonalRestrictions} onChange={e => update("seasonalRestrictions", e.target.value)} /></label>
        </section>

        <section className={sectionClass}>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Facilities & food</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <label className={labelClass}>Sleeping capacity<input type="number" className={inputClass} value={form.sleepingCapacity} onChange={e => update("sleepingCapacity", e.target.value)} /></label>
            <label className={labelClass}>Winter room<textarea rows={2} className={inputClass} value={form.winterRoom} onChange={e => update("winterRoom", e.target.value)} /></label>
            <label className={labelClass}>Food & meals<textarea rows={2} className={inputClass} value={form.foodAndMeals} onChange={e => update("foodAndMeals", e.target.value)} /></label>
            <label className={labelClass}>Water<textarea rows={2} className={inputClass} value={form.water} onChange={e => update("water", e.target.value)} /></label>
            <label className={labelClass}>Toilets<input className={inputClass} value={form.toilets} onChange={e => update("toilets", e.target.value)} /></label>
            <label className={labelClass}>Showers<input className={inputClass} value={form.showers} onChange={e => update("showers", e.target.value)} /></label>
            <label className={labelClass}>Electricity<input className={inputClass} value={form.electricity} onChange={e => update("electricity", e.target.value)} /></label>
            <label className={labelClass}>Wi-Fi<input className={inputClass} value={form.wifi} onChange={e => update("wifi", e.target.value)} /></label>
            <label className={labelClass}>Cooking<input className={inputClass} value={form.cooking} onChange={e => update("cooking", e.target.value)} /></label>
            <label className={labelClass}>Blankets / mattresses<input className={inputClass} value={form.blanketsMattresses} onChange={e => update("blanketsMattresses", e.target.value)} /></label>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700"><input type="checkbox" checked={form.picnicLunches} onChange={e => update("picnicLunches", e.target.checked)} /> Picnic lunches available</label>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700"><input type="checkbox" checked={form.waterDrinkable} onChange={e => update("waterDrinkable", e.target.checked)} /> Water is drinkable</label>
          </div>
        </section>

        <section className={sectionClass}>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Booking & contacts</h3>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700"><input type="checkbox" checked={form.bookingRequired} onChange={e => update("bookingRequired", e.target.checked)} /> Booking required</label>
          <label className={labelClass}>Reservation website<input type="url" className={inputClass} value={form.bookingUrl} onChange={e => update("bookingUrl", e.target.value)} placeholder="https://..." /></label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className={labelClass}>Hut phone<input type="tel" className={inputClass} value={form.phone} onChange={e => update("phone", e.target.value)} /></label>
            <label className={labelClass}>Hut email<input type="email" className={inputClass} value={form.email} onChange={e => update("email", e.target.value)} /></label>
          </div>
        </section>

        <section className={sectionClass}>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Vendor / guide information</h3>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700"><input type="checkbox" checked={form.vendor} onChange={e => update("vendor", e.target.checked)} /> Set up as a vendor</label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className={labelClass}>Vendor status expires<input type="date" className={inputClass} value={form.vendorStatusExpiresAt} onChange={e => update("vendorStatusExpiresAt", e.target.value)} /></label>
            <label className={labelClass}>Guide rate offered<input className={inputClass} value={form.guideRateOffered ? "Yes" : "No"} readOnly /></label>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700"><input type="checkbox" checked={form.guideRateOffered} onChange={e => update("guideRateOffered", e.target.checked)} /> Guide rate offered</label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className={labelClass}>Guardian name<input className={inputClass} value={form.guardianName} onChange={e => update("guardianName", e.target.value)} /></label>
            <label className={labelClass}>Guardian phone<input type="tel" className={inputClass} value={form.guardianPhone} onChange={e => update("guardianPhone", e.target.value)} /></label>
            <label className={labelClass}>Guardian email<input type="email" className={inputClass} value={form.guardianEmail} onChange={e => update("guardianEmail", e.target.value)} /></label>
          </div>
        </section>

        <section className={sectionClass}>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Guide information</h3>
          <label className={labelClass}>Emergency information<textarea rows={3} className={inputClass} value={form.emergencyInformation} onChange={e => update("emergencyInformation", e.target.value)} /></label>
          <label className={labelClass}>Nearby hazards<textarea rows={3} className={inputClass} value={form.nearbyHazards} onChange={e => update("nearbyHazards", e.target.value)} /></label>
          <label className={labelClass}>Useful route information<textarea rows={3} className={inputClass} value={form.usefulRouteInformation} onChange={e => update("usefulRouteInformation", e.target.value)} /></label>
          <label className={labelClass}>Instructor notes<textarea rows={3} className={inputClass} value={form.instructorNotes} onChange={e => update("instructorNotes", e.target.value)} /></label>
        </section>

        <section className={sectionClass}>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Review & source</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <label className={labelClass}>Last checked<input type="date" className={inputClass} value={form.lastCheckedAt} onChange={e => update("lastCheckedAt", e.target.value)} /></label>
            <label className={labelClass}>Source<input className={inputClass} value={form.source} onChange={e => update("source", e.target.value)} placeholder="Website, phone call, guide report..." /></label>
          </div>
        </section>

        {error && (
          <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      <div className="flex gap-3 border-t border-slate-200 bg-white p-4">
        <button type="button" onClick={onCancel} disabled={working} className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          Cancel
        </button>
        <button type="button" onClick={handleSave} disabled={working} className="flex-1 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
          {working ? "Saving..." : "Save Hut Details"}
        </button>
      </div>
    </div>
  );
}
