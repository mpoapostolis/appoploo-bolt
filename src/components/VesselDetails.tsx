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
import { useState, useRef, useEffect } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { VesselSelectionModal } from "./VesselSelectionModal";
import { EditableVesselName } from "./EditableVesselName";
import { MAPBOX_TOKEN } from "../lib/mapbox";

interface VesselDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  fleet: any;
}

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

const getUpdateStatus = (lastUpdate: string) => {
  const minutesSinceUpdate = differenceInMinutes(
    new Date(),
    new Date(lastUpdate)
  );

  if (minutesSinceUpdate >= 30) {
    return {
      type: "error",
      message: "No Signal",
      color: "text-red-500 dark:text-red-400",
      bgColor: "bg-red-500/10 dark:bg-red-500/20",
      icon: <AlertTriangle className="h-4 w-4" />,
      pulse: true,
    };
  }
  if (minutesSinceUpdate >= 15) {
    return {
      type: "warning",
      message: "Warning",
      color: "text-amber-500 dark:text-amber-400",
      bgColor: "bg-amber-500/10 dark:bg-amber-500/20",
      icon: <AlertTriangle className="h-4 w-4" />,
      pulse: true,
    };
  }
  return {
    type: "success",
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

export function VesselDetails({ isOpen, onClose, fleet }: VesselDetailsProps) {
  const isDarkTheme = useFleetStore((state) => state.isDarkMode);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!fleet) return null;

  const batteryVoltage = +(fleet.battery / 1000).toFixed(1);
  const updateStatus = getUpdateStatus(fleet.updated);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        >
          <motion.div
            ref={modalRef}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl 
                     shadow-xl p-6 pb-8 max-h-[90vh] overflow-y-auto"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute z-50 top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg 
                       text-gray-500 dark:text-gray-400 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            {/* Compact Header */}
            <div
              className="relative p-3 bg-gradient-to-br from-sky-500/10 to-blue-600/10 
                           dark:from-sky-500/20 dark:to-blue-600/20 border-b 
                           border-gray-200/50 dark:border-gray-700/50"
            >
              <div className="flex items-start space-x-2">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative p-2.5 bg-gradient-to-br from-sky-500 to-blue-600 backdrop-blur-lg rounded-lg
                         border border-white/20 shadow-lg shadow-sky-500/20"
                >
                  <Ship className="h-5 w-5 text-white" />
                  {updateStatus.type === "success" && (
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse" />
                  )}
                  {updateStatus.type === "warning" && (
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse" />
                  )}
                  {updateStatus.type === "error" && (
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse" />
                  )}
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
                    <div className="p-1 rounded-md bg-white/10 dark:bg-gray-800/50">
                      <Navigation
                        className="h-3 w-3 text-gray-500 dark:text-gray-400"
                        style={{ transform: `rotate(${fleet.course}deg)` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {fleet.course}°
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-3 space-y-3">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
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
                  <div
                    className={`absolute top-0 left-0 w-full h-0.5
                    ${
                      batteryVoltage > 12
                        ? "bg-emerald-500/20 dark:bg-emerald-400/20"
                        : batteryVoltage > 11
                        ? "bg-amber-500/20 dark:bg-amber-400/20"
                        : "bg-red-500/20 dark:bg-red-400/20"
                    }`}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${((batteryVoltage - 10) * 100) / 4}%`,
                      }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full
                        ${
                          batteryVoltage > 12
                            ? "bg-emerald-500 dark:bg-emerald-400"
                            : batteryVoltage > 11
                            ? "bg-amber-500 dark:bg-amber-400"
                            : "bg-red-500 dark:bg-red-400"
                        }`}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`inline-flex items-center justify-center w-10 h-10 rounded-lg
                        ${
                          batteryVoltage > 12
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
                        <div
                          className={`text-xs font-medium ${
                            batteryVoltage > 12
                              ? "text-emerald-500 dark:text-emerald-400"
                              : batteryVoltage > 11
                              ? "text-amber-500 dark:text-amber-400"
                              : "text-red-500 dark:text-red-400"
                          }`}
                        >
                          {batteryVoltage > 12
                            ? "Good"
                            : batteryVoltage > 11
                            ? "Warning"
                            : "Critical"}
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
                        <Navigation className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Speed
                        </div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {fleet.speed.toFixed(1)} kts
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Location Card */}
              <motion.div
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
                          {formatDistanceToNow(new Date(fleet.updated), {
                            addSuffix: true,
                          })}
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
                    <div className="font-bold text-sm text-gray-900 dark:text-white">
                      {fleet.position || "Location not available"}
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

                <div className="h-36 relative overflow-hidden rounded-lg">
                  <Map
                    viewState={{
                      longitude: fleet.lng,
                      latitude: fleet.lat,
                      zoom: 14,
                    }}
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "0.5rem",
                    }}
                    mapboxAccessToken={MAPBOX_TOKEN}
                    reuseMaps
                    mapStyle={
                      isDarkTheme
                        ? "mapbox://styles/mapbox/dark-v11"
                        : "mapbox://styles/mapbox/streets-v12"
                    }
                  >
                    <Marker longitude={fleet.lng} latitude={fleet.lat}>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`w-3 h-3 rounded-full ${getMarkerColor(
                          fleet
                        )} shadow-lg`}
                      />
                    </Marker>
                    {/* <NavigationControl position="bottom-right" showCompass={false} showZoom /> */}
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
                  <div
                    className="flex items-center justify-between p-2.5 bg-gray-50/50 dark:bg-gray-900/50 
                                rounded-lg border border-gray-200/50 dark:border-gray-700/50"
                  >
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      IMEI
                    </div>
                    <div className="text-xs font-medium text-gray-900 dark:text-white">
                      {fleet.IMEI}
                    </div>
                  </div>

                  <div
                    className="flex items-center justify-between p-2.5 bg-gray-50/50 dark:bg-gray-900/50 
                                rounded-lg border border-gray-200/50 dark:border-gray-700/50"
                  >
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Last Update
                    </div>
                    <div className="text-xs font-medium text-gray-900 dark:text-white">
                      {new Date(fleet.updated).toLocaleString()}
                    </div>
                  </div>

                  <div
                    className="flex items-center justify-between p-2.5 bg-gray-50/50 dark:bg-gray-900/50 
                                rounded-lg border border-gray-200/50 dark:border-gray-700/50"
                  >
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Subscription
                    </div>
                    <div
                      className={`text-xs font-medium ${
                        fleet.subscriptionStatus === "active"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {fleet.subscriptionStatus === "active"
                        ? "Active"
                        : "Inactive"}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
