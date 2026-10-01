export type Hut = {
  id: number;
  guideNoteId: number;

  name: string;
  elevationM?: number;

  sleepingBeds?: number;
  sleepingDormitories?: number;
  winterRoomCapacity?: number;

  showers?: string;
  picnicLunches?: boolean;
  picnicLunchCost?: string;
  waterDrinkable?: boolean;

  bookingUrl?: string;
  phone?: string;
  email?: string;
  guardianName?: string;

  vendor?: boolean;
  costs?: string;
  guideRateOffered?: boolean;

  otherNotes?: string;

  lastCheckedAt?: string;
  lastCheckedBy?: string;
  updatedAt: string;
  updatedBy?: string;
  createdAt: string;
  createdBy?: string;
};
