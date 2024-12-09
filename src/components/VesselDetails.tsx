import { motion, AnimatePresence } from "framer-motion";
import {
  Ship,
  Battery,
  Navigation,
  Clock,
  MapPin,
  CreditCard,
  X,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow, differenceInMinutes } from "date-fns";
import { useFleetStore } from "../store/fleetStore";
import { useFleets } from "../hooks/useFleets";
import toast from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { VesselSelectionModal } from "./VesselSelectionModal";
import { EditableVesselName } from "./EditableVesselName";

const SUBSCRIPTION_PLANS = [
  {
    id: "monthly",
    name: "1 Month",
    price: 10,
    interval: "month",
    description: "Monthly subscription",
    featured: false,
  },
  {
    id: "yearly",
    name: "12 Months",
    price: 96,
    interval: "year",
    description: "Save 20% with annual billing",
    pricePerMonth: 8,
    featured: true,
  },
];

const stripePromise = loadStripe(
  "pk_test_51IOqNtHsw5wcdFbBgddIAIJIkUDc5z9MbSFSv9b4jDOzX2XVWRrUzkYncHjWUPghObLa3zKgq9uTsNPxKDrz4Tmu00CcHKLgWN"
);

const MAPBOX_TOKEN = "pk.eyJ1IjoiYXBvc3RvbGlzbXBvc3RhbmlzIiwiYSI6ImNscmFxMXB2ZjBiMGsyam1qbzJvNmJlbWsifQ.N3v6jcUz5sMF8Rg1e4fE3A";

const getUpdateStatus = (lastUpdate: string) => {
  const minutesSinceUpdate = differenceInMinutes(
    new Date(),
    new Date(lastUpdate)
  );

  if (minutesSinceUpdate >= 30) {
    return {
      type: 'error',
      message: "No Signal",
      color: "text-red-500 dark:text-red-400",
      bgColor: "bg-red-500/10 dark:bg-red-500/20",
      icon: <AlertTriangle className="h-4 w-4" />,
      pulse: true,
    };
  }
  if (minutesSinceUpdate >= 15) {
    return {
      type: 'warning',
      message: "Warning",
      color: "text-amber-500 dark:text-amber-400",
      bgColor: "bg-amber-500/10 dark:bg-amber-500/20",
      icon: <AlertTriangle className="h-4 w-4" />,
      pulse: true,
    };
  }
  return {
    type: 'success',
    message: "Active",
    color: "text-emerald-500 dark:text-emerald-400",
    bgColor: "bg-emerald-500/10 dark:bg-emerald-500/20",
    icon: null,
    pulse: false,
  };
};

const getMarkerColor = (fleet: any) => {
  const batteryVoltage = +(fleet.battery / 1000).toFixed(1);
  if (batteryVoltage > 12) {
    return "bg-emerald-500 dark:bg-emerald-400";
  }
  if (batteryVoltage > 11) {
    return "bg-amber-500 dark:bg-amber-400";
  }
  return "bg-red-500 dark:bg-red-400";
};

const getIconColor = (fleet: any) => {
  const batteryVoltage = +(fleet.battery / 1000).toFixed(1);
  if (batteryVoltage > 12) {
    return "text-emerald-500 dark:text-emerald-400";
  }
  if (batteryVoltage > 11) {
    return "text-amber-500 dark:text-amber-400";
  }
  return "text-red-500 dark:text-red-400";
};

