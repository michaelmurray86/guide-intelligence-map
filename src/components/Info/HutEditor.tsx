"use client";

import { useState } from "react";
import { upsertHut } from "@/lib/hutDatabase";
import { submitHutChange, HutEditPayload } from "@/lib/hutChangeDatabase";
import { Hut } from "@/Types/Hut";

type Props = {
  guideNoteId: number;
  guideNoteTitle: string;
  existingHut?: Hut | null;
  onCancel: () => void;
  onSaved?: (hut: Hut) => void;
  updatedBy?: string;
  userRole?: string;
  onSubmittedForApproval?: () => void;
};

type Form = Record<string, string | boolean>;

const textFields = [
  ["name","Hut name"],["alternativeNames","Alternative / local names"],
  ["country","Country"],["region","Region"],["latitude","Latitude"],["longitude","Longitude"],
  ["elevationM","Elevation (m)"],["maxCapacity","Maximum capacity"],
  ["summerAccess","Summer access"],["winterAccess","Winter access"],["approachRoutes","Approach routes"],
  ["typicalApproachTime","Typical approach time"],["approachDifficulty","Approach difficulty"],
  ["seasonalRestrictions","Seasonal restrictions"],["sleepingCapacity","Sleeping capacity"],
  ["winterRoom","Winter room"],["foodAndMeals","Food & meals"],["water","Water"],
  ["toilets","Toilets"],["showers","Showers"],["electricity","Electricity"],["wifi","Wi-Fi"],
  ["cooking","Cooking"],["blanketsMattresses","Blankets / mattresses"],
  ["bookingUrl","Reservation website"],["phone","Hut phone"],["email","Hut email"],
  ["vendorStatusExpiresAt","Vendor status expires"],["guardianName","Guardian name"],
  ["guardianEmail","Guardian email"],["guardianPhone","Guardian phone"],
  ["emergencyInformation","Emergency information"],["nearbyHazards","Nearby hazards"],
  ["usefulRouteInformation","Useful route information"],["instructorNotes","Instructor notes"],
  ["lastCheckedAt","Last checked"],["source","Source"],
] as const;

const boolFields = [
  ["picnicLunches","Picnic lunches available"],
  ["waterDrinkable","Water is drinkable"],
  ["bookingRequired","Booking required"],
  ["vendor","Set up as a vendor"],
  ["guideRateOffered","Guide rate offered"],
] as const;

function initialForm(hut: Hut | null | undefined, title: string): Form {
  const form: Form = {
    name: hut?.name ?? title,
    alternativeNames: hut?.alternativeNames.join(", ") ?? "",
    country: hut?.country ?? "", region: hut?.region ?? "",
    latitude: hut?.latitude?.toString() ?? "", longitude: hut?.longitude?.toString() ?? "",
    elevationM: hut?.elevationM?.toString() ?? "",
    maxCapacity: hut?.maxCapacity?.toString() ?? "",
    summerAccess: hut?.summerAccess ?? "", winterAccess: hut?.winterAccess ?? "",
    approachRoutes: hut?.approachRoutes ?? "", typicalApproachTime: hut?.typicalApproachTime ?? "",
    approachDifficulty: hut?.approachDifficulty ?? "", seasonalRestrictions: hut?.seasonalRestrictions ?? "",
    sleepingCapacity: hut?.sleepingCapacity?.toString() ?? "", winterRoom: hut?.winterRoom ?? "",
    foodAndMeals: hut?.foodAndMeals ?? "", water: hut?.water ?? "",
    toilets: hut?.toilets ?? "", showers: hut?.showers ?? "", electricity: hut?.electricity ?? "",
    wifi: hut?.wifi ?? "", cooking: hut?.cooking ?? "", blanketsMattresses: hut?.blanketsMattresses ?? "",
    bookingUrl: hut?.bookingUrl ?? "", phone: hut?.phone ?? "", email: hut?.email ?? "",
    vendorStatusExpiresAt: hut?.vendorStatusExpiresAt?.slice(0,10) ?? "",
    guardianName: hut?.guardianName ?? "", guardianEmail: hut?.guardianEmail ?? "",
    guardianPhone: hut?.guardianPhone ?? "", emergencyInformation: hut?.emergencyInformation ?? "",
    nearbyHazards: hut?.nearbyHazards ?? "", usefulRouteInformation: hut?.usefulRouteInformation ?? "",
    instructorNotes: hut?.instructorNotes ?? "", lastCheckedAt: hut?.lastCheckedAt?.slice(0,10) ?? "",
    source: hut?.source ?? "",
  };
  for (const [key] of boolFields) form[key] = (hut?.[key as keyof Hut] as boolean | undefined) ?? false;
  return form;
}

