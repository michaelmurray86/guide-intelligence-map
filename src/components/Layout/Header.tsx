export default function Header() {
  return (
    <header className="h-14 bg-white border-b flex items-center justify-between px-4">
      <h1 className="font-semibold text-lg">
        Guide Intelligence Map
      </h1>

      <button
        className="w-8 h-8 rounded-full border hover:bg-gray-100"
        title="About"
      >
        ⓘ
      </button>
    </header>
  );
}