"use client";

import { useEffect, useState } from "react";
import { loadGuideNotesFromSupabase } from "@/lib/loadGuideNotes";

export default function TestSupabasePage() {

  const [notes,setNotes] = useState<any[]>([]);


  useEffect(() => {

    async function load(){

      const data =
        await loadGuideNotesFromSupabase();

      setNotes(data);

    }

    load();

  },[]);


  return (
    <div style={{padding:20}}>
      <h1>Supabase Test</h1>

      <pre>
        {JSON.stringify(notes,null,2)}
      </pre>

    </div>
  );
}