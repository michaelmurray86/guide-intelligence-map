"use client";

import { useEffect, useState } from "react";
import { getPendingUpdateRequests, reviewUpdateRequest, UpdateRequest } from "@/lib/updateRequestDatabase";

const labels: Record<string, string> = {
  picnicLunches: "Picnic lunches",
  waterDrinkable: "Water drinkable",
  vendor: "Vendor",
  vendorStatusExpiresAt: "Vendor status expiry",
  guideRateOffered: "Guide rate offered",
  guardianName: "Guardian name",
  guardianEmail: "Guardian email",
  guardianPhone: "Guardian phone",
  bookingUrl: "Reservation website",
  maxCapacity: "Maximum capacity",
};

function displayValue(value: unknown) {
  if (Array.isArray(value)) return value.join(", ") || "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

export default function UpdateRequestsPanel() {
  const [requests, setRequests] = useState<UpdateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<number | null>(null);

  async function loadRequests() {
    setLoading(true);
    try {
      setRequests(await getPendingUpdateRequests());
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function review(request: UpdateRequest, decision: "approved" | "rejected") {
    const subject = request.requestType === "delete"
      ? `deletion of "${request.reason ?? "knowledge item"}"`
      : `Hut update for "${request.proposedData?.name ?? "Hut"}"`;

    if (!window.confirm(
      decision === "approved"
        ? `Approve ${subject}?`
        : `Reject ${subject}?`
    )) return;

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
      {loading ? (
        <p className="text-sm text-slate-500">Loading requests...</p>
      ) : requests.length === 0 ? (
        <p className="text-sm text-slate-500">No pending update requests.</p>
      ) : (
        requests.map(request => {
          const isDelete = request.requestType === "delete";
          const title = isDelete
            ? request.reason ?? "Knowledge item"
            : request.proposedData?.name ?? "Hut";

          return (
            <div key={request.id} className="rounded-lg border border-slate-300 bg-white p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="font-medium text-slate-900">{title}</div>
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${isDelete ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"}`}>
                  {isDelete ? "Deletion" : "Hut update"}
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Requested {new Date(request.requestedAt).toLocaleDateString("en-GB")}
              </p>

              {isDelete ? (
                <p className="mt-2 text-sm text-slate-600">
                  {request.reason && request.reason !== title ? request.reason : "Deletion requested for this knowledge item."}
                </p>
              ) : (
                <div className="mt-3 grid gap-2">
                  {Object.entries(request.proposedData ?? {})
                    .filter(([key, value]) => key !== "photos" && value !== undefined && value !== "")
                    .map(([key, value]) => (
                      <div key={key} className="rounded border border-slate-200 bg-slate-50 p-2">
                        <div className="text-xs font-semibold text-slate-500">{labels[key] ?? key}</div>
                        <div className="mt-1 break-words text-sm text-slate-800">{displayValue(value)}</div>
                      </div>
                    ))}
                </div>
              )}

              <div className="mt-3 flex gap-2">
                <button
                  disabled={workingId === request.id}
                  onClick={() => review(request, "approved")}
                  className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  disabled={workingId === request.id}
                  onClick={() => review(request, "rejected")}
                  className="flex-1 rounded-lg bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-300 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          );
        })
      )}

      <button
        type="button"
        onClick={loadRequests}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        Refresh requests
      </button>
    </div>
  );
}
