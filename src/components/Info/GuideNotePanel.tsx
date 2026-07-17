"use client";

import { GuideNote } from "@/types/GuideNote";
import { markerIcons } from "../map/markerIcons";

type Props = {
  note: GuideNote | null;
  onClose: () => void;
};

export default function GuideNotePanel({
  note,
  onClose,
}: Props) {
  if (!note) return null;

  return (
    <aside
      className="
        absolute
        top-4
        right-4
        w-96
        rounded-xl
        border
        border-slate-300
        bg-white
        shadow-2xl
        overflow-hidden
        z-30
      "
    >
      <div className="border-b border-slate-200 p-6">

        <div className="flex items-center gap-3">

          <div className="text-3xl">
            {markerIcons[note.category]}
          </div>

          <div>

            <h2 className="text-2xl font-bold text-slate-900">
              {note.title}
            </h2>

            <span className="mt-2 inline-block rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 capitalize">
              {note.category}
            </span>

          </div>

        </div>

      </div>

      <div className="p-6">

        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
          Description
        </h3>

        <p className="leading-7 text-slate-800">
          {note.description}
        </p>

        <div className="my-6 border-t border-slate-200" />

        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
          Last Updated
        </h3>

        <p className="text-slate-700">
          {note.updated}
        </p>

        <div className="my-6 border-t border-slate-200" />

        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
          Photo
        </h3>

        <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-500">
          No photo attached
        </div>

      </div>

    </aside>
  );
}