import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Settings {
  batteryThreshold: number;
  speedThreshold: number;
  updateThreshold: number;
}

interface SettingsState {
  settings: Settings;
  updateSettings: (newSettings: Settings) => void;
}

const defaultSettings: Settings = {
  batteryThreshold: 20,
  speedThreshold: 5,
  updateThreshold: 15,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSettings: (newSettings) => set({ settings: newSettings }),
    }),
    {
      name: 'user-settings',
    }
  )
);