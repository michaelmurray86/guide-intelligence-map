"use client";

import { GuideNoteCategory } from "@/Types/GuideNote";

type Props = {
  title: string;
  description: string;
  category: GuideNoteCategory;

  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCategoryChange: (value: GuideNoteCategory) => void;
};

export default function GuideNoteForm({
  title,
  description,
  category,
  onTitleChange,
  onDescriptionChange,
  onCategoryChange,
}: Props) {
  return (
    <>
      <label className="block mb-2 text-sm font-semibold text-slate-700">
        Category
      </label>

      <select
        className="mb-5 w-full rounded-lg border border-slate-300 p-2 text-slate-800"
        value={category}
        onChange={(e) =>
          onCategoryChange(e.target.value as GuideNoteCategory)
        }
      >
        <option value="water">💧 Water</option>
        <option value="hazard">⚠️ Hazard</option>
        <option value="hut">🛖 Hut</option>
        <option value="cafe">☕ Café</option>
        <option value="toilet">🚻 Toilet</option>
        <option value="snow">❄ Snow Patch</option>
        <option value="information">ℹ️ Information</option>
      </select>

      <label className="block mb-2 text-sm font-semibold text-slate-700">
        Title
      </label>

      <input
        className="mb-5 w-full rounded-lg border border-slate-300 p-2 text-slate-800"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
      />

      <label className="block mb-2 text-sm font-semibold text-slate-700">
        Description
      </label>

      <textarea
        rows={5}
        className="mb-6 w-full rounded-lg border border-slate-300 p-2 text-slate-800"
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
      />
    </>
  );
}