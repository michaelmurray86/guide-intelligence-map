"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { parseGPX } from "@/lib/parseGPX";
import {
  createGuideSection,
  updateGuideSection,
  deleteGuideSection,
  GUIDE_SECTION_COLORS,
} from "@/lib/guideSectionDatabase";
import {
  GuideSection,
  GuideSectionGuidanceLevel,
} from "@/Types/GuideSection";
import { GPXRoute } from "@/Types/GPXRoute";
import { deleteGuideNotePhotos, uploadGuideNotePhotos } from "@/lib/guideNoteStorage";

type Props = {
  onCancel: () => void;
  onCreated?: (section: Awaited<ReturnType<typeof createGuideSection>>) => void;
  onUpdated?: (section: GuideSection | null) => void;
  onPreview: (route: GPXRoute | null) => void;
  createdBy?: string;
  existingSection?: GuideSection | null;
};

const levels: {
  value: GuideSectionGuidanceLevel;
  label: string;
  description: string;
}[] = [
  {
    value: "suitable",
    label: "Green — Suitable",
    description: "Suitable for groups.",
  },
  {
    value: "caution",
    label: "Orange — Caution",
    description: "Use caution and consider group ability.",
  },
  {
    value: "do_not_take",
    label: "Red — Do not take groups",
    description: "Instructors should not take groups along this section.",
  },
];

