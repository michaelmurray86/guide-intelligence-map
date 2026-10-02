"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { GuideSection } from "@/Types/GuideSection";

type Props = {
  section: GuideSection | null;
  canManage: boolean;
  onClose: () => void;
  onEdit: (section: GuideSection) => void;
  onDelete: (section: GuideSection) => void;
};

export default function RouteSectionPanel({ section, canManage, onClose, onEdit, onDelete }: Props) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  if (!section) return null;

  const guidanceLabel = section.guidanceLevel === "suitable" ? "Suitable" : section.guidanceLevel === "caution" ? "Caution" : "Do not take groups";
  const guidanceColor = section.guidanceLevel === "suitable" ? "#16a34a" : section.guidanceLevel === "caution" ? "#ea580c" : "#dc2626";
  const photos = section.photoUrls ?? section.photos ?? [];

  return (
    <>
      <aside className="pointer-events-auto fixed left-4 right-4 top-4 bottom-4 z-50 flex w-auto flex-col overflow-hidden rounded-xl border border-slate-300 bg-white shadow-xl md:left-auto md:right-15 md:top-6 md:bottom-auto md:h-auto md:max-h-[70vh] md:w-96" onClick={event => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Route Section</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">{section.title}</h2>
            <span className="mt-3 inline-block rounded-full px-3 py-1 text-sm font-semibold text-white" style={{ backgroundColor: guidanceColor }}>{guidanceLabel}</span>
          </div>
          <button type="button" onClick={event => { event.stopPropagation(); onClose(); }} className="rounded-lg px-2 py-1 text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-800" aria-label="Close">✕</button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Description</h3>
          <p className="whitespace-pre-wrap leading-7 text-slate-800">{section.description || "No description provided."}</p>
          <div className="my-6 border-t border-slate-200" />
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Photos</h3>
          {photos.length > 0 ? <div className="grid grid-cols-2 gap-3">{photos.map((photo,index)=><img key={photo} src={photo} alt="" onClick={()=>setSelectedPhotoIndex(index)} className="aspect-square w-full cursor-pointer rounded-lg object-cover transition hover:opacity-90" />)}</div> : <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-500">No photo attached</div>}
          <div className="my-6 border-t border-slate-200" />
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Last Updated</h3>
          <p className="text-slate-700">{new Date(section.updatedAt).toLocaleDateString("en-GB")} · {section.updatedBy || "Unknown"}</p>
        </div>
        {canManage && <div className="flex gap-3 border-t border-slate-200 p-4">
          <button type="button" className="pointer-events-auto flex-1 rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700" onClick={event=>{event.stopPropagation();onEdit(section);}}>Edit Section</button>
          <button type="button" className="pointer-events-auto flex-1 rounded-lg bg-red-600 py-3 font-semibold text-white hover:bg-red-700" onClick={event=>{event.stopPropagation();onDelete(section);}}>Delete Section</button>
        </div>}
      </aside>
      {selectedPhotoIndex !== null && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4" onClick={()=>setSelectedPhotoIndex(null)}>
          <button type="button" aria-label="Close photo viewer" onClick={()=>setSelectedPhotoIndex(null)} className="fixed right-4 top-4 z-[102] flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl font-bold text-slate-800 shadow-lg">×</button>
          <div className="flex h-full w-full items-center justify-center gap-3" onClick={event=>event.stopPropagation()}>
            {photos.length>1 && <button type="button" aria-label="Previous photo" onClick={()=>setSelectedPhotoIndex(i=>i===null?null:(i-1+photos.length)%photos.length)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-2xl text-slate-800 shadow-lg">‹</button>}
            <img src={photos[selectedPhotoIndex]} alt="" className="block max-h-[90vh] max-w-[calc(100vw-120px)] rounded-xl object-contain shadow-2xl" />
            {photos.length>1 && <button type="button" aria-label="Next photo" onClick={()=>setSelectedPhotoIndex(i=>i===null?null:(i+1)%photos.length)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-2xl text-slate-800 shadow-lg">›</button>}
          </div>
        </div>, document.body)}
    </>
  );
}
