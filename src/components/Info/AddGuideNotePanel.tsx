"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import GuideNoteForm from "./GuideNoteForm";
import { GuideNote, GuideNoteCategory } from "@/Types/GuideNote";

type Props = {
  open: boolean;
  editingNote?: GuideNote | null;
  onSave: (
    title: string,
    description: string,
    category: GuideNoteCategory,
    newPhotos: File[],
    removedPhotos: string[]
  ) => void | Promise<void>;
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

  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [existingPhotoUrls, setExistingPhotoUrls] = useState<string[]>([]);
  const [removedPhotos, setRemovedPhotos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const photoPickerRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title);
      setDescription(editingNote.description);
      setCategory(editingNote.category);
      setNewPhotos([]);
      setExistingPhotos(editingNote.photos ?? []);
      setExistingPhotoUrls(
        editingNote.photoUrls ?? editingNote.photos ?? []
      );
      setRemovedPhotos([]);
    } else {
      setTitle("");
      setDescription("");
      setCategory("information");
      setNewPhotos([]);
      setExistingPhotos([]);
      setExistingPhotoUrls([]);
      setRemovedPhotos([]);
    }
  }, [editingNote]);

  const newPhotoPreviews = useMemo(
    () => newPhotos.map(file => URL.createObjectURL(file)),
    [newPhotos]
  );

  useEffect(() => {
    return () => {
      newPhotoPreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [newPhotoPreviews]);

  if (!open) return null;

  const handlePhotoSelection = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files ?? []);

    setNewPhotos(current => [...current, ...files]);

    event.target.value = "";
  };

  const removeNewPhoto = (index: number) => {
    setNewPhotos(current =>
      current.filter((_, photoIndex) => photoIndex !== index)
    );
  };

  const removeExistingPhoto = (index: number) => {
    const path = existingPhotos[index];

    if (path) {
      setRemovedPhotos(current => [...current, path]);
    }

    setExistingPhotos(current =>
      current.filter((_, photoIndex) => photoIndex !== index)
    );

    setExistingPhotoUrls(current =>
      current.filter((_, photoIndex) => photoIndex !== index)
    );
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      await onSave(
        title,
        description,
        category,
        newPhotos,
        removedPhotos
      );

      if (!editingNote) {
        setTitle("");
        setDescription("");
        setCategory("information");
        setNewPhotos([]);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <aside
      className="
        absolute
        top-4
        bottom-4
        left-4
        right-4
        w-auto
        max-h-none
        md:top-4
        md:left-auto
        md:right-4
        md:w-96
        md:max-h-[90vh]
        overflow-y-auto
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
          : "The location has been selected. Enter the details below."}
      </p>

      <GuideNoteForm
        title={title}
        description={description}
        category={category}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
        onCategoryChange={setCategory}
      />

      <div className="mb-6">
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Photos
        </label>

        <input
          ref={photoPickerRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={handlePhotoSelection}
          className="hidden md:block w-full cursor-pointer text-sm text-slate-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-slate-700 file:px-4 file:py-2 file:font-semibold file:text-white file:hover:bg-slate-800"
        />

        <div className="grid grid-cols-2 gap-2 md:hidden">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="rounded-lg border border-slate-300 bg-slate-700 px-3 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            📷 Take Photo
          </button>

          <button
            type="button"
            onClick={() => photoPickerRef.current?.click()}
            className="rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            🖼️ Choose from phone
          </button>
        </div>

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoSelection}
          className="hidden"
          aria-hidden="true"
        />

        <p className="mt-1 text-xs text-slate-500">
          You can select multiple photos. Maximum 10 MB per photo.
        </p>

        {(existingPhotoUrls.length > 0 || newPhotoPreviews.length > 0) && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            {existingPhotoUrls.map((url, index) => (
              <div
                key={existingPhotos[index] ?? url}
                className="relative aspect-square overflow-hidden rounded-lg border border-slate-200"
              >
                <img
                  src={url}
                  alt=""
                  className="h-full w-full object-cover"
                />

                <button
                  type="button"
                  onClick={() => removeExistingPhoto(index)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-sm text-white hover:bg-black"
                  aria-label="Remove photo"
                  title="Remove photo"
                >
                  ×
                </button>
              </div>
            ))}

            {newPhotoPreviews.map((url, index) => (
              <div
                key={url}
                className="relative aspect-square overflow-hidden rounded-lg border border-blue-200"
              >
                <img
                  src={url}
                  alt=""
                  className="h-full w-full object-cover"
                />

                <button
                  type="button"
                  onClick={() => removeNewPhoto(index)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-sm text-white hover:bg-black"
                  aria-label="Remove photo"
                  title="Remove photo"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

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
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
          disabled={saving}
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
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
          disabled={saving}
          onClick={handleSave}
        >
          {saving
            ? "Saving..."
            : editingNote
              ? "Save Changes"
              : "Save Guide Note"}
        </button>
      </div>
    </aside>
  );
}
