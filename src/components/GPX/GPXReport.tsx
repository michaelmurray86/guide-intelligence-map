"use client";

import { RouteKnowledgeItem } from "@/lib/gpxAnalysis";


type Props = {
  notes: RouteKnowledgeItem[];

  onSelectNote?: (
    note: RouteKnowledgeItem
  ) => void;
};


export default function GPXReport({
  notes,
  onSelectNote,
}: Props) {


  return (

    <div
      className="
        rounded-xl
        bg-white
        border
        border-slate-200
        shadow-md
        p-5
      "
    >


      <h2
        className="
          font-bold
          text-lg
          mb-4
          text-slate-800
        "
      >
        🥾 Route Knowledge Report
      </h2>



      {
        notes.length === 0 ?


        (

          <p className="text-slate-600">
            No nearby knowledge notes found.
          </p>

        )


        :


        (

          <div className="space-y-4">


            <p
              className="
                text-sm
                text-slate-600
              "
            >
              {notes.length} knowledge notes found along route
            </p>



            {
              notes.map((item) => (

                <div

                  key={item.note.id}

                  onClick={() =>
                    onSelectNote?.(item)
                  }

                  className="
                    border-b
                    border-slate-200
                    pb-3
                    cursor-pointer
                    rounded-md
                    p-2
                    transition
                    hover:bg-slate-50
                  "

                >


                  <div
                    className="
                      flex
                      justify-between
                      items-start
                      gap-3
                    "
                  >


                    <h3
                      className="
                        font-semibold
                        text-slate-800
                      "
                    >
                      {item.note.title}
                    </h3>



                    <span
                      className="
                        text-xs
                        whitespace-nowrap
                        text-slate-500
                      "
                    >
                      {(
                        item.distanceAlongRoute / 1000
                      ).toFixed(1)} km
                    </span>


                  </div>



                  <p
                    className="
                      text-sm
                      text-slate-600
                      mt-1
                    "
                  >
                    {item.note.description}
                  </p>



                </div>

              ))
            }


          </div>

        )

      }


    </div>

  );

}