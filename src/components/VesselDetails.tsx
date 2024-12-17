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
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-xl bg-white dark:bg-gray-800/95 
                     shadow-2xl p-6 pb-8 overflow-y-auto backdrop-blur-xl border-l border-gray-200/20"
          >
            {/* Close button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="absolute z-50 top-4 right-4 p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl 
                       text-gray-500 dark:text-gray-400 transition-all duration-200 backdrop-blur-xl"
            >
              <X className="h-5 w-5" />
            </motion.button>
            {/* Compact Header */}
            <div
              className="relative p-4 bg-gradient-to-br from-sky-500/10 via-blue-500/10 to-indigo-500/10 
                           dark:from-sky-400/20 dark:via-blue-500/20 dark:to-indigo-500/20 
                           rounded-2xl border border-white/10 dark:border-white/5 backdrop-blur-xl"
            >
              <div className="flex items-start space-x-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative p-3 bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-500 backdrop-blur-xl rounded-xl
                         border border-white/20 shadow-lg shadow-sky-500/20"
                >
                  <Ship className="h-6 w-6 text-white" />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800
                    ${
                      updateStatus.type === "success"
                        ? "bg-emerald-500"
                        : updateStatus.type === "warning"
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                  />
                </motion.div>
                <div>
                  <div className="flex gap-1 items-center">
                    <EditableVesselName
                      initialName={fleet.name}
                      vesselId={fleet.id}
                      className="text-xl font-bold text-gray-900 dark:text-white"
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {fleet.IMEI}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 mt-1.5">
                    <div
                      className="px-2 py-1 rounded-lg bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm
                                  border border-gray-200/10 dark:border-gray-700/50"
                    >
                      <div className="flex items-center space-x-1.5">
                        <Clock className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(new Date(fleet.updated), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                    <div
                      className="px-2 py-1 rounded-lg bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm
                                  border border-gray-200/10 dark:border-gray-700/50"
                    >
                      <div className="flex items-center space-x-1.5">
                        <Navigation
                          className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400"
                          style={{ transform: `rotate(${fleet.course}deg)` }}
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {fleet.course}°
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="lg:p-3 p-0 space-y-4 mt-2">
              {/* Quick Stats */}
              <div className="grid lg:grid-cols-2 gap-3">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`premium-card relative overflow-hidden p-4 rounded-2xl backdrop-blur-xl
                    border border-gray-200/20 dark:border-gray-700/20
                    ${
                      batteryVoltage > 12
                        ? "bg-emerald-500/5 dark:bg-emerald-500/10"
                        : batteryVoltage > 11
                        ? "bg-amber-500/5 dark:bg-amber-500/10"
                        : "bg-red-500/5 dark:bg-red-500/10"
                    }`}
                >
                  <div
                    className={`absolute top-0 left-0 w-full h-1 rounded-full
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
                      className={`h-full rounded-full
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
                        className={`inline-flex items-center justify-center w-12 h-12 rounded-xl
                        ${
                          batteryVoltage > 12
                            ? "bg-emerald-500/10 dark:bg-emerald-400/10"
                            : batteryVoltage > 11
                            ? "bg-amber-500/10 dark:bg-amber-400/10"
                            : "bg-red-500/10 dark:bg-red-400/10"
                        }`}
                      >
                        <Battery
                          className={`h-6 w-6 ${
                            batteryVoltage > 12
                              ? "text-emerald-500 dark:text-emerald-400"
                              : batteryVoltage > 11
                              ? "text-amber-500 dark:text-amber-400"
                              : "text-red-500 dark:text-red-400"
                          }`}
                        />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Battery
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {batteryVoltage}V
                        </div>
                        <div
                          className={`text-xs font-medium mt-0.5 ${
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
                  whileTap={{ scale: 0.98 }}
                  className="premium-card relative overflow-hidden p-4 rounded-2xl bg-blue-500/5 dark:bg-blue-500/10
                           border border-gray-200/20 dark:border-gray-700/20 backdrop-blur-xl"
                >
                  <div className="absolute top-0 left-0 w-full h-1 rounded-full bg-blue-500/20 dark:bg-blue-400/20">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(fleet.speed / 20) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full rounded-full bg-blue-500 dark:bg-blue-400"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 dark:bg-blue-400/10">
                        <Navigation className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Speed
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {fleet.speed.toFixed(1)} kts
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Location Card */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="bg-gradient-to-br from-white/50 to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/50 
                          rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50
                          border border-gray-200/20 dark:border-gray-700/20 overflow-hidden
                          backdrop-blur-xl"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-500 shadow-lg shadow-sky-500/20">
                        <MapPin className="h-4 w-4 text-white" />
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

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gray-50/50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-200/20 dark:border-gray-700/20
                                backdrop-blur-sm"
                    >
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Latitude
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {fleet.lat.toFixed(4)}°N
                      </div>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gray-50/50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-200/20 dark:border-gray-700/20
                                backdrop-blur-sm"
                    >
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Longitude
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {fleet.lng.toFixed(4)}°E
                      </div>
                    </motion.div>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="bg-gray-50/50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-200/20 dark:border-gray-700/20 mb-3
                              backdrop-blur-sm"
                  >
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Address
                    </div>
                    <div className="font-bold text-sm text-gray-900 dark:text-white">
                      {fleet.position || "Location not available"}
                    </div>
                  </motion.div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Course: {fleet.course}°
                    </div>
                    <motion.a
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      href={`https://www.google.com/maps?q=${fleet.lat},${fleet.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 text-xs font-medium text-white 
                               bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-500
                               hover:from-sky-600 hover:via-blue-600 hover:to-indigo-600
                               shadow-lg shadow-sky-500/20 hover:shadow-sky-500/30
                               rounded-xl transition-all duration-200 border border-white/20"
                    >
                      <MapPin className="h-3.5 w-3.5 mr-1.5" />
                      View in Maps
                    </motion.a>
                  </div>
                </div>

                <div className="h-48 relative overflow-hidden rounded-xl mx-4 mb-4 border border-gray-200/20 dark:border-gray-700/20">
                  <Map
                    viewState={{
                      longitude: fleet.lng,
                      latitude: fleet.lat,
                      zoom: 14,
                    }}
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "0.75rem",
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
                        className={`w-4 h-4 rounded-full ${getMarkerColor(
                          fleet
                        )} shadow-lg
                                  border-2 border-white dark:border-gray-800`}
                      />
                    </Marker>
                    <NavigationControl
                      position="bottom-right"
                      showCompass={false}
                      showZoom
                    />
                  </Map>
                </div>
              </motion.div>

              {/* Vessel Info */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="bg-gradient-to-br from-white/50 to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/50 
                          rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50
                          border border-gray-200/20 dark:border-gray-700/20 p-4 space-y-3
                          backdrop-blur-xl"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-500 shadow-lg shadow-sky-500/20">
                    <Ship className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Vessel Information
                  </h3>
                </div>

                <div className="space-y-3">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-900/50 
                              rounded-xl border border-gray-200/20 dark:border-gray-700/20 backdrop-blur-sm"
                  >
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      IMEI
                    </div>
                    <div className="text-xs font-medium text-gray-900 dark:text-white">
                      {fleet.IMEI}
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-900/50 
                              rounded-xl border border-gray-200/20 dark:border-gray-700/20 backdrop-blur-sm"
                  >
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Last Update
                    </div>
                    <div className="text-xs font-medium text-gray-900 dark:text-white">
                      {new Date(fleet.updated).toLocaleString()}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
