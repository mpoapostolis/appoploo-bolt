import { useRef, useState, useCallback, useMemo } from "react";
import Map, { NavigationControl, Source, Layer, MapRef } from "react-map-gl";
import { motion, AnimatePresence } from "framer-motion";
import { Anchor, ChevronDown, ChevronUp, Info, Maximize2 } from "lucide-react";
import { differenceInMinutes } from "date-fns";

import { useFleetStore } from "../store/fleetStore";
import { useFleets } from "../hooks/useFleets";
import { useFleetPoints } from "../hooks/useFleetPoints";
import { Fleet } from "../types/fleet";
import { VesselDetails } from "./VesselDetails";
import { FleetMarker } from "./FleetMarker";
import { VesselItem } from "./VesselItem";
import { MAPBOX_TOKEN } from "../lib/mapbox";

interface VesselMapProps {}

const timeRanges = [
  { label: "1D", days: 1 },
  { label: "3D", days: 3 },
  { label: "7D", days: 7 },
];

export function VesselMap() {
  const mapRef = useRef<MapRef | null>(null);
  const {
    isDarkTheme,
    selectedFleetId,
    setSelectedFleetId,
    dateRange,
    setDateRange,
  } = useFleetStore();
  const { fleets, isLoading } = useFleets();
  const { points, isLoading: isPointsLoading } = useFleetPoints();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showVesselDetails, setShowVesselDetails] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({
    critical: true,
    outdated: true,
    normal: true,
  });

  const selectedFleet = useMemo(
    () => fleets?.find((f) => f.id === selectedFleetId),
    [fleets, selectedFleetId]
  );

  const handleMarkerClick = useCallback(
    (fleet: Fleet) => {
      setSelectedFleetId(fleet.id);
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [fleet.lng, fleet.lat],
          zoom: 12,
          duration: 2000,
          essential: true,
        });
      }
    },
    [setSelectedFleetId]
  );

  const handleShowAllFleets = useCallback(() => {
    if (!mapRef.current || !fleets?.length) return;

    const bounds = new mapboxgl.LngLatBounds();
    fleets.forEach((fleet) => {
      bounds.extend([fleet.lng, fleet.lat]);
    });

    mapRef.current.fitBounds(bounds, { padding: 50, duration: 2000 });
  }, [fleets]);

  const handlePresetClick = useCallback(
    (days: number) => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - days);
      setDateRange(start, end);
    },
    [setDateRange]
  );

  const groupedVessels = useMemo(() => {
    if (!fleets) return { critical: [], outdated: [], normal: [] };

    // Sort all vessels by latest update first
    const sortedFleets = [...fleets].sort(
      (a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime()
    );

    return sortedFleets.reduce(
      (acc, fleet) => {
        const minutesSinceUpdate = differenceInMinutes(
          new Date(),
          new Date(fleet.updated)
        );
        if (minutesSinceUpdate >= 30) {
          acc.outdated.push(fleet);
        } else if (fleet.battery <= 1150) {
          acc.critical.push(fleet);
        } else {
          acc.normal.push(fleet);
        }
        return acc;
      },
      { critical: [], outdated: [], normal: [] } as Record<string, Fleet[]>
    );
  }, [fleets]);

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  const renderVesselGroup = (title: string, vessels: Fleet[], type: string) => {
    if (vessels.length === 0) return null;

    return (
      <div className="py-2">
        <button
          onClick={() => toggleGroup(type)}
          className="w-full flex items-center justify-between px-4 py-2
                   hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className={`h-2 w-2 rounded-full ${
              type === "critical"
                ? "bg-red-500"
                : type === "outdated"
                ? "bg-amber-500"
                : "bg-emerald-500"
            }`} />
            <span className="font-medium text-gray-900 dark:text-white">
              {title}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full
                          ${type === "critical" 
                            ? "bg-red-50 text-red-600 dark:bg-red-500/10"
                            : type === "outdated"
                            ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10"
                            : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"
                          }`}>
              {vessels.length}
            </span>
          </div>
          {expandedGroups[type] ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </button>

        <AnimatePresence>
          {expandedGroups[type] && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="py-1">
                {vessels.map((fleet) => (
                  <VesselItem
                    key={fleet.id}
                    fleet={fleet}
                    onClick={(f) => {
                      setSelectedFleetId(f.id);
                      setIsDropdownOpen(false);
                      if (mapRef.current) {
                        mapRef.current.flyTo({
                          center: [f.lng, f.lat],
                          zoom: 14,
                          duration: 2000,
                        });
                      }
                    }}
                    isSelected={fleet.id === selectedFleetId}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: 23.7275,
          latitude: 37.9838,
          zoom: 7,
        }}
        mapStyle={
          isDarkTheme
            ? "mapbox://styles/mapbox/dark-v11"
            : "mapbox://styles/mapbox/streets-v12"
        }
      >
        <NavigationControl position="bottom-right" />

        {/* Show all fleets button - Top left */}
        <div className="absolute top-4 left-4 z-10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShowAllFleets}
            className="p-2.5 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl 
                     shadow-lg hover:shadow-xl shadow-sky-500/20 hover:shadow-sky-500/30
                     text-white transition-all duration-300 backdrop-blur-sm 
                     border border-white/20"
          >
            <Maximize2 className="h-5 w-5" />
          </motion.button>
        </div>

        {/* Vessel Controls - Top right */}
        <div className="absolute top-4 right-4 z-10">
          {selectedFleetId ? (
            // Selected vessel controls
            <div className="flex items-center gap-2">
              {/* Combined vessel selector, time range, and info controls */}
              <div
                className="flex items-stretch h-11 bg-gradient-to-br from-sky-500 to-blue-600 
                            rounded-xl shadow-lg shadow-sky-500/20 hover:shadow-xl hover:shadow-sky-500/30 
                            transition-all duration-300 backdrop-blur-sm border border-white/20 
                            ring-2 ring-white/10 ring-offset-2 ring-offset-black/5"
              >
                {/* Vessel selector */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-4 text-white font-medium border-r border-white/10
                           hover:bg-white/5 transition-all duration-300"
                >
                  <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-sm">
                    <Anchor className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-white/90">{selectedFleet?.name}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform text-white/70
                              ${isDropdownOpen ? "rotate-180" : ""}`}
                  />
                </motion.button>

                {/* Time range selector */}
                <div className="flex items-stretch border-r border-white/10">
                  {timeRanges.map((range) => (
                    <motion.button
                      key={range.days}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePresetClick(range.days)}
                      className={`px-4 flex items-center text-sm font-medium transition-all
                                ${
                                  dateRange?.start &&
                                  differenceInMinutes(
                                    dateRange.end,
                                    dateRange.start
                                  ) /
                                    (24 * 60) ===
                                    range.days
                                    ? "bg-white/20 text-white shadow-inner"
                                    : "text-white/90 hover:bg-white/5"
                                }`}
                    >
                      {range.label}
                    </motion.button>
                  ))}
                </div>

                {/* Info button */}
                <motion.button
                  whileHover={{
                    scale: 1.02,
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowVesselDetails(true)}
                  className="flex items-center px-4 text-white/90 transition-all duration-300"
                >
                  <Info className="h-5 w-5" />
                </motion.button>
              </div>
            </div>
          ) : (
            // Default vessel selector
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex w-80 justify-between items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-sky-500 to-blue-600 
                       text-white rounded-xl font-medium transition-all duration-300 
                       shadow-lg hover:shadow-xl shadow-sky-500/20 hover:shadow-sky-500/30 
                       backdrop-blur-sm border border-white/20"
            >
              <div className="p-1.5 bg-white/20 rounded-lg">
                <Anchor className="h-4 w-4 text-white" />
              </div>
              <span>Select Vessel</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </motion.button>
          )}
          {/* Vessel selection dropdown */}
          {isDropdownOpen && (
            <div
              className="absolute top-full right-0 mt-2 w-[400px] bg-white/90 dark:bg-gray-900/90 
                       rounded-xl shadow-lg backdrop-blur-sm border border-gray-100 dark:border-gray-800
                       overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-base font-medium text-gray-900 dark:text-white">
                  Select Vessel ({fleets?.length})
                </h3>
              </div>

              <div className="max-h-[65vh] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                {renderVesselGroup(
                  "Critical Status",
                  groupedVessels.critical,
                  "critical"
                )}
                {renderVesselGroup(
                  "Normal Status",
                  groupedVessels.normal,
                  "normal"
                )}
                {renderVesselGroup(
                  "Needs Update",
                  groupedVessels.outdated,
                  "outdated"
                )}
              </div>
            </div>
          )}
        </div>

        {/* Fleet markers */}
        {fleets?.map((fleet) => (
          <FleetMarker
            key={fleet.id}
            fleet={fleet}
            isSelected={selectedFleetId === fleet.id}
            onClick={() => handleMarkerClick(fleet)}
            isLoading={isLoading}
          />
        ))}

        {/* Route line for selected fleet */}
        {points && points.length > 1 && (
          <Source
            type="geojson"
            data={{
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: points.map((point) => [point.lng, point.lat]),
              },
            }}
          >
            <Layer
              id="route"
              type="line"
              paint={{
                "line-color": isDarkTheme ? "#3b82f6" : "#2563eb",
                "line-width": 2,
                "line-opacity": 0.8,
              }}
            />
          </Source>
        )}
      </Map>

      {/* Vessel Details Modal */}
      {selectedFleetId && (
        <VesselDetails
          isOpen={showVesselDetails}
          onClose={() => setShowVesselDetails(false)}
          fleet={selectedFleet}
        />
      )}
    </div>
  );
}
