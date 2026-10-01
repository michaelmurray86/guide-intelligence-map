"use client";

import { useMemo, useRef, useState } from "react";
import { upsertHut } from "@/lib/hutDatabase";
import { submitHutChange, HutEditPayload } from "@/lib/hutChangeDatabase";
import { Hut } from "@/Types/Hut";
import { deleteGuideNotePhotos, uploadGuideNotePhotos } from "@/lib/guideNoteStorage";

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
  ["name", "Hut name"],
  ["shortDescription", "Short description"],
  ["elevationM", "Elevation (m)"],
  ["sleepingBeds", "Number of beds"],
  ["sleepingDormitories", "Number of dormitories"],
  ["winterRoomCapacity", "Winter room capacity"],
  ["winterRoomDetails", "Winter room details"],
  ["openingDate", "Opening date"],
  ["closingDate", "Closing date"],
  ["showers", "Showers"],
  ["picnicLunchCost", "Picnic lunch cost"],
  ["dinnerTime", "Dinner time"],
  ["bookingUrl", "Reservation website"],
  ["phone", "Hut phone number"],
  ["email", "Hut email"],
  ["guardianName", "Guardian name"],
  ["costs", "Costs"],
  ["otherNotes", "Other useful notes"],
  ["lastCheckedAt", "Last reviewed"],
] as const;

const boolFields = [
  ["picnicLunches", "Picnic lunches available"],
  ["waterDrinkable", "Drinkable water"],
  ["vendor", "NAE Vendor"],
  ["guideRateOffered", "IML rate offered"],
] as const;

function initialForm(hut: Hut | null | undefined, title: string): Form {
  const form: Form = {
    name: hut?.name ?? title,
    shortDescription: hut?.shortDescription ?? "",
    elevationM: hut?.elevationM?.toString() ?? "",
    sleepingBeds: hut?.sleepingBeds?.toString() ?? "",
    sleepingDormitories: hut?.sleepingDormitories?.toString() ?? "",
    winterRoomCapacity: hut?.winterRoomCapacity?.toString() ?? "",
    winterRoomDetails: hut?.winterRoomDetails ?? "",
    openingDate: hut?.openingDate?.slice(0, 10) ?? "",
    closingDate: hut?.closingDate?.slice(0, 10) ?? "",
    showers: hut?.showers ?? "",
    picnicLunchCost: hut?.picnicLunchCost ?? "",
    dinnerTime: hut?.dinnerTime ?? "",
    bookingUrl: hut?.bookingUrl ?? "",
    phone: hut?.phone ?? "",
    email: hut?.email ?? "",
    guardianName: hut?.guardianName ?? "",
    costs: hut?.costs ?? "",
    otherNotes: hut?.otherNotes ?? "",
    lastCheckedAt: hut?.lastCheckedAt?.slice(0, 10) ?? "",
  };

  for (const [key] of boolFields) {
    form[key] = (hut?.[key as keyof Hut] as boolean | undefined) ?? false;
  }

  return form;
}

