import { useRef, useCallback, memo, useEffect, useState } from "react";
import Map, { NavigationControl, Marker, Source, Layer } from "react-map-gl";
import mapboxgl from "mapbox-gl";
import { motion } from "framer-motion";
import { Navigation, Maximize2, Anchor } from "lucide-react";
import { useFleetStore } from "../store/fleetStore";
import { useFleets } from "../hooks/useFleets";
import { differenceInMinutes } from "date-fns";
import "mapbox-gl/dist/mapbox-gl.css";
import { useFleetPoints } from "../hooks/useFleetPoints";
import { AddTimeModal } from "./AddTimeModal";

const MAPBOX_TOKEN =
  "pk.eyJ1IjoibXBvYXBvc3RvbGlzIiwiYSI6ImNraWNhYjlvMjBpN3MycXBlN3Y1dTRuencifQ.n6ohBfLI_yGS7kjg92XMow";

const getMarkerColor = (fleet: any) => {
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

const getIconColor = (fleet: any) => {
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

const FleetMarker = memo(({ fleet, isSelected, onClick, isLoading }: any) => (
  <Marker
    latitude={fleet.lat}
    longitude={fleet.lng}
    anchor="center"
    onClick={onClick}
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={`p-3  rounded-full ${getMarkerColor(
        fleet
      )} shadow-lg cursor-pointer 
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

export default function VesselMap() {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const { selectedFleetId, setSelectedFleetId, dateRange } = useFleetStore();
  const { fleets, isLoading } = useFleets();
  const { points, isLoading: isPointsLoading } = useFleetPoints();
  const isDarkTheme = useFleetStore((state) => state.isDarkMode);
  const [isAddTimeModalOpen, setIsAddTimeModalOpen] = useState(false);

  const handleMarkerClick = useCallback(
    (fleet: any) => {
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
    if (!mapRef.current || !fleets || fleets.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();
    fleets.forEach((fleet) => {
      bounds.extend([fleet.lng, fleet.lat]);
    });

    mapRef.current.fitBounds(bounds, {
      padding: 50,
      duration: 2000,
    });
  }, [fleets]);

  // Effect to handle map fly-to when selecting from list
  useEffect(() => {
    if (selectedFleetId && mapRef.current && fleets) {
      const selectedFleet = fleets.find((f) => f.id === selectedFleetId);
      if (selectedFleet) {
        mapRef.current.flyTo({
          center: [selectedFleet.lng, selectedFleet.lat],
          zoom: 12,
          duration: 2000,
          essential: true,
        });
      }
    }
  }, [selectedFleetId, fleets]);

  const selectedFleetPoints = points;

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
        
        {/* Manage Plans Button */}
        <div className="absolute top-4 right-4 z-10">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsAddTimeModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-sky-500 to-blue-600 
                     text-white rounded-xl font-medium transition-all duration-300 
                     shadow-lg hover:shadow-xl shadow-sky-500/20 hover:shadow-sky-500/30 relative 
                     overflow-hidden group backdrop-blur-sm border border-white/20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent 
                        -translate-x-full group-hover:translate-x-full transition-transform 
                        duration-500 ease-out" />
            <div className="p-1 bg-white/20 rounded-lg">
              <Anchor className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm text-white font-medium">Manage Plans</span>
            <div className="hidden sm:flex items-center gap-1.5 pl-2 ml-2 border-l border-white/30">
              <span className="text-xs font-normal text-sky-100">Active Plans</span>
              <span className="px-1.5 py-0.5 bg-sky-400/30 rounded-full text-xs font-medium text-white">
                {fleets.filter(f => f.subscriptionStatus === 'active').length}
              </span>
            </div>
          </motion.button>
        </div>

        {/* Show all fleets button */}
        <div className="absolute top-4 left-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShowAllFleets}
            className="p-2.5 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl 
                     shadow-lg hover:shadow-xl shadow-sky-500/20 hover:shadow-sky-500/30
                     text-white transition-all duration-300 backdrop-blur-sm 
                     border border-white/20 hover:border-white/30"
          >
            <Maximize2 className="h-5 w-5" />
          </motion.button>
        </div>

        {/* Fleet markers */}
        {fleets.map((fleet) => (
          <FleetMarker
            key={fleet.id}
            fleet={fleet}
            isSelected={selectedFleetId === fleet.id}
            onClick={() => handleMarkerClick(fleet)}
            isLoading={isLoading}
          />
        ))}

        {fleets.find((fleet) => fleet.id === selectedFleetId) && (
          <FleetMarker
            isLoading={isPointsLoading}
            fleet={fleets.find((fleet) => fleet.id === selectedFleetId)}
            isSelected={true}
            onClick={() => {}}
          />
        )}

        {/* Route line for selected fleet */}
        {selectedFleetPoints && selectedFleetPoints.length > 1 && (
          <Source
            type="geojson"
            data={{
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: selectedFleetPoints.map((point) => [
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

      <AddTimeModal 
        isOpen={isAddTimeModalOpen}
        onClose={() => setIsAddTimeModalOpen(false)}
      />
    </div>
  );
}
