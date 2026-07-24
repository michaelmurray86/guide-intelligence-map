export type GuideSection = {

  id: number;
  title: string;
  description: string;
  coordinates: [number, number][];
  color?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
updatedBy?: string;
approvedBy?: string;
approvedAt?: string;
status?: string;

};