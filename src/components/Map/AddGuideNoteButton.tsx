"use client";

type Props = {
  onClick: () => void;
  active: boolean;
};

export default function AddGuideNoteButton({
  onClick,
  active,
}: Props) {
  return (
    <button
      onClick={onClick}
      className={`
        absolute
        bottom-4
        right-4
        md:bottom-8
        md:right-6
        z-20
        rounded-lg
        px-3
        py-3
        md:px-4
        font-semibold
        shadow-lg
        transition
        ${
          active
            ? "bg-green-600 text-white"
            : "bg-white text-slate-800 hover:bg-slate-100"
        }
      `}
    >
      <span className="md:hidden">+ Add</span>
      <span className="hidden md:inline">+ Add Knowledge Point</span>
    </button>
  );
}