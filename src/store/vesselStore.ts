import { create } from 'zustand';
import type { Vessel } from '../types/vessel';
import { addDays } from 'date-fns';

// Sample vessel data with Greek locations
const mockVessels: Vessel[] = [
  {
    id: '1',
    name: 'Poseidon Explorer',
    type: 'cargo',
    status: 'active',
    position: { latitude: 37.9838, longitude: 23.7275 }, // Piraeus
    speed: 15.5,
    heading: 45,
    fuelLevel: 85,
    batteryLevel: 90,
    lastUpdate: new Date().toISOString(),
    route: [
      [23.7275, 37.9838],
      [23.8275, 38.0838],
      [23.9275, 38.1838],
    ],
    subscription: {
      status: 'active',
      expiresAt: addDays(new Date(), 15).toISOString(),
      plan: 'premium'
    }
  },
  {
    id: '2',
    name: 'Aegean Star',
    type: 'passenger',
    status: 'active',
    position: { latitude: 40.6401, longitude: 22.9444 }, // Thessaloniki
    speed: 12.8,
    heading: 90,
    fuelLevel: 72,
    batteryLevel: 85,
    lastUpdate: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    route: [
      [22.9444, 40.6401],
      [23.0444, 40.7401],
      [23.1444, 40.8401],
    ],
    subscription: {
      status: 'expiring',
      expiresAt: addDays(new Date(), 5).toISOString(),
      plan: 'basic'
    }
  },
  {
    id: '3',
    name: 'Mediterranean Voyager',
    type: 'cargo',
    status: 'maintenance',
    position: { latitude: 35.3387, longitude: 25.1442 }, // Heraklion
    speed: 0,
    heading: 180,
    fuelLevel: 45,
    batteryLevel: 60,
    lastUpdate: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    route: [
      [25.1442, 35.3387],
      [25.2442, 35.4387],
    ],
    subscription: {
      status: 'active',
      expiresAt: addDays(new Date(), 45).toISOString(),
      plan: 'enterprise'
    }
  },
  {
    id: '4',
    name: 'Ionian Guardian',
    type: 'tanker',
    status: 'docked',
    position: { latitude: 38.2466, longitude: 21.7346 }, // Patras
    speed: 0,
    heading: 270,
    fuelLevel: 95,
    batteryLevel: 100,
    lastUpdate: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    route: [
      [21.7346, 38.2466],
      [21.8346, 38.3466],
    ],
    subscription: {
      status: 'active',
      expiresAt: addDays(new Date(), 90).toISOString(),
      plan: 'premium'
    }
  },
  {
    id: '5',
    name: 'Rhodes Explorer',
    type: 'fishing',
    status: 'active',
    position: { latitude: 36.4510, longitude: 28.2278 }, // Rhodes
    speed: 8.5,
    heading: 135,
    fuelLevel: 65,
    batteryLevel: 75,
    lastUpdate: new Date(Date.now() - 1000 * 30).toISOString(),
    route: [
      [28.2278, 36.4510],
      [28.3278, 36.5510],
    ],
    subscription: {
      status: 'expired',
      expiresAt: addDays(new Date(), -1).toISOString(),
      plan: 'basic'
    }
  },
  {
    id: '6',
    name: 'Corfu Pioneer',
    type: 'cargo',
    status: 'offline',
    position: { latitude: 39.6243, longitude: 19.9217 }, // Corfu
    speed: 0,
    heading: 0,
    fuelLevel: 30,
    batteryLevel: 15,
    lastUpdate: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    route: [
      [19.9217, 39.6243],
      [20.0217, 39.7243],
    ],
    subscription: {
      status: 'expired',
      expiresAt: addDays(new Date(), -5).toISOString(),
      plan: 'basic'
    }
  },
];

interface VesselState {
  vessels: Vessel[];
  selectedVesselId: string | null;
  setSelectedVesselId: (id: string | null) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  sortKey: string;
  setSortKey: (key: string) => void;
}

export const useVesselStore = create<VesselState>((set) => ({
  vessels: mockVessels,
  selectedVesselId: null,
  setSelectedVesselId: (id) => set({ selectedVesselId: id }),
  isDarkMode: false,
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  sortKey: 'lastUpdate',
  setSortKey: (key) => set({ sortKey: key }),
}));