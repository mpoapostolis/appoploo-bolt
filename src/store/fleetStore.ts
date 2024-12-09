import { create } from "zustand";
import type { Fleet, Point } from "../types/fleet";

interface FleetState {
  fleets: Fleet[];
  points: Record<string, Point[]>;
  selectedFleetId: string | null;
  isDarkMode: boolean;
  isSidebarOpen: boolean;
  sortKey: string;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  setSelectedFleetId: (id: string | null) => void;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  setSortKey: (key: string) => void;
  setDateRange: (start: Date | null, end: Date | null) => void;
}

export const useFleetStore = create<FleetState>((set) => ({
  fleets: [],
  points: {},
  selectedFleetId: null,
  isDarkMode: false,
  isSidebarOpen: window.innerWidth >= 768, // Open by default on desktop
  sortKey: "updated",
  dateRange: {
    start: null,
    end: null,
  },
  setSelectedFleetId: (id) => set({ selectedFleetId: id }),
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSortKey: (key) => set({ sortKey: key }),
  setDateRange: (start, end) => set({ dateRange: { start, end } }),
}));
