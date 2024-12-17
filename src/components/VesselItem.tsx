import { memo } from "react";
import { motion } from "framer-motion";
import { differenceInMinutes, format } from "date-fns";
import { Fleet } from "@/types/fleet";

interface VesselItemProps {
  fleet: Fleet;
  onClick: (fleet: Fleet) => void;
  isSelected: boolean;
}

export const VesselItem = memo(({ fleet, onClick, isSelected }: VesselItemProps) => {
  const minutesSinceUpdate = differenceInMinutes(
    new Date(),
    new Date(fleet.updated)
  );

  const getStatusColor = () => {
    if (minutesSinceUpdate >= 30) return "text-amber-500 dark:text-amber-400";
    if (fleet.battery <= 20) return "text-red-500 dark:text-red-400";
    return "text-sky-500 dark:text-sky-400";
  };

  return (
    <motion.button
      whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.05)" }}
      onClick={() => onClick(fleet)}
      className={`w-full px-4 py-3 text-left border-b border-gray-100 dark:border-gray-700/50 
        ${isSelected ? "bg-sky-50 dark:bg-sky-900/20" : ""}`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium">{fleet.name}</span>
        <span className={`text-xs font-medium ${getStatusColor()}`}>
          {minutesSinceUpdate >= 30
            ? "⚠️ Outdated"
            : fleet.battery <= 20
            ? "🔋 Low Battery"
            : "✓ Normal"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-300">
        <div className="flex items-center gap-1">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              fleet.battery <= 20
                ? "bg-red-500"
                : fleet.battery <= 50
                ? "bg-amber-500"
                : "bg-sky-500"
            }`}
          ></span>
          {fleet.battery}%
        </div>
        <div>{fleet.speed} knots</div>
        <div className="col-span-2 text-xs text-gray-500">
          Last Update: {format(new Date(fleet.updated), "HH:mm dd/MM")}
        </div>
      </div>
    </motion.button>
  );
});
