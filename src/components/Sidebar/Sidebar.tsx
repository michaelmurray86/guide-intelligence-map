import { GuideFilters } from "@/types/GuideFilters";

type Props = {
  filters: GuideFilters;
  setFilters: React.Dispatch<React.SetStateAction<GuideFilters>>;
};

export default function Sidebar({
  filters,
  setFilters,
}: Props) {

  const toggle = (key: keyof GuideFilters) => {
    setFilters({
      ...filters,
      [key]: !filters[key],
    });
  };

  return (
    <aside className="w-80 bg-slate-50 border-r border-slate-300 p-6 overflow-y-auto text-slate-800">

      <h1 className="mb-8 text-2xl font-bold">
        Guide Intelligence
      </h1>

      <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">
        Guide Intelligence Layers
      </h2>

      <div className="space-y-3">

        <label className="flex items-center gap-3 cursor-pointer text-slate-700">
          <input
            type="checkbox"
            checked={filters.water}
            onChange={() => toggle("water")}
          />
          💧 Water
        </label>

        <label className="flex items-center gap-3 cursor-pointer text-slate-700">
          <input
            type="checkbox"
            checked={filters.hazard}
            onChange={() => toggle("hazard")}
          />
          ⚠️ Hazards
        </label>

        <label className="flex items-center gap-3 cursor-pointer text-slate-700">
          <input
            type="checkbox"
            checked={filters.hut}
            onChange={() => toggle("hut")}
          />
          🛖 Huts
        </label>

        <label className="flex items-center gap-3 cursor-pointer text-slate-700">
          <input
            type="checkbox"
            checked={filters.cafe}
            onChange={() => toggle("cafe")}
          />
          ☕ Cafés
        </label>

        <label className="flex items-center gap-3 cursor-pointer text-slate-700">
          <input
            type="checkbox"
            checked={filters.toilet}
            onChange={() => toggle("toilet")}
          />
          🚻 Toilets
        </label>

        <label className="flex items-center gap-3 cursor-pointer text-slate-700">
         <input
            type="checkbox"
            checked={filters.snow}
            onChange={() => toggle("snow")}
          />
          ❄️ Snow Patches
        </label>

        <label className="flex items-center gap-3 cursor-pointer text-slate-700">
          <input
            type="checkbox"
            checked={filters.information}
            onChange={() => toggle("information")}
          />
          ℹ️ Information
        </label>

        <label className="flex items-center gap-3 cursor-pointer text-slate-700">
  <input
    type="checkbox"
    checked={filters.sections}
    onChange={() => toggle("sections")}
  />
  🟧 Guide Intelligence Sections
</label>

      </div>

    </aside>
  );
}