import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { differenceInHours, formatDistanceToNow } from "date-fns";
import {
  Battery,
  Navigation2,
  ChevronDown,
  ChevronUp,
  Clock,
  Waves,
  Compass,
  Gauge,
} from "lucide-react";
import { Fleet } from "../types/fleet";

interface VesselItemProps {
  fleet: Fleet;
  onClick: (fleet: Fleet) => void;
  isSelected: boolean;
}

export function VesselItem({
  fleet,
  onClick,
  isSelected,
}: {
  fleet: Fleet;
  onClick: (fleet: Fleet) => void;
  isSelected: boolean;
}) {
  const lastUpdate = fleet.updated ? new Date(fleet.updated) : null;
  const timeDifference = lastUpdate
    ? formatDistanceToNow(lastUpdate, { addSuffix: true })
    : "No data";

  return (
    <button
      onClick={() => onClick(fleet)}
      className={`w-full p-4 text-left transition-all duration-200
                ${
                  isSelected
                    ? "bg-blue-50/80 dark:bg-blue-500/10 border-l-[3px] border-l-blue-500"
                    : "hover:bg-gray-50/80 dark:hover:bg-gray-800/50 border-l-[3px] border-transparent"
                }
                group relative overflow-hidden`}
    >
      {/* Premium hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent 
                    translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`w-2.5 h-2.5 rounded-full
                           ${getStatusColor(fleet)}
                           animate-pulse`} />
              <div className={`absolute inset-0 w-2.5 h-2.5 rounded-full
                           ${getStatusRingColor(fleet)}
                           animate-ping opacity-75`} />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white tracking-tight">
              {fleet.name}
            </h3>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
            {timeDifference}
          </span>
        </div>

        <div className="flex items-center gap-6 ml-5">
          <div className="flex items-center gap-2">
            <Battery className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-300 tabular-nums">
              {fleet.battery ? `${(fleet.battery / 100).toFixed(1)}V` : "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-300 tabular-nums">
              {typeof fleet.speed === 'number' ? `${fleet.speed.toFixed(1)} kn` : "0.0 kn"}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function getStatusColor(fleet: Fleet) {
  if (!fleet.updated) return "bg-gray-400";
  const lastUpdate = new Date(fleet.updated);
  const hoursDiff = differenceInHours(new Date(), lastUpdate);

  if (hoursDiff > 24) return "bg-red-500";
  if (hoursDiff > 12) return "bg-amber-500";
  return "bg-emerald-500";
}

function getStatusRingColor(fleet: Fleet) {
  if (!fleet.updated) return "bg-gray-400";
  const lastUpdate = new Date(fleet.updated);
  const hoursDiff = differenceInHours(new Date(), lastUpdate);

  if (hoursDiff > 24) return "bg-red-400";
  if (hoursDiff > 12) return "bg-amber-400";
  return "bg-emerald-400";
}