export default function RouteSectionEditor({
  onCancel,
  onCreated,
  onUpdated,
  onPreview,
  createdBy,
  existingSection,
}: Props) {
  const isEditing = Boolean(existingSection);
  const [route, setRoute] = useState<GPXRoute | null>(
    existingSection
      ? {
          name: existingSection.title,
          coordinates: existingSection.coordinates,
          geojson: {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: {
                  type: "LineString",
                  coordinates: existingSection.coordinates,
                },
                properties: {},
              },
            ],
          },
          previewColor:
            GUIDE_SECTION_COLORS[existingSection.guidanceLevel],
        }
      : null
  );
  const [title, setTitle] = useState(existingSection?.title ?? "");
  const [description, setDescription] = useState(
    existingSection?.description ?? ""
  );
  const [guidanceLevel, setGuidanceLevel] =
    useState<GuideSectionGuidanceLevel>(
      existingSection?.guidanceLevel ?? "caution"
    );
  const [working, setWorking] = useState(false);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [removedPhotos, setRemovedPhotos] = useState<string[]>([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const photoPickerRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const newPhotoPreviews = useMemo(() => newPhotos.map(file => URL.createObjectURL(file)), [newPhotos]);
  useEffect(() => () => newPhotoPreviews.forEach(url => URL.revokeObjectURL(url)), [newPhotoPreviews]);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setWorking(true);

    try {
      const parsed = await parseGPX(file);
      const previewRoute = {
        ...parsed,
        previewColor: GUIDE_SECTION_COLORS[guidanceLevel],
      };
      setRoute(previewRoute);
      setTitle(parsed.name);
      onPreview(previewRoute);
    } catch (err) {
      setRoute(null);
      onPreview(null);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to read this GPX file."
      );
    } finally {
      setWorking(false);
    }
  };

  const handleGuidanceChange = (
    level: GuideSectionGuidanceLevel
  ) => {
    setGuidanceLevel(level);

    if (route) {
      const updatedRoute = {
        ...route,
        previewColor: GUIDE_SECTION_COLORS[level],
      };
      setRoute(updatedRoute);
      onPreview(updatedRoute);
    }
  };

  const handleSave = async () => {
    if (!route) {
      setError("Import a GPX file first.");
      return;
    }

    if (!title.trim()) {
      setError("Enter a name for this Route Section.");
      return;
    }

    if (route.coordinates.length < 2) {
      setError("The Route Section does not contain enough coordinates.");
      return;
    }

    setError(null);
    setWorking(true);

    if (isEditing && existingSection) {
      const existingPhotos = existingSection.photos ?? [];
      const keptPhotos = existingPhotos.filter(photo => !removedPhotos.includes(photo));
      const uploadedPhotos = await uploadGuideNotePhotos(existingSection.id, newPhotos);
      if (uploadedPhotos === null) {
        setWorking(false);
        setError("One or more photos could not be uploaded.");
        return;
      }

      const section = await updateGuideSection(existingSection.id, {
        title: title.trim(),
        description: description.trim(),
        guidanceLevel,
        updatedBy: createdBy,
        photos: [...keptPhotos, ...uploadedPhotos],
      });

      setWorking(false);

      if (!section) {
        await deleteGuideNotePhotos(uploadedPhotos);
        setWorking(false);
        setError("The Route Section could not be updated.");
        return;
      }

      const photosToDelete = removedPhotos.filter(photo => !photo.startsWith("http") && !photo.startsWith("/images/"));
      if (photosToDelete.length > 0) await deleteGuideNotePhotos(photosToDelete);

      onPreview(null);
      onUpdated?.(section);
      return;
    }

    const section = await createGuideSection({
      title: title.trim(),
      description: description.trim(),
      coordinates: route.coordinates,
      guidanceLevel,
      createdBy,
      photos: [],
    });

    if (!section) {
      setWorking(false);
      setError("The Route Section could not be saved.");
      return;
    }

    const uploadedPhotos = await uploadGuideNotePhotos(section.id, newPhotos);
    if (uploadedPhotos === null) {
      await deleteGuideSection(section.id);
      setWorking(false);
      setError("One or more photos could not be uploaded. The Route Section was not saved.");
      onPreview(null);
      return;
    }

    let savedSection = section;
    if (uploadedPhotos.length > 0) {
      const withPhotos = await updateGuideSection(section.id, {
        title: section.title,
        description: section.description,
        guidanceLevel: section.guidanceLevel,
        updatedBy: createdBy,
        photos: uploadedPhotos,
      });
      if (withPhotos) savedSection = withPhotos;
    }

    setWorking(false);
    onPreview(null);
    onCreated?.(savedSection);
  };

  return (
    <>
      <div className="space-y-4 rounded-lg border border-slate-300 bg-white p-4 shadow-sm">
      <div>
        <h2 className="font-semibold text-slate-900">
          {isEditing ? "Edit Route Section" : "Add Route Section"}
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          {isEditing
            ? "Update the name, description or guidance level. The route geometry stays unchanged."
            : "Import a GPX track or route, check it on the map, then save it as a centrally controlled Route Section."}
        </p>
      </div>

      {!isEditing && (
        <div className="block text-sm font-medium text-slate-700">
          GPX file
          <div className="mt-2">
            <input
              id="route-section-gpx"
              type="file"
              accept=".gpx,application/gpx+xml,application/xml,text/xml"
              onChange={handleFile}
              disabled={working}
              className="sr-only"
            />
            <label
              htmlFor="route-section-gpx"
              className="inline-flex cursor-pointer items-center rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              Choose GPX file
            </label>
            <p className="mt-2 text-xs text-slate-500">
              Click the button to select a .gpx file from your computer.
            </p>
          </div>
        </div>
      )}

      {route && (
        <div className="rounded border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          {isEditing ? (
            <>Editing route with {route.coordinates.length.toLocaleString()} coordinates.</>
          ) : (
            <>Imported {route.coordinates.length.toLocaleString()} coordinates.</>
          )}
          <br />
          The route is shown on the map as a preview.
        </div>
      )}

      <label className="block text-sm font-medium text-slate-700">
        Name
        <input
          value={title}
          onChange={event => setTitle(event.target.value)}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          placeholder="Route Section name"
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Guidance
        <select
          value={guidanceLevel}
          onChange={event =>
            handleGuidanceChange(
              event.target.value as GuideSectionGuidanceLevel
            )
          }
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
        >
          {levels.map(level => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
        <span
          className="mt-1 block h-2 rounded"
          style={{ backgroundColor: GUIDE_SECTION_COLORS[guidanceLevel] }}
        />
        <span className="mt-1 block text-xs text-slate-500">
          {levels.find(level => level.value === guidanceLevel)?.description}
        </span>
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Description
        <textarea
          value={description}
          onChange={event => setDescription(event.target.value)}
          rows={4}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          placeholder="What should instructors know about this section?"
        />
      </label>

      <section className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div className="flex items-center justify-between gap-3">
          <div><h3 className="text-sm font-semibold text-slate-800">Photos</h3><p className="text-xs text-slate-500">Add useful photos of this section for guides in the field.</p></div>
          <div className="flex gap-2"><button type="button" onClick={()=>photoPickerRef.current?.click()} disabled={working} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">Add photos</button><button type="button" onClick={()=>cameraInputRef.current?.click()} disabled={working} className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50 md:hidden">Take photo</button></div>
        </div>
        <input ref={photoPickerRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="hidden" onChange={event=>{setNewPhotos(current=>[...current,...Array.from(event.target.files??[])]);event.target.value="";}} />
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={event=>{setNewPhotos(current=>[...current,...Array.from(event.target.files??[])]);event.target.value="";}} />
        {((existingSection?.photoUrls?.length??0)+newPhotoPreviews.length)>0 ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {(existingSection?.photoUrls??[]).map((url,index)=>{const path=existingSection?.photos?.[index];const removed=path?removedPhotos.includes(path):false;return <div key={path??url} className={"relative aspect-square overflow-hidden rounded-lg border border-slate-200 "+(removed?"opacity-40":"")}><img src={url} alt="" className="h-full w-full cursor-pointer object-cover" onClick={()=>setSelectedPhotoIndex(index)}/>{path&&<button type="button" onClick={()=>setRemovedPhotos(current=>current.includes(path)?current.filter(item=>item!==path):[...current,path])} className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-lg text-white">{removed?"+":"×"}</button>}</div>})}
          {newPhotoPreviews.map((url,index)=><div key={"new-"+index} className="relative aspect-square overflow-hidden rounded-lg border border-emerald-300"><img src={url} alt="" className="h-full w-full object-cover"/><button type="button" onClick={()=>setNewPhotos(current=>current.filter((_,i)=>i!==index))} className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-lg text-white">×</button></div>)}
        </div> : <p className="text-sm text-slate-500">No photos attached.</p>}
      </section>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={working}
          className="flex-1 rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={working || !route}
          className="flex-1 rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {working
            ? "Working..."
            : isEditing
              ? "Save Changes"
              : "Save Route Section"}
        </button>
      </div>
      </div>

    {selectedPhotoIndex !== null && typeof document !== "undefined" && existingSection?.photoUrls && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4" onClick={()=>setSelectedPhotoIndex(null)}>
        <button type="button" aria-label="Close photo viewer" onClick={()=>setSelectedPhotoIndex(null)} className="fixed right-4 top-4 z-[102] flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl font-bold text-slate-800 shadow-lg">×</button>
        <div className="flex h-full w-full items-center justify-center gap-3" onClick={event=>event.stopPropagation()}>
          {existingSection.photoUrls.length>1&&<button type="button" aria-label="Previous photo" onClick={()=>setSelectedPhotoIndex(i=>i===null?null:(i-1+existingSection.photoUrls!.length)%existingSection.photoUrls!.length)} className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl">‹</button>}
          <img src={existingSection.photoUrls[selectedPhotoIndex]} alt="" className="max-h-[90vh] max-w-[calc(100vw-120px)] rounded-xl object-contain"/>
          {existingSection.photoUrls.length>1&&<button type="button" aria-label="Next photo" onClick={()=>setSelectedPhotoIndex(i=>i===null?null:(i+1)%existingSection.photoUrls!.length)} className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl">›</button>}
        </div>
      </div>
    )}
    </>
  );
}
