export default function Sidebar() {
  return (
    <aside className="w-72 bg-white border-r p-4 overflow-y-auto">
      <h2 className="font-semibold mb-4">
        Layers
      </h2>

      <div className="space-y-2">

        <h3 className="font-medium mt-4">
          Guide Intelligence
        </h3>

        <label className="block">
          <input type="checkbox" defaultChecked /> Guide Notes
        </label>

        <label className="block">
          <input type="checkbox" defaultChecked /> Water
        </label>

        <label className="block">
          <input type="checkbox" defaultChecked /> Huts
        </label>

        <label className="block">
          <input type="checkbox" defaultChecked /> Hazards
        </label>

        <h3 className="font-medium mt-6">
          Official Layers
        </h3>

        <label className="block">
          <input type="checkbox" defaultChecked /> Hiking Routes
        </label>

        <label className="block">
          <input type="checkbox" /> Hiking Grades
        </label>

        <label className="block">
          <input type="checkbox" /> Closures
        </label>

      </div>
    </aside>
  );
}