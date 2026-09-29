"use client";

import { GuideSection } from "@/Types/GuideSection";

type Props = {
  section: GuideSection | null;
  canManage: boolean;
  onClose: () => void;
  onEdit: (section: GuideSection) => void;
  onDelete: (section: GuideSection) => void;
};

export default function RouteSectionPanel({
  section,
  canManage,
  onClose,
  onEdit,
  onDelete,
}: Props) {
  if (!section) return null;

  const guidanceLabel =
    section.guidanceLevel === "suitable"
      ? "Suitable"
      : section.guidanceLevel === "caution"
        ? "Caution"
        : "Do not take groups";

  const guidanceColor =
    section.guidanceLevel === "suitable"
      ? "#16a34a"
      : section.guidanceLevel === "caution"
        ? "#ea580c"
        : "#dc2626";

  return (
    <aside
      className="pointer-events-auto fixed left-3 right-3 top-3 z-50 flex h-[calc(100vh-24px)] max-h-[calc(100vh-24px)] w-auto flex-col overflow-hidden rounded-xl border border-slate-300 bg-white shadow-xl md:left-auto md:right-15 md:top-6 md:h-auto md:max-h-[70vh] md:w-96"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Route Section
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            {section.title}
          </h2>
          <span
            className="mt-3 inline-block rounded-full px-3 py-1 text-sm font-semibold text-white"
            style={{ backgroundColor: guidanceColor }}
          >
            {guidanceLabel}
          </span>
        </div>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
          className="rounded-lg px-2 py-1 text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-800"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div className="overflow-y-auto p-6">
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
          Description
        </h3>
        <p className="whitespace-pre-wrap leading-7 text-slate-800">
          {section.description || "No description provided."}
        </p>

        <div className="my-6 border-t border-slate-200" />

        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
          Last Updated
        </h3>
        <p className="text-slate-700">
          {new Date(section.updatedAt).toLocaleDateString("en-GB")} · {section.updatedBy || "Unknown"}
        </p>
      </div>

      {canManage && (
        <div className="flex gap-3 border-t border-slate-200 p-4">
          <button
            type="button"
            className="pointer-events-auto flex-1 rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(section);
            }}
          >
            Edit Section
          </button>
          <button
            type="button"
            className="pointer-events-auto flex-1 rounded-lg bg-red-600 py-3 font-semibold text-white hover:bg-red-700"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(section);
            }}
          >
            Delete Section
          </button>
        </div>
      )}
    </aside>
  );
}
