import { GuideNote } from "@/types/GuideNote";

const STORAGE_KEY = "guide-intelligence-notes";

export function loadGuideNotes(
  initialNotes: GuideNote[]
): GuideNote[] {

  if (typeof window === "undefined") {
    return initialNotes;
  }

  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(initialNotes)
    );

    return initialNotes;
  }

  return JSON.parse(stored);
}


export function saveGuideNotes(
  notes: GuideNote[]
) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(notes)
  );
}