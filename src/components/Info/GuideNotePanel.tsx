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
      bg-white
      rounded-xl
      shadow-2xl
      p-6
      z-20"
    >
      <div className="mb-4">

    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
  <span>{markerIcons[note.category]}</span>
  {note.title}
</h2>


      </div>

      <p className="inline-block mt-3 mb-6 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 capitalize">
        {note.category}
      </p>

      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Description
      </h3>

      <p className="mt-2 text-slate-800 leading-7">
        {note.description}
      </p>

      <hr className="my-5" />

    <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Last Updated
    </h3>

      <p className="mt-2 text-slate-700">
  {note.updated}
</p>

    </aside>
  );
}