import { create } from 'zustand';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: number;
  vesselId?: string;
}

// Dummy notifications
const dummyNotifications: Notification[] = [
  {
    id: '1',
    title: 'Low Battery Alert',
    message: 'Poseidon Express battery level is below 20%',
    type: 'warning',
    timestamp: Date.now() - 1000 * 60 * 5,
    vesselId: '1'
  },
  {
    id: '2',
    title: 'Speed Change Detected',
    message: 'Aegean Voyager speed increased by 5 knots',
    type: 'info',
    timestamp: Date.now() - 1000 * 60 * 15,
    vesselId: '2'
  },
  {
    id: '3',
    title: 'Connection Lost',
    message: 'Lost connection with Crete Navigator',
    type: 'error',
    timestamp: Date.now() - 1000 * 60 * 30,
    vesselId: '3'
  }
];

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: dummyNotifications,
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        {
          ...notification,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
        },
        ...state.notifications,
      ],
    })),
  clearNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  clearAll: () => set({ notifications: [] }),
}));