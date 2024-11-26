import PocketBase from 'pocketbase';
import type { Fleet, Point } from '../types/fleet';

export const pb = new PocketBase('https://alimos.mak-net.net');

export const authWithGoogle = async () => {
  const authData = await pb.collection('users').authWithOAuth2({ provider: 'google' });
  return authData;
};

export const isAuthenticated = () => {
  return pb.authStore.isValid;
};

export const logout = () => {
  pb.authStore.clear();
  window.location.reload();
};

export const getFleets = async (): Promise<Fleet[]> => {
  const records = await pb.collection('trackers').getFullList<Fleet>();
  return records;
};

export const getFleetPoints = async (trackerId: string): Promise<Point[]> => {
  const records = await pb.collection('points').getFullList<Point>({
    filter: `tracker_id = "${trackerId}"`,
    sort: '-created',
  });
  return records;
};

export const subscribeToFleetUpdates = (
  fleetId: string,
  callback: (data: Fleet) => void
) => {
  return pb.collection('trackers').subscribe<Fleet>(fleetId, (data) => {
    callback(data.record);
  });
};

// Response types for better type safety
export interface FleetResponse {
  items: Fleet[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}

export interface PointResponse {
  items: Point[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}