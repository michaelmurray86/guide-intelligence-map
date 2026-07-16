export default function Header() {
  return (
    <header className="h-14 bg-slate-900 text-white border-b border-slate-700 flex items-center justify-between px-5">
      <h1 className="text-lg font-semibold">
        Guide Intelligence Map
      </h1>

      <button
        className="w-8 h-8 rounded-full border border-slate-500 hover:bg-slate-700 transition"
        title="About"
      >
        ⓘ
      </button>
    </header>
  );
}