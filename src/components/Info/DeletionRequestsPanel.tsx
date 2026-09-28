"use client";

import { useEffect, useState } from "react";

import {
  approveGuideNoteDeletion,
  getPendingGuideNoteDeletionRequests,
  rejectGuideNoteDeletion,
} from "@/lib/guideNoteDatabase";

import { GuideNoteDeletionRequest } from "@/Types/GuideNoteDeletionRequest";


export default function DeletionRequestsPanel() {
  const [requests, setRequests] = useState<GuideNoteDeletionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<number | null>(null);

  async function loadRequests() {
    setLoading(true);

    const data = await getPendingGuideNoteDeletionRequests();

    setRequests(data);
    setLoading(false);
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function review(
    request: GuideNoteDeletionRequest,
    action: "approve" | "reject"
  ) {
    const message =
      action === "approve"
        ? `Approve deletion of "${request.noteTitle}"?`
        : `Reject deletion of "${request.noteTitle}"?`;

    if (!confirm(message)) {
      return;
    }

    setWorkingId(request.id);

    const success =
      action === "approve"
        ? await approveGuideNoteDeletion(request.id)
        : await rejectGuideNoteDeletion(request.id);

    if (success) {
      setRequests(current =>
        current.filter(item => item.id !== request.id)
      );

      window.dispatchEvent(
        new Event("guide-notes-changed")
      );
    }

    setWorkingId(null);
  }

  return (
    <div className="space-y-3">
      {loading ? (
        <p className="text-sm text-slate-500">
          Loading requests...
        </p>
      ) : requests.length === 0 ? (
        <p className="text-sm text-slate-500">
          No pending deletion requests.
        </p>
      ) : (
        requests.map(request => (
          <div
            key={request.id}
            className="rounded-lg border border-slate-300 bg-white p-3"
          >
            <div className="font-medium text-slate-900">
              {request.noteTitle}
            </div>

            {request.reason && (
              <p className="mt-1 text-sm text-slate-600">
                {request.reason}
              </p>
            )}

            <p className="mt-2 text-xs text-slate-500">
              Requested{" "}
              {new Date(request.requestedAt).toLocaleDateString("en-GB")}
            </p>

            <div className="mt-3 flex gap-2">
              <button
                disabled={workingId === request.id}
                onClick={() => review(request, "approve")}
                className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              >
                Approve
              </button>

              <button
                disabled={workingId === request.id}
                onClick={() => review(request, "reject")}
                className="flex-1 rounded-lg bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-300 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}

      <button
        onClick={loadRequests}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        Refresh requests
      </button>
    </div>
  );
}
