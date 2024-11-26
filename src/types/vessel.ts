export interface Vessel {
  id: string;
  name: string;
  type: 'cargo' | 'tanker' | 'passenger' | 'fishing';
  status: 'active' | 'docked' | 'maintenance' | 'offline';
  position: {
    latitude: number;
    longitude: number;
  };
  speed: number;
  heading: number;
  fuelLevel: number;
  batteryLevel: number;
  lastUpdate: string;
  route: Array<[number, number]>;
  subscription: {
    status: 'active' | 'expiring' | 'expired';
    expiresAt: string;
    plan: 'basic' | 'premium' | 'enterprise';
  };
}

export interface VesselStats {
  distanceTraveled: number;
  averageSpeed: number;
  fuelConsumption: number;
  portCalls: number;
}