export default function HutEditor({
  guideNoteId,
  guideNoteTitle,
  existingHut,
  onCancel,
  onSaved,
  updatedBy,
  userRole,
  onSubmittedForApproval,
}: Props) {
  const [form, setForm] = useState(() =>
    initialForm(existingHut, guideNoteTitle)
  );
  const [working, setWorking] = useState(false);
  const [editing, setEditing] = useState(!existingHut);
  const [error, setError] = useState<string | null>(null);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [removedPhotos, setRemovedPhotos] = useState<string[]>([]);
  const photoPickerRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const set = (key: string, value: string | boolean) =>
    setForm(current => ({ ...current, [key]: value }));

  const value = (key: string) => form[key] ?? "";

  const save = async () => {
    if (!String(value("name")).trim()) {
      setError("Enter a hut name.");
      return;
    }

    setWorking(true);
    setError(null);

    if (userRole === "instructor" && !existingHut) {
      setWorking(false);
      setError("This Hut has not been created in the Hut Database yet. An approver or admin needs to create it first.");
      return;
    }

    const uploadedPaths = await uploadGuideNotePhotos(guideNoteId, newPhotos);
    if (uploadedPaths === null) {
      setWorking(false);
      setError("One or more photos could not be uploaded. No changes were saved.");
      return;
    }

    const currentPhotos = existingHut?.photos ?? [];
    const photos = [...currentPhotos.filter(photo => !removedPhotos.includes(photo)), ...uploadedPaths];

    const number = (key: string) =>
      value(key) === "" ? undefined : Number(value(key));

    const payload: HutEditPayload = {
      name: String(value("name")).trim(),
      shortDescription: String(value("shortDescription")).trim() || undefined,
      elevationM: number("elevationM"),
      sleepingBeds: number("sleepingBeds"),
      sleepingDormitories: number("sleepingDormitories"),
      winterRoomCapacity: number("winterRoomCapacity"),
      winterRoomDetails: String(value("winterRoomDetails")).trim() || undefined,
      openingDate: String(value("openingDate")) || undefined,
      closingDate: String(value("closingDate")) || undefined,
      showers: String(value("showers")).trim() || undefined,
      picnicLunches: Boolean(value("picnicLunches")),
      picnicLunchCost: String(value("picnicLunchCost")).trim() || undefined,
      dinnerTime: String(value("dinnerTime")).trim() || undefined,
      waterDrinkable: Boolean(value("waterDrinkable")),
      bookingUrl: String(value("bookingUrl")).trim() || undefined,
      phone: String(value("phone")).trim() || undefined,
      email: String(value("email")).trim() || undefined,
      guardianName: String(value("guardianName")).trim() || undefined,
      vendor: Boolean(value("vendor")),
      costs: String(value("costs")).trim() || undefined,
      guideRateOffered: Boolean(value("guideRateOffered")),
      otherNotes: String(value("otherNotes")).trim() || undefined,
      photos,
      lastCheckedAt: String(value("lastCheckedAt")) || undefined,
      lastCheckedBy: updatedBy,
      updatedBy,
      createdBy: existingHut?.createdBy ?? updatedBy,
    };

    if (userRole === "instructor") {
      const request = await submitHutChange(existingHut.id, payload);
      setWorking(false);

      if (!request) {
        await deleteGuideNotePhotos(uploadedPaths);
        setError("The Hut change could not be submitted for approval.");
        return;
      }

      onSubmittedForApproval?.();
      return;
    }

    const hut = await upsertHut(guideNoteId, payload);
    setWorking(false);

    if (!hut) {
      await deleteGuideNotePhotos(uploadedPaths);
      setError("The hut could not be saved. Check your permissions and try again.");
      return;
    }

    await deleteGuideNotePhotos(removedPhotos);
    onSaved?.(hut);
  };

  const cls =
    "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800";
  const label = "block text-sm font-semibold text-slate-700";

  const display = (field: keyof Hut) => {
    const item = existingHut?.[field];
    if (item === undefined || item === null || item === "") return null;
    return String(item);
  };

  const yesNo = (field: keyof Hut) => {
    const item = existingHut?.[field];
    if (item === undefined || item === null) return null;
    return item ? "Yes" : "No";
  };

  const Info = ({
    label: infoLabel,
    value: infoValue,
  }: {
    label: string;
    value?: string | null;
  }) =>
    infoValue ? (
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {infoLabel}
        </dt>
        <dd className="mt-1 whitespace-pre-wrap text-sm text-slate-800">
          {infoValue}
        </dd>
      </div>
    ) : null;

  const sections = [
    [
      "Overview",
      ["shortDescription", "elevationM", "sleepingBeds", "sleepingDormitories", "winterRoomCapacity", "winterRoomDetails"],
    ],
    [
      "Facilities & food",
      ["showers", "picnicLunchCost", "dinnerTime"],
    ],
    [
      "Booking & contacts",
      ["openingDate", "closingDate", "bookingUrl", "phone", "email", "guardianName"],
    ],
    [
      "Costs & vendor",
      ["costs"],
    ],
    [
      "Other useful notes & review",
      ["otherNotes", "lastCheckedAt"],
    ],
  ] as const;

  if (existingHut && !editing) {
    return (
      <div className="fixed inset-4 z-50 flex flex-col overflow-hidden rounded-xl border border-slate-300 bg-white shadow-2xl md:left-1/2 md:right-auto md:w-[680px] md:-translate-x-1/2">
        <div className="flex items-start justify-between border-b border-slate-200 p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Hut Database
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {existingHut.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-2 py-1 text-xl text-slate-400 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">
              Overview
            </h3>
            <dl className="grid gap-4 sm:grid-cols-2">
              <Info label="Short description" value={display("shortDescription")} />
              <Info label="Elevation" value={display("elevationM") ? `${display("elevationM")} m` : null} />
              <Info label="Number of beds" value={display("sleepingBeds")} />
              <Info label="Number of dormitories" value={display("sleepingDormitories")} />
              <Info label="Winter room capacity" value={display("winterRoomCapacity")} />
              <Info label="Winter room details" value={display("winterRoomDetails")} />
            </dl>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">
              Facilities & food
            </h3>
            <dl className="grid gap-4 sm:grid-cols-2">
              <Info label="Showers" value={display("showers")} />
              <Info label="Picnic lunches available" value={yesNo("picnicLunches")} />
              <Info label="Picnic lunch cost" value={display("picnicLunchCost")} />
              <Info label="Dinner time" value={display("dinnerTime")} />
              <Info label="Drinkable water" value={yesNo("waterDrinkable")} />
            </dl>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">
              Booking & contacts
            </h3>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reservation website</dt>
                {display("bookingUrl") && (
                  <dd className="mt-1 text-sm">
                    <a href={/^https?:\/\//i.test(String(display("bookingUrl"))) ? String(display("bookingUrl")) : `https://${String(display("bookingUrl"))}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 underline hover:text-blue-800">
                      Open reservation website ↗
                    </a>
                  </dd>
                )}
              </div>
              <Info label="Phone number" value={display("phone")} />
              <Info label="Email" value={display("email")} />
              <Info label="Guardian name" value={display("guardianName")} />
            </dl>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">
              Costs & vendor
            </h3>
            <dl className="grid gap-4 sm:grid-cols-2">
              <Info label="Costs" value={display("costs")} />
              <Info label="NAE Vendor" value={yesNo("vendor")} />
              <Info label="IML rate offered" value={yesNo("guideRateOffered")} />
            </dl>
          </section>

          {(display("otherNotes") || display("lastCheckedAt") || display("lastCheckedBy") || (existingHut.photoUrls?.length ?? 0) > 0) && (
            <section className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">
                Other useful notes & review
              </h3>
              <dl className="space-y-4">
                <Info label="Other useful notes" value={display("otherNotes")} />
                <Info label="Last reviewed" value={display("lastCheckedAt") ? new Date(String(display("lastCheckedAt"))).toLocaleDateString("en-GB") : null} />
                <Info label="Reviewed by" value={display("lastCheckedBy")} />
              </dl>
            </section>
          )}

          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">Photos</h3>
            {(existingHut.photoUrls?.length ?? 0) > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {existingHut.photoUrls?.map((url, index) => <img key={url} src={url} alt="" className="aspect-square w-full cursor-pointer rounded-lg object-cover" />)}
              </div>
            ) : <p className="text-sm text-slate-500">No photos attached.</p>}
          </section>
        </div>

        <div className="flex gap-3 border-t border-slate-200 p-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex-1 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            {userRole === "instructor" ? "Propose Edit" : "Edit"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-4 z-50 flex flex-col overflow-hidden rounded-xl border border-slate-300 bg-white shadow-2xl md:left-1/2 md:right-auto md:w-[720px] md:-translate-x-1/2">
      <div className="flex items-start justify-between border-b border-slate-200 p-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Hut Database
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">
            {existingHut ? "Edit Hut" : "Add Hut Details"}
          </h2>
          <p className="text-sm text-slate-500">{guideNoteTitle}</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          disabled={working}
          className="rounded-lg px-2 py-1 text-xl text-slate-400 hover:bg-slate-100"
        >
          ✕
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
        {sections.map(([title, keys]) => (
          <section
            key={title}
            className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4"
          >
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              {title}
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              {keys.map(key => {
                const [, labelText] =
                  textFields.find(x => x[0] === key) ?? [key, key];

                const area = ["showers", "winterRoomDetails", "costs", "otherNotes"].includes(key);
                const type =
                  ["lastCheckedAt", "openingDate", "closingDate"].includes(key)
                    ? "date"
                    : key === "bookingUrl"
                      ? "url"
                      : key === "email"
                        ? "email"
                        : key === "phone"
                          ? "tel"
                          : ["elevationM", "sleepingBeds", "sleepingDormitories", "winterRoomCapacity"].includes(key)
                            ? "number"
                            : "text";

                return (
                  <label key={key} className={label}>
                    {labelText}
                    {area ? (
                      <textarea
                        rows={key === "costs" || key === "otherNotes" ? 4 : 2}
                        className={cls}
                        value={String(value(key))}
                        onChange={e => set(key, e.target.value)}
                      />
                    ) : (
                      <input
                        type={type}
                        className={cls}
                        value={String(value(key))}
                        onChange={e => set(key, e.target.value)}
                      />
                    )}
                  </label>
                );
              })}
            </div>

            {title === "Facilities & food" && (
              <div className="grid gap-3 md:grid-cols-2">
                {boolFields.slice(0, 2).map(([key, text]) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(value(key))}
                      onChange={e => set(key, e.target.checked)}
                    />
                    {text}
                  </label>
                ))}
              </div>
            )}

            {title === "Costs & vendor" && (
              <div className="grid gap-3 md:grid-cols-2">
                {boolFields.slice(2).map(([key, text]) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(value(key))}
                      onChange={e => set(key, e.target.checked)}
                    />
                    {text}
                  </label>
                ))}
              </div>
            )}
          </section>
        ))}

        {error && (
          <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      <div className="flex gap-3 border-t border-slate-200 p-4">
        <button
          type="button"
          onClick={existingHut ? () => setEditing(false) : onCancel}
          disabled={working}
          className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold"
        >
          {existingHut ? "Back" : "Cancel"}
        </button>
        <button
          type="button"
          onClick={save}
          disabled={working}
          className="flex-1 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {working
            ? userRole === "instructor"
              ? "Submitting..."
              : "Saving..."
            : userRole === "instructor"
              ? "Submit for Approval"
              : "Save Hut Details"}
        </button>
      </div>
    </div>
  );
}
