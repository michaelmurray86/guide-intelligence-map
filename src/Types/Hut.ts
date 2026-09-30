export type Hut = {
  id: number;
  guideNoteId: number;

  name: string;
  alternativeNames: string[];

  country?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  elevationM?: number;

  summerAccess?: string;
  winterAccess?: string;
  approachRoutes?: string;
  typicalApproachTime?: string;
  approachDifficulty?: string;
  seasonalRestrictions?: string;

  sleepingCapacity?: number;
  winterRoom?: string;
  foodAndMeals?: string;
  picnicLunches?: boolean;
  water?: string;
  waterDrinkable?: boolean;
  toilets?: string;
  showers?: string;
  electricity?: string;
  wifi?: string;
  cooking?: string;
  blanketsMattresses?: string;

  bookingRequired?: boolean;
  bookingUrl?: string;
  phone?: string;
  email?: string;

  vendor?: boolean;
  vendorStatusExpiresAt?: string;
  guideRateOffered?: boolean;
  guardianName?: string;
  guardianEmail?: string;
  guardianPhone?: string;
  maxCapacity?: number;

  emergencyInformation?: string;
  nearbyHazards?: string;
  usefulRouteInformation?: string;
  instructorNotes?: string;

  photos: string[];

  lastCheckedAt?: string;
  lastCheckedBy?: string;
  source?: string;
  updatedAt: string;
  updatedBy?: string;
  createdAt: string;
  createdBy?: string;
};
