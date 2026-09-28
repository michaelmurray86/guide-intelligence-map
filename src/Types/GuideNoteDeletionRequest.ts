export type GuideNoteDeletionRequest = {
  id: number;
  guideNoteId: number | null;
  requestedBy: string;
  requestedAt: string;
  reason?: string | null;
  status: "pending" | "approved" | "rejected";
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  reviewComment?: string | null;
  noteTitle?: string;
};