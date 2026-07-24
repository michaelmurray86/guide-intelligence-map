import { useEffect, useState } from "react";

import { GuideNote } from "@/types/GuideNote";
import { getGuideNotes } from "@/lib/guideNoteDatabase";


export function useGuideNotes() {

  const [notes, setNotes] =
    useState<GuideNote[]>([]);


  useEffect(() => {

    async function loadNotes() {

      const data =
        await getGuideNotes();

      setNotes(data);

    }

    loadNotes();

  }, []);


  return {

    notes,
    setNotes,

  };

}