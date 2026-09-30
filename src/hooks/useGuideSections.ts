import { useCallback, useEffect, useState } from "react";

import { GuideSection } from "@/Types/GuideSection";
import { getGuideSections } from "@/lib/guideSectionDatabase";

const MAX_LOAD_ATTEMPTS = 3;

export function useGuideSections() {
  const [sections, setSections] = useState<GuideSection[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSections = useCallback(async () => {
    setLoading(true);

    for (let attempt = 1; attempt <= MAX_LOAD_ATTEMPTS; attempt += 1) {
      const data = await getGuideSections();

      if (data.length > 0 || attempt === MAX_LOAD_ATTEMPTS) {
        setSections(data);
        setLoading(false);
        return;
      }

      await new Promise(resolve =>
        setTimeout(resolve, attempt * 750)
      );
    }
  }, []);

  useEffect(() => {
    loadSections();

    const handleSectionsChanged = () => {
      loadSections();
    };

    window.addEventListener(
      "guide-sections-changed",
      handleSectionsChanged
    );

    return () => {
      window.removeEventListener(
        "guide-sections-changed",
        handleSectionsChanged
      );
    };
  }, [loadSections]);

  return {
    sections,
    setSections,
    loading,
    reloadSections: loadSections,
  };
}
