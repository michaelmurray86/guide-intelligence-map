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
        bottom-6
        right-6
        z-20
        rounded-lg
        px-4
        py-3
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
      + Add Guide Note
    </button>
  );
}