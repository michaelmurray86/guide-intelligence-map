"use client";

import { useEffect, useState } from "react";
import { getPendingUpdateRequests, reviewUpdateRequest, UpdateRequest } from "@/lib/updateRequestDatabase";

const labels: Record<string, string> = {
  name: "Hut name", shortDescription: "Short description", elevationM: "Elevation",
  sleepingBeds: "Number of beds", sleepingDormitories: "Number of dormitories",
  winterRoomCapacity: "Winter room capacity", winterRoomDetails: "Winter room details",
  openingDate: "Opening date", closingDate: "Closing date", showers: "Showers",
  picnicLunches: "Picnic lunches available", picnicLunchCost: "Picnic lunch cost",
  dinnerTime: "Dinner time", waterDrinkable: "Drinkable water", bookingUrl: "Reservation website",
  phone: "Phone number", email: "Email", guardianName: "Guardian name",
  vendor: "NAE Vendor", costs: "Costs", guideRateOffered: "IML rate offered",
  otherNotes: "Other useful notes", photos: "Photos", lastCheckedAt: "Last reviewed",
  lastCheckedBy: "Reviewed by",
};

function displayValue(value: unknown, key?: string) {
  if (Array.isArray(value)) return value.length ? `${value.length} photo${value.length === 1 ? "" : "s"}` : "No photos";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === null || value === undefined || value === "") return "Not set";
  if (key && (key === "openingDate" || key === "closingDate" || key === "lastCheckedAt")) {
    const date = new Date(String(value));
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString("en-GB");
  }
  return String(value);
}

function sameValue(a: unknown, b: unknown) {
  if (Array.isArray(a) || Array.isArray(b)) {
    const aa = Array.isArray(a) ? [...a].sort() : [];
    const bb = Array.isArray(b) ? [...b].sort() : [];
    return JSON.stringify(aa) === JSON.stringify(bb);
  }
  const normalize = (value: unknown) => value === undefined || value === null || value === "" ? null : value;
  return normalize(a) === normalize(b);
}

function changedEntries(request: UpdateRequest) {
  const proposed = request.proposedData ?? {};
  const current = request.currentData ?? {};
  return Object.entries(proposed).filter(([key, value]) => !sameValue(current[key as keyof typeof current], value));
}

type Props = { userRole?: string };

export default function UpdateRequestsPanel({ userRole }: Props) {
  const [requests, setRequests] = useState<UpdateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<number | null>(null);

  async function loadRequests() {
    setLoading(true);
    try { setRequests(await getPendingUpdateRequests()); }
    catch { setRequests([]); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadRequests(); }, []);

  async function review(request: UpdateRequest, decision: "approved" | "rejected") {
    const subject = request.requestType === "delete"
      ? `deletion of "${request.noteTitle ?? "knowledge item"}"`
      : `Hut update for "${request.proposedData?.name ?? request.noteTitle ?? "Hut"}"`;

    if (!window.confirm(decision === "approved" ? `Approve ${subject}?` : `Reject ${subject}?`)) return;

    setWorkingId(request.id);
    const success = await reviewUpdateRequest(request.id, decision);
    setWorkingId(null);

    if (success) {
      setRequests(current => current.filter(item => item.id !== request.id));
      window.dispatchEvent(new Event("guide-notes-changed"));
      window.dispatchEvent(new Event("guide-sections-changed"));
    }
  }

  return (
    <div className="space-y-3">
      {loading ? <p className="text-sm text-slate-500">Loading requests...</p> :
       requests.length === 0 ? <p className="text-sm text-slate-500">No pending update requests.</p> :
       requests.map(request => {
        const isDelete = request.requestType === "delete";
        const title = isDelete ? request.noteTitle ?? "Knowledge item" : request.proposedData?.name ?? request.noteTitle ?? "Hut";
        const hutDeletion = isDelete && request.noteCategory === "hut";
        const canApprove = !hutDeletion || userRole === "admin" || userRole === "superadmin";
        const changes = !isDelete ? changedEntries(request) : [];

        return (
          <div key={request.id} className="rounded-lg border border-slate-300 bg-white p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium text-slate-900">{title}</div>
                <p className="mt-1 text-xs text-slate-500">Requested {new Date(request.requestedAt).toLocaleDateString("en-GB")}</p>
              </div>
              <span className={`rounded-full px-2 py-1 text-xs font-semibold ${isDelete ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"}`}>{isDelete ? "Deletion" : "Hut update"}</span>
            </div>

            {isDelete ? (
              <p className="mt-2 text-sm text-slate-600">{request.reason ?? "Deletion requested for this knowledge item."}</p>
            ) : (
              <div className="mt-3">
                <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Changes requested{changes.length ? ` · ${changes.length}` : ""}</div>
                {changes.length > 0 ? (
                  <div className="grid gap-2">
                    {changes.map(([key, value]) => {
                      const current = request.currentData?.[key as keyof typeof request.currentData];
                      return (
                        <div key={key} className="rounded border border-slate-200 bg-slate-50 p-2">
                          <div className="text-xs font-semibold text-slate-500">{labels[key] ?? key}</div>
                          <div className="mt-1 break-words text-sm text-slate-800">{displayValue(current, key)} → {displayValue(value, key)}</div>
                        </div>
                      );
                    })}
                  </div>
                ) : <p className="text-sm text-slate-500">No field changes detected.</p>}
              </div>
            )}

            <div className="mt-3 flex gap-2">
              <button disabled={workingId === request.id || !canApprove} onClick={() => review(request, "approved")} className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50">
                {hutDeletion && !canApprove ? "Admin approval required" : "Approve"}
              </button>
              <button disabled={workingId === request.id} onClick={() => review(request, "rejected")} className="flex-1 rounded-lg bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-300 disabled:opacity-50">Reject</button>
            </div>
          </div>
        );
       })}
      <button type="button" onClick={loadRequests} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Refresh requests</button>
    </div>
  );
}