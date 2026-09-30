import { useCallback, useEffect, useRef, useState } from "react";

import { GuideNote } from "@/Types/GuideNote";
import { getGuideNotes } from "@/lib/guideNoteDatabase";

const MAX_LOAD_ATTEMPTS = 3;

export function useGuideNotes() {
  const [notes, setNotes] = useState<GuideNote[]>([]);
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef(false);

  const loadNotes = useCallback(async () => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      for (let attempt = 1; attempt <= MAX_LOAD_ATTEMPTS; attempt += 1) {
        try {
          const data = await getGuideNotes();
          setNotes(data);
          return;
        } catch (error) {
          console.error(`Guide notes load attempt ${attempt} failed:`, error);

          if (attempt < MAX_LOAD_ATTEMPTS) {
            await new Promise(resolve =>
              setTimeout(resolve, attempt * 750)
            );
          }
        }
      }
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotes();

    const handleNotesChanged = () => {
      loadNotes();
    };

    const handleRetry = () => {
      if (document.visibilityState === "visible") {
        loadNotes();
      }
    };

    window.addEventListener("guide-notes-changed", handleNotesChanged);
    window.addEventListener("online", handleRetry);
    document.addEventListener("visibilitychange", handleRetry);

    return () => {
      window.removeEventListener("guide-notes-changed", handleNotesChanged);
      window.removeEventListener("online", handleRetry);
      document.removeEventListener("visibilitychange", handleRetry);
    };
  }, [loadNotes]);

  return {
    notes,
    setNotes,
    loading,
    reloadNotes: loadNotes,
  };
}
