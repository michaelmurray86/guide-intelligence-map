"use client";

import { useState } from "react";


export default function DataSources() {

  const [open, setOpen] = useState(false);


  return (

    <div
      className="
        text-xs
        text-slate-500
      "
    >

      <button

        onClick={() => setOpen(!open)}

        className="
          underline
          hover:text-slate-700
        "

      >

        Data sources ⓘ

      </button>



      {
        open &&

        <div
          className="
            mt-3
            space-y-2
            leading-relaxed
          "
        >

          <div>

            <strong>
              Map:
            </strong>

            <br />

            © swisstopo
            <br />

            Federal Office of Topography

          </div>



          <div>

            <strong>
              Additional datasets:
            </strong>

            <br />

            • Hiking trails — swisstopo
            <br />

            • Closures — FEDRO / cantons
            <br />

            • Transport — Federal Office of Transport
            <br />

            • Guardian dogs — FOEN
            <br />

            • Shooting — Swiss Armed Forces

          </div>


        </div>

      }


    </div>

  );

}