export default function VesselDetails() {
  const { selectedFleetId, setSelectedFleetId } = useFleetStore();
  const { fleets } = useFleets();
  const fleet = fleets?.find((v) => v.id === selectedFleetId);
  const [showPlans, setShowPlans] = useState(false);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<typeof SUBSCRIPTION_PLANS[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!fleet) return null;

  const batteryVoltage = +(fleet.battery / 1000).toFixed(1);
  const updateStatus = getUpdateStatus(fleet.updated);

  const handleRenewSubscription = async (plan: typeof SUBSCRIPTION_PLANS[0]) => {
    setLoadingPlanId(plan.id);
    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe failed to load");

      const response = await fetch('/api/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          vesselId: fleet.id,
          vesselName: fleet.name,
          amount: plan.price * 100,
          interval: plan.interval
        }),
      });

      const session = await response.json();
      
      if (!response.ok) {
        throw new Error(session.message || 'Failed to create checkout session');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId: session.id });
      
      if (error) {
        toast.error(error.message || "Payment failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to initiate checkout");
      console.error('Checkout error:', error);
    } finally {
      setLoadingPlanId(null);
    }
  };

  return (
    <AnimatePresence>
      {selectedFleetId && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          className="fixed md:absolute right-0 top-0 h-full w-full md:w-[380px] 
                   bg-white dark:bg-gray-800/95 shadow-2xl overflow-y-auto border-l 
                   border-gray-200/50 dark:border-gray-700/50 z-50 backdrop-blur-xl"
        >
          {/* Compact Header */}
          <div className="relative p-3 bg-gradient-to-br from-sky-500/10 to-blue-600/10 
                         dark:from-sky-500/20 dark:to-blue-600/20 border-b 
                         border-gray-200/50 dark:border-gray-700/50">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedFleetId(null)}
              className="absolute right-3 top-3 p-1.5 rounded-lg bg-white/10 dark:bg-gray-800/10 
                       backdrop-blur-lg hover:bg-white/20 dark:hover:bg-gray-800/20 
                       text-gray-700 dark:text-gray-300 transition-all duration-200
                       border border-white/10 shadow-lg"
            >
              <X className="h-4 w-4" />
            </motion.button>

            <div className="flex items-start space-x-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-2.5 bg-gradient-to-br from-sky-500 to-blue-600 backdrop-blur-lg rounded-lg
                         border border-white/20 shadow-lg shadow-sky-500/20"
              >
                <Ship className="h-5 w-5 text-white" />
              </motion.div>
              <div>
                <EditableVesselName 
                  initialName={fleet.name} 
                  vesselId={fleet.id} 
                  className="text-lg font-bold text-gray-900 dark:text-white"
                />
                <div className="flex items-center space-x-1.5 mt-1">
                  <div className="p-1 rounded-md bg-white/10 dark:bg-gray-800/50">
                    <Clock className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(fleet.updated), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-3 space-y-3">
            {/* Quick Stats */}
            <div className="space-y-3">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`premium-card relative overflow-hidden p-3 ${
                  batteryVoltage > 12
                    ? "bg-emerald-500/5 dark:bg-emerald-500/10"
                    : batteryVoltage > 11
                    ? "bg-amber-500/5 dark:bg-amber-500/10"
                    : "bg-red-500/5 dark:bg-red-500/10"
                }`}
              >
                <div className={`absolute top-0 left-0 w-full h-0.5
                  ${batteryVoltage > 12
                    ? "bg-emerald-500/20 dark:bg-emerald-400/20"
                    : batteryVoltage > 11
                    ? "bg-amber-500/20 dark:bg-amber-400/20"
                    : "bg-red-500/20 dark:bg-red-400/20"
                  }`}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((batteryVoltage - 10) * 100) / 4}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full
                      ${batteryVoltage > 12
                        ? "bg-emerald-500 dark:bg-emerald-400"
                        : batteryVoltage > 11
                        ? "bg-amber-500 dark:bg-amber-400"
                        : "bg-red-500 dark:bg-red-400"
                      }`}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg
                      ${batteryVoltage > 12
                        ? "bg-emerald-500/10 dark:bg-emerald-400/10"
                        : batteryVoltage > 11
                        ? "bg-amber-500/10 dark:bg-amber-400/10"
                        : "bg-red-500/10 dark:bg-red-400/10"
                      }`}
                    >
                      <Battery
                        className={`h-5 w-5 ${
                          batteryVoltage > 12
                            ? "text-emerald-500 dark:text-emerald-400"
                            : batteryVoltage > 11
                            ? "text-amber-500 dark:text-amber-400"
                            : "text-red-500 dark:text-red-400"
                        }`}
                      />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Battery
                      </div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {batteryVoltage}V
                      </div>
                      <div className={`text-xs font-medium ${
                        batteryVoltage > 12
                          ? "text-emerald-500 dark:text-emerald-400"
                          : batteryVoltage > 11
                          ? "text-amber-500 dark:text-amber-400"
                          : "text-red-500 dark:text-red-400"
                      }`}>
                        {batteryVoltage > 12 ? 'Good' : batteryVoltage > 11 ? 'Warning' : 'Critical'}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="premium-card relative overflow-hidden p-3 bg-blue-500/5 dark:bg-blue-500/10"
              >
                <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-500/20 dark:bg-blue-400/20">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(fleet.speed / 20) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-blue-500 dark:bg-blue-400"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10 dark:bg-blue-400/10">
                      <Navigation
                        className="h-5 w-5 text-blue-500 dark:text-blue-400"
                        style={{ transform: `rotate(${fleet.course}deg)` }}
                      />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Speed
                      </div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {fleet.speed.toFixed(1)} kts
                      </div>
                      <div className="text-xs font-medium text-blue-500 dark:text-blue-400">
                        Course: {fleet.course}°
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`premium-card relative overflow-hidden p-3 ${
                  getUpdateStatus(fleet.updated).type === 'success'
                    ? 'bg-emerald-500/5 dark:bg-emerald-500/10'
                    : getUpdateStatus(fleet.updated).type === 'warning'
                    ? 'bg-amber-500/5 dark:bg-amber-500/10'
                    : 'bg-red-500/5 dark:bg-red-500/10'
                }`}
              >
                <div className={`absolute top-0 left-0 w-full h-0.5 ${
                  getUpdateStatus(fleet.updated).type === 'success'
                    ? 'bg-emerald-500/20 dark:bg-emerald-400/20'
                    : getUpdateStatus(fleet.updated).type === 'warning'
                    ? 'bg-amber-500/20 dark:bg-amber-400/20'
                    : 'bg-red-500/20 dark:bg-red-400/20'
                }`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{
                      duration: 1,
                      ease: "easeOut",
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    className={`h-full ${
                      getUpdateStatus(fleet.updated).type === 'success'
                        ? 'bg-emerald-500 dark:bg-emerald-400'
                        : getUpdateStatus(fleet.updated).type === 'warning'
                        ? 'bg-amber-500 dark:bg-amber-400'
                        : 'bg-red-500 dark:bg-red-400'
                    }`}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${
                      getUpdateStatus(fleet.updated).type === 'success'
                        ? 'bg-emerald-500/10 dark:bg-emerald-400/10'
                        : getUpdateStatus(fleet.updated).type === 'warning'
                        ? 'bg-amber-500/10 dark:bg-amber-400/10'
                        : 'bg-red-500/10 dark:bg-red-400/10'
                    }`}>
                      <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                        getUpdateStatus(fleet.updated).type === 'success'
                          ? 'bg-emerald-500 dark:bg-emerald-400'
                          : getUpdateStatus(fleet.updated).type === 'warning'
                          ? 'bg-amber-500 dark:bg-amber-400'
                          : 'bg-red-500 dark:bg-red-400'
                      }`} />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Signal
                      </div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {getUpdateStatus(fleet.updated).message}
                      </div>
                      <div className={`text-xs font-medium ${
                        getUpdateStatus(fleet.updated).type === 'success'
                          ? 'text-emerald-500 dark:text-emerald-400'
                          : getUpdateStatus(fleet.updated).type === 'warning'
                          ? 'text-amber-500 dark:text-amber-400'
                          : 'text-red-500 dark:text-red-400'
                      }`}>
                        Last update: {formatDistanceToNow(new Date(fleet.updated))} ago
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Location Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800/50 dark:to-gray-900/50 
                        rounded-lg shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50
                        border border-gray-200/50 dark:border-gray-700/50 overflow-hidden
                        backdrop-blur-sm"
            >
              <div className="p-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-sky-500/20">
                      <MapPin className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        Last Known Location
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {formatDistanceToNow(new Date(fleet.updated), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="bg-gray-50/50 dark:bg-gray-900/50 p-2.5 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Latitude
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {fleet.lat.toFixed(4)}°N
                    </div>
                  </div>
                  <div className="bg-gray-50/50 dark:bg-gray-900/50 p-2.5 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Longitude
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {fleet.lng.toFixed(4)}°E
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50/50 dark:bg-gray-900/50 p-2.5 rounded-lg border border-gray-200/50 dark:border-gray-700/50 mb-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Address
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {fleet.position || 'Location not available'}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Course: {fleet.course}°
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${fleet.lat},${fleet.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-white 
                             bg-gradient-to-br from-sky-500 to-blue-600 
                             hover:from-sky-600 hover:to-blue-700
                             shadow-lg shadow-sky-500/20 hover:shadow-sky-500/30
                             rounded-lg transition-all duration-200 border border-white/20"
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    View in Maps
                  </a>
                </div>
              </div>

              <div className="h-36 relative">
                <Map
                  initialViewState={{
                    longitude: fleet.lng,
                    latitude: fleet.lat,
                    zoom: 14
                  }}
                  style={{ width: '100%', height: '100%' }}
                  mapStyle="mapbox://styles/mapbox/dark-v11"
                  mapboxAccessToken={MAPBOX_TOKEN}
                >
                  <Marker
                    longitude={fleet.lng}
                    latitude={fleet.lat}
                  >
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`w-3 h-3 rounded-full ${getMarkerColor(fleet)} shadow-lg`} 
                    />
                  </Marker>
                  <NavigationControl position="bottom-right" />
                </Map>
              </div>
            </motion.div>

            {/* Vessel Info */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800/50 dark:to-gray-900/50 
                        rounded-lg shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50
                        border border-gray-200/50 dark:border-gray-700/50 p-3 space-y-2
                        backdrop-blur-sm"
            >
              <div className="flex items-center space-x-2 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-sky-500/20">
                  <Ship className="h-3.5 w-3.5 text-white" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Vessel Information
                </h3>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 bg-gray-50/50 dark:bg-gray-900/50 
                              rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                  <div className="text-xs text-gray-500 dark:text-gray-400">IMEI</div>
                  <div className="text-xs font-medium text-gray-900 dark:text-white">
                    {fleet.IMEI}
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-gray-50/50 dark:bg-gray-900/50 
                              rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Last Update</div>
                  <div className="text-xs font-medium text-gray-900 dark:text-white">
                    {new Date(fleet.updated).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-gray-50/50 dark:bg-gray-900/50 
                              rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Subscription</div>
                  <div className={`text-xs font-medium ${
                    fleet.subscriptionStatus === 'active'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {fleet.subscriptionStatus === 'active' ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
