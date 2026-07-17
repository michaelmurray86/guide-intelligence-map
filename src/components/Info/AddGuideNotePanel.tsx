"use client";

import { useState } from "react";

type Props = {
  open: boolean;
  onSave: (
    title: string,
    description: string,
    category: string
  ) => void;
};

export default function AddGuideNotePanel({
  open,
  onSave,
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("information");

  if (!open) return null;

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
        p-6
        shadow-2xl
        z-30
      "
    >
      <h2 className="text-2xl font-bold text-slate-900">
        Add Guide Note
      </h2>

      <p className="mt-2 mb-6 text-sm text-slate-600">
        Clicked location has been selected. Enter the details below.
      </p>

      <label className="block mb-2 text-sm font-semibold text-slate-700">
        Category
      </label>

      <select
        className="mb-5 w-full rounded-lg border border-slate-300 p-2 text-slate-800"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="water">💧 Water</option>
        <option value="hazard">⚠️ Hazard</option>
        <option value="hut">🛖 Hut</option>
        <option value="cafe">☕ Café</option>
        <option value="information">ℹ️ Information</option>
      </select>

      <label className="block mb-2 text-sm font-semibold text-slate-700">
        Title
      </label>

      <input
        className="mb-5 w-full rounded-lg border border-slate-300 p-2 text-slate-800"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label className="block mb-2 text-sm font-semibold text-slate-700">
        Description
      </label>

      <textarea
        rows={5}
        className="mb-6 w-full rounded-lg border border-slate-300 p-2 text-slate-800"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <button
        className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
        onClick={() => {
          onSave(title, description, category);

          setTitle("");
          setDescription("");
          setCategory("information");
        }}
      >
        Save Guide Note
      </button>
    </aside>
  );
}