import { memo, useState } from "react";
import { motion } from "framer-motion";
import { Ship, Battery, Navigation, Clock, AlertTriangle, Plus } from "lucide-react";
import { differenceInMinutes, formatDistanceToNow } from "date-fns";
import { useFleetStore } from "../../store/fleetStore";
import { useFleets } from "../../hooks/useFleets";
import FleetFilters from "./FleetFilters";
import DateRangePicker from "./DateRangePicker";
import OrderTrackerModal from "../OrderTrackerModal";

export const getUpdateStatus = (lastUpdate: string) => {
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

export const StatusBadge = ({ status }: { status: any }) => (
  <div
    className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                backdrop-blur-sm border border-white/10 shadow-sm
                 ${status.color} ${status.bgColor} transition-all duration-200`}
  >
    {status.icon && (
      <div className="relative">
        {status.icon}
        {status.pulse && (
          <span
            className="absolute inset-0 animate-pulse-ring rounded-full"
            style={{ backgroundColor: "currentColor" }}
          />
        )}
      </div>
    )}
    <span>{status.text}</span>
  </div>
);

export const VesselCard = memo(({ fleet, isSelected, onClick }: any) => {
  const updateStatus = getUpdateStatus(fleet.updated);
  const batteryVoltage = +(fleet.battery / 1000).toFixed(1);

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 
                border border-gray-200 dark:border-gray-700/50 shadow-sm hover:shadow-lg
                ${
                  isSelected
                    ? "bg-gradient-to-br from-sky-500/10 to-blue-600/10 dark:from-sky-500/20 dark:to-blue-600/20 ring-2 ring-sky-500/50"
                    : "bg-white dark:bg-gray-800/50 hover:bg-gray-50/80 dark:hover:bg-gray-800/80"
                }`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent 
                    -translate-x-full hover:translate-x-full transition-transform 
                    duration-700 ease-out pointer-events-none" />
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div
              className={`p-2.5 rounded-lg backdrop-blur-sm transition-colors duration-300
                ${
                  isSelected
                    ? "bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-sky-500/20"
                    : "bg-gray-100 dark:bg-gray-800"
                }`}
            >
              <Ship
                className={`h-5 w-5 ${
                  isSelected ? "text-white" : updateStatus.color
                }`}
              />
            </div>

            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {fleet.name}
              </h3>

              <div className="mt-2 space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="p-1 rounded-md bg-gray-100 dark:bg-gray-800">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(fleet.updated), {
                      addSuffix: true,
                    })}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="p-1 rounded-md bg-gray-100 dark:bg-gray-800">
                    <Battery
                      className={`h-3.5 w-3.5 ${
                        batteryVoltage > 12
                          ? "text-emerald-500 dark:text-emerald-400"
                          : batteryVoltage > 11
                          ? "text-amber-500 dark:text-amber-400"
                          : "text-red-500 dark:text-red-400"
                      }`}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {batteryVoltage}V
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="p-1 rounded-md bg-gray-100 dark:bg-gray-800">
                    <Navigation
                      className={`h-3.5 w-3.5 ${
                        fleet.speed === 0
                          ? "text-gray-400 dark:text-gray-500"
                          : "text-blue-500 dark:text-blue-400"
                      }`}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {fleet.speed.toFixed(1)} knots
                  </span>
                </div>
              </div>
            </div>
          </div>

          <StatusBadge status={updateStatus} />
        </div>
      </div>
    </motion.div>
  );
});

export default function VesselList() {
  const { fleets, isLoading } = useFleets();
  const { selectedFleetId, setSelectedFleetId, sortKey } = useFleetStore();
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const sortedFleets = [...(fleets || [])].sort((a, b) => {
    switch (sortKey) {
      case "updated":
        return new Date(b.updated).getTime() - new Date(a.updated).getTime();
      case "battery":
        return b.battery - a.battery;
      case "speed":
        return b.speed - a.speed;
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-24 bg-gray-100 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <DateRangePicker />
        <FleetFilters />
      </div>

      <div className="space-y-3">
        {sortedFleets.map((fleet) => (
          <VesselCard
            key={fleet.id}
            fleet={fleet}
            isSelected={selectedFleetId === fleet.id}
            onClick={() => setSelectedFleetId(fleet.id)}
          />
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOrderModalOpen(true)}
        className="w-full py-3 px-4 bg-gradient-to-br from-sky-500 to-blue-600 
                 text-white font-medium rounded-xl hover:opacity-90 transition-opacity
                 flex items-center justify-center space-x-2 shadow-lg"
      >
        <Plus className="h-5 w-5" />
        <span>Order New Tracker</span>
      </motion.button>

      <OrderTrackerModal 
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
      />
    </div>
  );
}
