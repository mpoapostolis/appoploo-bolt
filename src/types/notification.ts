export interface Notification {
  id: string;
  tracker_id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  text: string;
  created: string;
  read: boolean;
  expand?: {
    tracker_id: {
      name: string;
      id: string;
    };
  };
}