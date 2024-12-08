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
      text: "No Signal",
      color: "text-red-500 dark:text-red-400",
      bgColor: "bg-red-500/10 dark:bg-red-500/20",
      icon: <AlertTriangle className="h-4 w-4" />,
      pulse: true,
    };
  }
  if (minutesSinceUpdate >= 15) {
    return {
      text: "Warning",
      color: "text-amber-500 dark:text-amber-400",
      bgColor: "bg-amber-500/10 dark:bg-amber-500/20",
      icon: <AlertTriangle className="h-4 w-4" />,
      pulse: true,
    };
  }
  return {
    text: "Active",
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
                   bg-white dark:bg-gray-800 shadow-2xl overflow-y-auto border-l 
                   border-gray-200/50 dark:border-gray-700/50 z-50"
        >
          {/* Compact Header */}
          <div className="relative p-4 premium-gradient border-b border-gray-200/50 dark:border-gray-700/50">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedFleetId(null)}
              className="absolute right-4 top-4 p-1.5 rounded-lg bg-white/10 dark:bg-gray-800/10 
                       backdrop-blur-lg hover:bg-white/20 dark:hover:bg-gray-800/20 
                       text-gray-700 dark:text-gray-300 transition-all duration-200"
            >
              <X className="h-4 w-4" />
            </motion.button>

            <div className="flex items-start space-x-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-2.5 bg-white/10 dark:bg-white/5 backdrop-blur-lg rounded-xl
                         border border-white/10 dark:border-white/5"
              >
                <Ship className="h-6 w-6 text-primary" />
              </motion.div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {fleet.name}
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  <Clock className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
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
          <div className="p-4 space-y-4">
            {/* Status Cards */}
            <div className="grid grid-cols-2 gap-3">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="premium-card p-3 text-center"
              >
                <Battery
                  className={`h-5 w-5 mx-auto mb-1 ${
                    batteryVoltage > 12
                      ? "text-emerald-500 dark:text-emerald-400"
                      : batteryVoltage > 11
                      ? "text-amber-500 dark:text-amber-400"
                      : "text-red-500 dark:text-red-400"
                  }`}
                />
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {batteryVoltage}V
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Battery
                </div>
                <div className="h-1 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((batteryVoltage - 10) * 100) / 4}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      batteryVoltage > 12
                        ? "bg-emerald-500 dark:bg-emerald-400"
                        : batteryVoltage > 11
                        ? "bg-amber-500 dark:bg-amber-400"
                        : "bg-red-500 dark:bg-red-400"
                    }`}
                  />
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="premium-card p-3 text-center"
              >
                <Navigation
                  className="h-5 w-5 mx-auto mb-1 text-blue-500 dark:text-blue-400"
                  style={{ transform: `rotate(${fleet.course}deg)` }}
                />
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {fleet.speed.toFixed(1)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Knots
                </div>
                <div className="h-1 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(fleet.speed / 20) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full bg-blue-500 dark:bg-blue-400"
                  />
                </div>
              </motion.div>
            </div>

            {/* Location Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 
                        p-4 rounded-xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50
                        border border-gray-200/50 dark:border-gray-700/50"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20">
                    <MapPin className="h-4 w-4 text-violet-500 dark:text-violet-400" />
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
                <div className={`px-2 py-1 rounded-full text-xs font-medium 
                              ${updateStatus.color} ${updateStatus.bgColor}`}>
                  {updateStatus.text}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Latitude
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {fleet.lat.toFixed(4)}°N
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Longitude
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {fleet.lng.toFixed(4)}°E
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Address
                </div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {fleet.position || 'Location not available'}
                </div>
              </div>

                  <a
                    href={`https://www.google.com/maps?q=${fleet.lat},${fleet.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 text-xs font-medium text-white bg-black/50 
                             backdrop-blur-sm rounded-full hover:bg-black/70 
                             transition-colors duration-200 flex items-center space-x-1"
                  >
                    <MapPin className="h-3 w-3" />
                    <span>View in Maps</span>
                  </a>
                
            </motion.div>

            {/* Status Badge */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`premium-card p-4 flex items-center justify-between
                       ${updateStatus.bgColor}`}
            >
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Status
              </div>
              <div
                className={`flex items-center space-x-1.5 px-2 py-1 rounded-full 
                           text-xs font-medium ${updateStatus.color}`}
              >
                {updateStatus.icon}
                <span>{updateStatus.text}</span>
              </div>
            </motion.div>

            {/* Subscription Button */}
            
            
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
