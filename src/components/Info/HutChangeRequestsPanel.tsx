"use client";

import { useEffect, useState } from "react";
import {
  getPendingHutChanges,
  reviewHutChange,
  HutChangeRequest,
} from "@/lib/hutChangeDatabase";

type Props = {
  open: boolean;
  onClose: () => void;
};

const labels: Record<string, string> = {
  name: "Name",
  alternativeNames: "Alternative names",
  country: "Country",
  region: "Region",
  elevationM: "Elevation",
  summerAccess: "Summer access",
  winterAccess: "Winter access",
  approachRoutes: "Approach routes",
  typicalApproachTime: "Approach time",
  approachDifficulty: "Approach difficulty",
  seasonalRestrictions: "Seasonal restrictions",
  sleepingCapacity: "Sleeping capacity",
  winterRoom: "Winter room",
  foodAndMeals: "Food & meals",
  picnicLunches: "Picnic lunches",
  water: "Water",
  waterDrinkable: "Water drinkable",
  toilets: "Toilets",
  showers: "Showers",
  electricity: "Electricity",
  wifi: "Wi-Fi",
  cooking: "Cooking",
  blanketsMattresses: "Blankets / mattresses",
  bookingRequired: "Booking required",
  bookingUrl: "Reservation website",
  phone: "Hut phone",
  email: "Hut email",
  vendor: "Vendor",
  vendorStatusExpiresAt: "Vendor status expiry",
  guideRateOffered: "Guide rate offered",
  guardianName: "Guardian name",
  guardianEmail: "Guardian email",
  guardianPhone: "Guardian phone",
  maxCapacity: "Maximum capacity",
  emergencyInformation: "Emergency information",
  nearbyHazards: "Nearby hazards",
  usefulRouteInformation: "Useful route information",
  instructorNotes: "Instructor notes",
  lastCheckedAt: "Last checked",
  source: "Source",
};

function displayValue(value: unknown) {
  if (Array.isArray(value)) return value.join(", ") || "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

export default function HutChangeRequestsPanel({ open, onClose }: Props) {
  const [requests, setRequests] = useState<HutChangeRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [workingId, setWorkingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setRequests(await getPendingHutChanges());
    } catch {
      setError("Pending Hut changes could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
  }, [open]);

  if (!open) return null;

  const review = async (request: HutChangeRequest, decision: "approved" | "rejected") => {
    const question = decision === "approved"
      ? `Approve the proposed changes to "${request.proposedData.name}"?`
      : `Reject the proposed changes to "${request.proposedData.name}"?`;

    if (!window.confirm(question)) return;

    setWorkingId(request.id);
    const result = await reviewHutChange(request.id, decision);
    setWorkingId(null);

    if (!result) {
      setError("The Hut change could not be reviewed.");
      return;
    }

    setRequests(current => current.filter(item => item.id !== request.id));
  };

  return (
    <div className="fixed inset-4 z-50 flex flex-col overflow-hidden rounded-xl border border-slate-300 bg-white shadow-2xl md:left-1/2 md:right-auto md:w-[760px] md:-translate-x-1/2">
      <div className="flex items-start justify-between border-b border-slate-200 p-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Hut Database</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">Pending Hut Changes</h2>
          <p className="mt-1 text-sm text-slate-500">Review instructor changes before they become live.</p>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg px-2 py-1 text-xl text-slate-400 hover:bg-slate-100">✕</button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        {loading && <p className="text-sm text-slate-500">Loading pending changes…</p>}
        {error && <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {!loading && requests.length === 0 && <p className="text-sm text-slate-500">There are no pending Hut changes.</p>}

        <div className="space-y-5">
          {requests.map(request => (
            <article key={request.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900">{request.proposedData.name}</h3>
                  <p className="text-xs text-slate-500">
                    Submitted {new Date(request.requestedAt).toLocaleString("en-GB")}
                  </p>
                </div>
                <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">Pending</span>
              </div>

              <div className="mt-4 grid gap-2 md:grid-cols-2">
                {Object.entries(request.proposedData)
                  .filter(([key, value]) => key !== "photos" && value !== undefined && value !== "")
                  .map(([key, value]) => (
                    <div key={key} className="rounded-lg border border-slate-200 bg-white p-2">
                      <div className="text-xs font-semibold text-slate-500">{labels[key] ?? key}</div>
                      <div className="mt-1 break-words text-sm text-slate-800">{displayValue(value)}</div>
                    </div>
                  ))}
              </div>

              <div className="mt-4 flex gap-3">
                <button type="button" disabled={workingId === request.id} onClick={() => review(request, "rejected")} className="flex-1 rounded-lg border border-red-200 px-4 py-3 font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">
                  Reject
                </button>
                <button type="button" disabled={workingId === request.id} onClick={() => review(request, "approved")} className="flex-1 rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                  {workingId === request.id ? "Reviewing…" : "Approve & Publish"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
