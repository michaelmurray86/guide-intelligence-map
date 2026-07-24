"use client";

import { useEffect, useState } from "react";
import GuideNoteForm from "./GuideNoteForm";
import { GuideNote, GuideNoteCategory } from "@/Types/GuideNote";

type Props = {
  open: boolean;
  editingNote?: GuideNote | null;
  onSave: (
    title: string,
    description: string,
    category: GuideNoteCategory
  ) => void;
  onCancel: () => void;
};

export default function AddGuideNotePanel({
  open,
  editingNote,
  onSave,
  onCancel,
}: Props) {
const [title, setTitle] = useState("");
const [description, setDescription] = useState("");

const [category, setCategory] =
  useState<GuideNoteCategory>("information");


useEffect(() => {

  if (editingNote) {

    setTitle(editingNote.title);
    setDescription(editingNote.description);
    setCategory(editingNote.category);

  } else {

    setTitle("");
    setDescription("");
    setCategory("information");

  }

}, [editingNote]);

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
        {editingNote ? "Edit Guide Note" : "Add Guide Note"}
      </h2>

      <p className="mt-2 mb-6 text-sm text-slate-600">
          {editingNote
            ? "Update the guide intelligence details below."
            : "Clicked location has been selected. Enter the details below."
          }
      </p>

      <GuideNoteForm
        title={title}
        description={description}
        category={category}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
        onCategoryChange={setCategory}
      />

<div className="flex gap-3">

  <button
    className="
      flex-1
      rounded-lg
      bg-slate-200
      py-3
      font-semibold
      text-slate-800
      hover:bg-slate-300
    "
    onClick={onCancel}
  >
    Cancel
  </button>


  <button
    className="
      flex-1
      rounded-lg
      bg-blue-600
      py-3
      font-semibold
      text-white
      hover:bg-blue-700
    "
    onClick={() => {

      onSave(
        title,
        description,
        category
      );

      setTitle("");
      setDescription("");
      setCategory("information");

    }}
  >
    {editingNote
      ? "Save Changes"
      : "Save Guide Note"}
  </button>

</div>
    </aside>
  );
}