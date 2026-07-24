import { useEffect, useState } from "react";

import { GuideSection } from "@/types/GuideSection";
import { getGuideSections } from "@/lib/guideSectionDatabase";


export function useGuideSections() {

  const [sections, setSections] =
    useState<GuideSection[]>([]);


  useEffect(() => {

    async function loadSections() {

      const data =
        await getGuideSections();

      setSections(data);

    }

    loadSections();

  }, []);


  return {

    sections,
    setSections,

  };

}