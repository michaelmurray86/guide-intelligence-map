import { useCallback, useEffect, useRef, useState } from "react";

import { GuideSection } from "@/Types/GuideSection";
import { getGuideSections } from "@/lib/guideSectionDatabase";

const MAX_LOAD_ATTEMPTS = 3;

export function useGuideSections() {
  const [sections, setSections] = useState<GuideSection[]>([]);
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef(false);

  const loadSections = useCallback(async () => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      for (let attempt = 1; attempt <= MAX_LOAD_ATTEMPTS; attempt += 1) {
        try {
          const data = await getGuideSections();
          setSections(data);
          return;
        } catch (error) {
          console.error(`Guide sections load attempt ${attempt} failed:`, error);

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
    loadSections();

    const handleSectionsChanged = () => {
      loadSections();
    };

    const handleRetry = () => {
      loadSections();
    };

    window.addEventListener("guide-sections-changed", handleSectionsChanged);
    window.addEventListener("online", handleRetry);
    document.addEventListener("visibilitychange", handleRetry);

    return () => {
      window.removeEventListener(
        "guide-sections-changed",
        handleSectionsChanged
      );
      window.removeEventListener("online", handleRetry);
      document.removeEventListener("visibilitychange", handleRetry);
    };
  }, [loadSections]);

  return {
    sections,
    setSections,
    loading,
    reloadSections: loadSections,
  };
}
