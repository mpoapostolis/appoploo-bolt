import { useRef, useState, useCallback, useMemo } from "react";
import Map, {
  NavigationControl,
  Source,
  Layer,
  MapRef,
} from "react-map-gl";
import { motion } from "framer-motion";
import {
  Anchor,
  ChevronDown,
  Info,
  Maximize2,
} from "lucide-react";
import { differenceInMinutes } from "date-fns";

import { useFleetStore } from "../store/fleetStore";
import { useFleets } from "../hooks/useFleets";
import { useFleetPoints } from "../hooks/useFleetPoints";
import { Fleet } from "../types/fleet";
import { VesselDetails } from "./VesselDetails";
import { FleetMarker } from "./FleetMarker";
import { VesselItem } from "./VesselItem";
import { MAPBOX_TOKEN } from "../lib/mapbox";

interface VesselMapProps {
}

const timeRanges = [
  { label: "1D", days: 1 },
  { label: "3D", days: 3 },
  { label: "7D", days: 7 },
];

export function VesselMap() {
  const mapRef = useRef<MapRef | null>(null);
  const { isDarkTheme, selectedFleetId, setSelectedFleetId, dateRange, setDateRange } = useFleetStore();
  const { fleets, isLoading } = useFleets();
  const { points, isLoading: isPointsLoading } = useFleetPoints();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showVesselDetails, setShowVesselDetails] = useState(false);

  const selectedFleet = useMemo(() => 
    fleets?.find((f) => f.id === selectedFleetId),
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

  const handlePresetClick = useCallback((days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setDateRange(start, end);
  }, [setDateRange]);

  const groupedVessels = useMemo(() => {
    if (!fleets) return { critical: [], outdated: [], normal: [] };
    return fleets.reduce(
      (acc, fleet) => {
        const minutesSinceUpdate = differenceInMinutes(
          new Date(),
          new Date(fleet.updated)
        );
        if (minutesSinceUpdate >= 30) {
          acc.outdated.push(fleet);
        } else if (fleet.battery <= 20) {
          acc.critical.push(fleet);
        } else {
          acc.normal.push(fleet);
        }
        return acc;
      },
      { critical: [], outdated: [], normal: [] } as Record<string, Fleet[]>
    );
  }, [fleets]);

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
              <div className="flex items-stretch h-11 bg-gradient-to-br from-sky-500 to-blue-600 
                            rounded-xl shadow-lg shadow-sky-500/20 hover:shadow-xl hover:shadow-sky-500/30 
                            transition-all duration-300 backdrop-blur-sm border border-white/20 
                            ring-2 ring-white/10 ring-offset-2 ring-offset-black/5">
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
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
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
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-sky-500 to-blue-600 
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
              className="absolute top-full right-0 mt-2 w-72 bg-white/95 dark:bg-gray-800/95 rounded-xl shadow-2xl 
                         backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
            >
              <div className="max-h-[70vh] overflow-y-auto">
                {/* Critical Battery Section */}
                {groupedVessels.critical.length > 0 && (
                  <div>
                    <div className="px-4 py-2 bg-red-50/50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-900/30">
                      <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                        Critical Battery
                      </span>
                    </div>
                    {groupedVessels.critical.map((fleet) => (
                      <VesselItem
                        key={fleet.id}
                        fleet={fleet}
                        onClick={() => {
                          handleMarkerClick(fleet);
                          setIsDropdownOpen(false);
                        }}
                        isSelected={selectedFleetId === fleet.id}
                      />
                    ))}
                  </div>
                )}

                {/* Outdated Section */}
                {groupedVessels.outdated.length > 0 && (
                  <div>
                    <div className="px-4 py-2 bg-amber-50/50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-900/30">
                      <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                        Needs Update
                      </span>
                    </div>
                    {groupedVessels.outdated.map((fleet) => (
                      <VesselItem
                        key={fleet.id}
                        fleet={fleet}
                        onClick={() => {
                          handleMarkerClick(fleet);
                          setIsDropdownOpen(false);
                        }}
                        isSelected={selectedFleetId === fleet.id}
                      />
                    ))}
                  </div>
                )}

                {/* Normal Status Section */}
                {groupedVessels.normal.length > 0 && (
                  <div>
                    <div className="px-4 py-2 bg-blue-50/50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-900/30">
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        Normal Status
                      </span>
                    </div>
                    {groupedVessels.normal.map((fleet) => (
                      <VesselItem
                        key={fleet.id}
                        fleet={fleet}
                        onClick={() => {
                          handleMarkerClick(fleet);
                          setIsDropdownOpen(false);
                        }}
                        isSelected={selectedFleetId === fleet.id}
                      />
                    ))}
                  </div>
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
                coordinates: points.map((point) => [
                  point.lng,
                  point.lat,
                ]),
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
