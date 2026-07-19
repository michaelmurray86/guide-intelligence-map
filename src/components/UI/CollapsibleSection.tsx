"use client";

import { ReactNode, useState } from "react";

type Props = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

export default function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: Props) {

  const [open, setOpen] = useState(defaultOpen);

  return (

    <div className="mb-5 rounded-xl border border-slate-200 bg-white shadow-md">

      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left font-semibold text-slate-800"
      >

        {title}

        <span>
          {open ? "▲" : "▼"}
        </span>

      </button>

      {open && (

        <div className="border-t border-slate-200 px-5 py-4">

          {children}

        </div>

      )}

    </div>

  );
}