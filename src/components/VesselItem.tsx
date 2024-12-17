import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { differenceInMinutes, formatDistanceToNow } from "date-fns";
import {
  Battery,
  Navigation2,
  ChevronDown,
  ChevronUp,
  Clock,
  Waves,
  Compass,
} from "lucide-react";
import { Fleet } from "../types/fleet";

interface VesselItemProps {
  fleet: Fleet;
  onClick: (fleet: Fleet) => void;
  isSelected: boolean;
}

export const VesselItem = memo(
  ({ fleet, onClick, isSelected }: VesselItemProps) => {
    const minutesSinceUpdate = differenceInMinutes(
      new Date(),
      new Date(fleet.updated)
    );

    const isOnline = minutesSinceUpdate < 30;

    const getStatusColor = () => {
      if (!isOnline) return "text-amber-500";
      if (fleet.battery <= 1150) return "text-red-500";
      return "text-emerald-500";
    };

    return (
      <button
        onClick={() => onClick(fleet)}
        className={`w-full px-4 py-3 text-left transition-colors
          ${isSelected 
            ? "bg-sky-50 dark:bg-sky-900/20 border-l-2 border-sky-500" 
            : "hover:bg-gray-50 dark:hover:bg-gray-800/50 border-l-2 border-transparent"}`}
      >
        <div className="flex items-start gap-2.5">
          {/* Status Dot */}
          <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${
            !isOnline
              ? "bg-amber-500"
              : fleet.battery <= 1150
              ? "bg-red-500"
              : "bg-emerald-500"
          }`} />

          {/* Main Content */}
          <div className="min-w-0 flex-1">
            {/* Top Row: Name and Last Update */}
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900 dark:text-white truncate pr-4">
                {fleet.name}
              </span>
              <div className="flex items-center gap-1 text-xs text-gray-500 shrink-0">
                <Clock className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(fleet.updated), { addSuffix: true })}</span>
              </div>
            </div>

            {/* Bottom Row: Battery and Speed */}
            <div className="mt-1.5 flex items-center gap-3 text-xs font-medium">
              <div className="flex items-center gap-1">
                <Battery className={`h-3 w-3 ${getStatusColor()}`} />
                <span className={getStatusColor()}>{(fleet.battery / 100).toFixed(1)}V</span>
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-1 text-gray-500">
                <Navigation2 className="h-3 w-3" />
                <span>{fleet.speed.toFixed(1)}kn</span>
              </div>
            </div>
          </div>
        </div>
      </button>
    );
  }
);

VesselItem.displayName = "VesselItem";
