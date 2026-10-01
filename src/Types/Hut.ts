export type Hut = {
  id: number;
  guideNoteId: number;

  name: string;
  shortDescription?: string;
  elevationM?: number;

  sleepingBeds?: number;
  sleepingDormitories?: number;
  winterRoomCapacity?: number;
  winterRoomDetails?: string;
  openingDate?: string;
  closingDate?: string;

  showers?: string;
  picnicLunches?: boolean;
  picnicLunchCost?: string;
  dinnerTime?: string;
  waterDrinkable?: boolean;

  bookingUrl?: string;
  phone?: string;
  email?: string;
  guardianName?: string;

  vendor?: boolean;
  costs?: string;
  guideRateOffered?: boolean;

  otherNotes?: string;

  photos?: string[];
  photoUrls?: string[];

  lastCheckedAt?: string;
  lastCheckedBy?: string;
  updatedAt: string;
  updatedBy?: string;
  createdAt: string;
  createdBy?: string;
};