export default function HutEditor({ guideNoteId, guideNoteTitle, existingHut, onCancel, onSaved, updatedBy, userRole, onSubmittedForApproval }: Props) {
  const [form,setForm] = useState(() => initialForm(existingHut,guideNoteTitle));
  const [working,setWorking] = useState(false);
  const [error,setError] = useState<string | null>(null);
  const set = (key:string,value:string|boolean) => setForm(current => ({...current,[key]:value}));
  const value = (key:string) => form[key] ?? "";

  const save = async () => {
    if (!String(value("name")).trim()) { setError("Enter a hut name."); return; }
    setWorking(true); setError(null);
    const number = (key:string) => value(key) ? Number(value(key)) : undefined;
    const payload: HutEditPayload = {
      name:String(value("name")).trim(),
      alternativeNames:String(value("alternativeNames")).split(",").map(v=>v.trim()).filter(Boolean),
      country:String(value("country")).trim()||undefined, region:String(value("region")).trim()||undefined,
      latitude:number("latitude"), longitude:number("longitude"), elevationM:number("elevationM"),
      summerAccess:String(value("summerAccess")).trim()||undefined, winterAccess:String(value("winterAccess")).trim()||undefined,
      approachRoutes:String(value("approachRoutes")).trim()||undefined, typicalApproachTime:String(value("typicalApproachTime")).trim()||undefined,
      approachDifficulty:String(value("approachDifficulty")).trim()||undefined, seasonalRestrictions:String(value("seasonalRestrictions")).trim()||undefined,
      sleepingCapacity:number("sleepingCapacity"), winterRoom:String(value("winterRoom")).trim()||undefined,
      foodAndMeals:String(value("foodAndMeals")).trim()||undefined, picnicLunches:Boolean(value("picnicLunches")),
      water:String(value("water")).trim()||undefined, waterDrinkable:Boolean(value("waterDrinkable")),
      toilets:String(value("toilets")).trim()||undefined, showers:String(value("showers")).trim()||undefined,
      electricity:String(value("electricity")).trim()||undefined, wifi:String(value("wifi")).trim()||undefined,
      cooking:String(value("cooking")).trim()||undefined, blanketsMattresses:String(value("blanketsMattresses")).trim()||undefined,
      bookingRequired:Boolean(value("bookingRequired")), bookingUrl:String(value("bookingUrl")).trim()||undefined,
      phone:String(value("phone")).trim()||undefined, email:String(value("email")).trim()||undefined,
      vendor:Boolean(value("vendor")), vendorStatusExpiresAt:String(value("vendorStatusExpiresAt"))||undefined,
      guideRateOffered:Boolean(value("guideRateOffered")), guardianName:String(value("guardianName")).trim()||undefined,
      guardianEmail:String(value("guardianEmail")).trim()||undefined, guardianPhone:String(value("guardianPhone")).trim()||undefined,
      maxCapacity:number("maxCapacity"), emergencyInformation:String(value("emergencyInformation")).trim()||undefined,
      nearbyHazards:String(value("nearbyHazards")).trim()||undefined, usefulRouteInformation:String(value("usefulRouteInformation")).trim()||undefined,
      instructorNotes:String(value("instructorNotes")).trim()||undefined, photos:existingHut?.photos??[],
      lastCheckedAt:String(value("lastCheckedAt"))||undefined, lastCheckedBy:updatedBy,
      source:String(value("source")).trim()||undefined, updatedBy, createdBy:existingHut?.createdBy??updatedBy,
    };

    if (userRole === "instructor") {
      if (!existingHut) {
        setWorking(false);
        setError("This Hut has not been created in the Hut Database yet. An approver or admin needs to create it first.");
        return;
      }

      const request = await submitHutChange(existingHut.id, payload);
      setWorking(false);

      if (!request) {
        setError("The Hut change could not be submitted for approval.");
        return;
      }

      onSubmittedForApproval?.();
      return;
    }

    const hut = await upsertHut(guideNoteId, payload);
    setWorking(false);
    if (!hut) { setError("The hut could not be saved. Check your permissions and try again."); return; }
    onSaved?.(hut);
  };

  const cls="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800";
  const label="block text-sm font-semibold text-slate-700";
  const sections=[
    ["Basic information",["name","alternativeNames","country","region","latitude","longitude","elevationM","maxCapacity"]],
    ["Access",["summerAccess","winterAccess","approachRoutes","typicalApproachTime","approachDifficulty","seasonalRestrictions"]],
    ["Facilities & food",["sleepingCapacity","winterRoom","foodAndMeals","water","toilets","showers","electricity","wifi","cooking","blanketsMattresses"]],
    ["Booking & contacts",["bookingUrl","phone","email"]],
    ["Vendor / guide information",["vendorStatusExpiresAt","guardianName","guardianEmail","guardianPhone"]],
    ["Guide information",["emergencyInformation","nearbyHazards","usefulRouteInformation","instructorNotes"]],
    ["Review & source",["lastCheckedAt","source"]],
  ] as const;

  return <div className="fixed inset-4 z-50 flex flex-col overflow-hidden rounded-xl border border-slate-300 bg-white shadow-2xl md:left-1/2 md:right-auto md:w-[720px] md:-translate-x-1/2">
    <div className="flex items-start justify-between border-b border-slate-200 p-5">
      <div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Hut Database</p><h2 className="mt-1 text-xl font-bold text-slate-900">{existingHut?"Edit Hut":"Add Hut Details"}</h2><p className="text-sm text-slate-500">{guideNoteTitle}</p></div>
      <button type="button" onClick={onCancel} disabled={working} className="rounded-lg px-2 py-1 text-xl text-slate-400 hover:bg-slate-100">✕</button>
    </div>
    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
      {sections.map(([title,keys])=><section key={title} className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">{title}</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {keys.map(key=>{const [,labelText]=textFields.find(x=>x[0]===key)??[key,key]; const area=["summerAccess","winterAccess","approachRoutes","seasonalRestrictions","foodAndMeals","water","winterRoom","emergencyInformation","nearbyHazards","usefulRouteInformation","instructorNotes"].includes(key); const type=["vendorStatusExpiresAt","lastCheckedAt"].includes(key)?"date":key==="bookingUrl"?"url":key==="email"||key==="guardianEmail"?"email":key==="phone"||key==="guardianPhone"?"tel":["latitude","longitude","elevationM","sleepingCapacity","maxCapacity"].includes(key)?"number":"text"; return <label key={key} className={label}>{labelText}{area?<textarea rows={3} className={cls} value={String(value(key))} onChange={e=>set(key,e.target.value)}/>:<input type={type} step={type==="number"?"any":undefined} className={cls} value={String(value(key))} onChange={e=>set(key,e.target.value)}/>}</label>})}
        </div>
        {title==="Facilities & food"&&<div className="grid gap-3 md:grid-cols-2">{boolFields.slice(0,2).map(([key,text])=><label key={key} className="flex items-center gap-2 text-sm font-semibold text-slate-700"><input type="checkbox" checked={Boolean(value(key))} onChange={e=>set(key,e.target.checked)}/>{text}</label>)}</div>}
        {title==="Booking & contacts"&&<label className="flex items-center gap-2 text-sm font-semibold text-slate-700"><input type="checkbox" checked={Boolean(value("bookingRequired"))} onChange={e=>set("bookingRequired",e.target.checked)}/>{boolFields[2][1]}</label>}
        {title==="Vendor / guide information"&&<div className="grid gap-3 md:grid-cols-2">{boolFields.slice(3).map(([key,text])=><label key={key} className="flex items-center gap-2 text-sm font-semibold text-slate-700"><input type="checkbox" checked={Boolean(value(key))} onChange={e=>set(key,e.target.checked)}/>{text}</label>)}</div>}
      </section>)}
      {error&&<div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    </div>
    <div className="flex gap-3 border-t border-slate-200 p-4">
      <button type="button" onClick={onCancel} disabled={working} className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold">Cancel</button>
      <button type="button" onClick={save} disabled={working} className="flex-1 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">
        {working ? (userRole === "instructor" ? "Submitting..." : "Saving...") : userRole === "instructor" ? "Submit for Approval" : "Save Hut Details"}
      </button>
    </div>
  </div>;
}
