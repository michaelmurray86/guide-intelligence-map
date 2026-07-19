"use client";

type Props = {
  checked: boolean;
  onChange: () => void;
  label: string;
};

export default function ToggleSwitch({
  checked,
  onChange,
  label,
}: Props) {
  return (
    <button
      onClick={onChange}
      className="flex w-full items-center justify-between text-left"
    >

      <span className="text-sm font-medium text-slate-800">
        {label}
      </span>


      <span
        className={`
          relative
          h-5
          w-9
          rounded-full
          transition
          ${
            checked
              ? "bg-blue-600"
              : "bg-slate-300"
          }
        `}
      >

        <span
          className={`
            absolute
            top-0.5
            h-4
            w-4
            rounded-full
            bg-white
            shadow
            transition-transform
            ${
              checked
                ? "translate-x-4"
                : "translate-x-0.5"
            }
          `}
        />

      </span>

    </button>
  );
}