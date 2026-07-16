"use client";

import { GuideNote } from "@/types/GuideNote";

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
      rounded-lg
      shadow-xl
      p-5
      z-20"
    >
      <div className="flex justify-between items-center mb-4">

        <h2 className="text-xl font-bold">
          {note.title}
        </h2>

        <button
          onClick={onClose}
          className="text-xl"
        >
          ✕
        </button>

      </div>

      <p className="text-sm text-slate-500 mb-5">
        {note.category}
      </p>

      <h3 className="font-semibold">
        Description
      </h3>

      <p className="mt-2">
        {note.description}
      </p>

      <hr className="my-5" />

      <p>
        <strong>Last Updated</strong>
      </p>

      <p>{note.updated}</p>

    </aside>
  );
}