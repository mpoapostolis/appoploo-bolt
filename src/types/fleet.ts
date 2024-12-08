export interface Fleet {
  id: string;
  user_id: number;
  name: string;
  IMEI: string;
  speed: number;
  course: number;
  battery: number;
  lat: number;
  lng: number;
  revenue: number;
  length: number;
  enabled: boolean;
  members: number;
  created: string;
  updated: string;
  subscriptionEnds?: string;
  position: string;
  currentPlan: string;
  subscriptionStatus: string;
}

export interface Point {
  id: number;
  tracker_id: string;
  lat: number;
  lng: number;
  battery: number;
  created: string;
  speed: number;
  port: string;
  distance: number;
  updated: string;
  name: string;
}