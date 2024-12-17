import { memo } from "react";
import { Marker } from "react-map-gl";
import { motion } from "framer-motion";
import { Navigation } from "lucide-react";
import { differenceInMinutes } from "date-fns";
import { Fleet } from "@/types/fleet";

interface FleetMarkerProps {
  fleet: Fleet;
  isSelected: boolean;
  onClick: (fleet: Fleet) => void;
  isLoading: boolean;
}

const getMarkerColor = (fleet: Fleet) => {
  const minutesSinceUpdate = differenceInMinutes(
    new Date(),
    new Date(fleet.updated)
  );

  if (minutesSinceUpdate >= 30) return "bg-red-100 dark:bg-red-900/30";
  if (minutesSinceUpdate >= 15) return "bg-amber-100 dark:bg-amber-900/30";
  if (!fleet.enabled) return "bg-gray-100 dark:bg-gray-800";
  if (fleet.battery <= 20) return "bg-amber-100 dark:bg-amber-900/30";
  if (fleet.speed === 0) return "bg-blue-100 dark:bg-blue-900/30";
  return "bg-emerald-100 dark:bg-emerald-900/30";
};

const getIconColor = (fleet: Fleet) => {
  const minutesSinceUpdate = differenceInMinutes(
    new Date(),
    new Date(fleet.updated)
  );

  if (minutesSinceUpdate >= 30) return "text-red-500 dark:text-red-400";
  if (minutesSinceUpdate >= 15) return "text-amber-500 dark:text-amber-400";
  if (!fleet.enabled) return "text-gray-400 dark:text-gray-500";
  if (fleet.battery <= 20) return "text-amber-500";
  if (fleet.speed === 0) return "text-blue-500";
  return "text-emerald-500";
};

export const FleetMarker = memo(({ fleet, isSelected, onClick, isLoading }: FleetMarkerProps) => (
  <Marker
    latitude={fleet.lat}
    longitude={fleet.lng}
    anchor="center"
    onClick={() => onClick(fleet)}
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={`p-3 rounded-full ${getMarkerColor(fleet)} shadow-lg cursor-pointer 
                 border-2 transition-colors ${
                   isSelected
                     ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                     : "border-gray-200 dark:border-gray-700"
                 }`}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
      ) : (
        <Navigation
          className={`h-4 w-4 ${
            isSelected ? "text-blue-500" : getIconColor(fleet)
          }`}
          style={{
            transform: `rotate(${fleet.course}deg)`,
          }}
        />
      )}
    </motion.div>
  </Marker>
));
