import { guideNotes } from "@/data/guideNotes";

export default function Sidebar() {
  return (
    <aside className="w-80 bg-slate-100 border-r border-slate-300 p-5 overflow-y-auto text-slate-800">

      <h2 className="text-xl font-semibold mb-6">
        Layers
      </h2>

      <div className="space-y-6">

        <div>
          <h3 className="font-semibold text-slate-900 mb-2">
            Guide Intelligence
          </h3>

<label className="block">
  <input type="checkbox" defaultChecked /> 💧 Water
</label>

<label className="block">
  <input type="checkbox" defaultChecked /> ⚠️ Hazards
</label>

<label className="block">
  <input type="checkbox" defaultChecked /> 🛖 Huts
</label>

<label className="block">
  <input type="checkbox" defaultChecked /> ☕ Cafés
</label>

<label className="block">
  <input type="checkbox" defaultChecked /> ℹ️ Information
</label>

        </div>

        <div>
          <h3 className="font-semibold text-slate-900 mb-2">
            Official SwissTopo
          </h3>

          <label className="block"><input type="checkbox" defaultChecked /> Hiking Routes</label>
          <label className="block"><input type="checkbox" /> Hiking Difficulty (Yellow / Red / Blue)</label>
          <label className="block"><input type="checkbox" /> Trail Closures</label>
        </div>

      </div>

      <hr className="my-8" />

<div className="text-sm text-slate-700">

    <h3 className="font-semibold mb-2">
        Guide Intelligence
    </h3>

    <p>
        Guide Notes: {guideNotes.length}
    </p>

    <p className="mt-3">
        Last Updated
    </p>

    <p>July 2026</p>

    <p className="mt-6 text-slate-500">
        Prototype 0.2
    </p>

</div>

    </aside>
  );
}
