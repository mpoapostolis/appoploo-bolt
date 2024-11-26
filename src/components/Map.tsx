import { useRef, useCallback, memo, useEffect } from 'react';
import Map, { NavigationControl, Marker, Source, Layer } from 'react-map-gl';
import mapboxgl from 'mapbox-gl';
import { motion } from 'framer-motion';
import { Navigation, Maximize2 } from 'lucide-react';
import { useFleetStore } from '../store/fleetStore';
import { useFleets } from '../hooks/useFleets';
import { differenceInMinutes } from 'date-fns';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = "pk.eyJ1IjoibXBvYXBvc3RvbGlzIiwiYSI6ImNraWNhYjlvMjBpN3MycXBlN3Y1dTRuencifQ.n6ohBfLI_yGS7kjg92XMow";

const getMarkerColor = (fleet: any) => {
  const minutesSinceUpdate = differenceInMinutes(new Date(), new Date(fleet.updated));
  
  if (minutesSinceUpdate >= 30) return 'bg-red-100 dark:bg-red-900/30';
  if (minutesSinceUpdate >= 15) return 'bg-amber-100 dark:bg-amber-900/30';
  if (!fleet.enabled) return 'bg-gray-100 dark:bg-gray-800';
  if (fleet.battery <= 20) return 'bg-amber-100 dark:bg-amber-900/30';
  if (fleet.speed === 0) return 'bg-blue-100 dark:bg-blue-900/30';
  return 'bg-emerald-100 dark:bg-emerald-900/30';
};

const getIconColor = (fleet: any) => {
  const minutesSinceUpdate = differenceInMinutes(new Date(), new Date(fleet.updated));
  
  if (minutesSinceUpdate >= 30) return 'text-red-500 dark:text-red-400';
  if (minutesSinceUpdate >= 15) return 'text-amber-500 dark:text-amber-400';
  if (!fleet.enabled) return 'text-gray-400 dark:text-gray-500';
  if (fleet.battery <= 20) return 'text-amber-500';
  if (fleet.speed === 0) return 'text-blue-500';
  return 'text-emerald-500';
};

const FleetMarker = memo(({ fleet, isSelected, onClick }: any) => (
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
      className={`p-3 rounded-full ${getMarkerColor(fleet)} shadow-lg cursor-pointer 
                 border-2 transition-colors ${
        isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      <Navigation 
        className={`h-4 w-4 ${
          isSelected
            ? 'text-blue-500'
            : getIconColor(fleet)
        }`}
        style={{ 
          transform: `rotate(${fleet.course}deg)` 
        }}
      />
    </motion.div>
  </Marker>
));

export default function VesselMap() {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const { selectedFleetId, setSelectedFleetId, dateRange, points } = useFleetStore();
  const { fleets, isLoading } = useFleets();

  const handleMarkerClick = useCallback((fleet: any) => {
    setSelectedFleetId(fleet.id);
    
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [fleet.lng, fleet.lat],
        zoom: 12,
        duration: 2000,
        essential: true
      });
    }
  }, [setSelectedFleetId]);

  const handleShowAllFleets = useCallback(() => {
    if (!mapRef.current || !fleets || fleets.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();
    fleets.forEach(fleet => {
      bounds.extend([fleet.lng, fleet.lat]);
    });

    mapRef.current.fitBounds(bounds, {
      padding: 50,
      duration: 2000
    });
  }, [fleets]);

  // Effect to handle map fly-to when selecting from list
  useEffect(() => {
    if (selectedFleetId && mapRef.current && fleets) {
      const selectedFleet = fleets.find(f => f.id === selectedFleetId);
      if (selectedFleet) {
        mapRef.current.flyTo({
          center: [selectedFleet.lng, selectedFleet.lat],
          zoom: 12,
          duration: 2000,
          essential: true
        });
      }
    }
  }, [selectedFleetId, fleets]);

  const selectedFleetPoints = selectedFleetId && dateRange.start && dateRange.end
    ? points[selectedFleetId]?.filter(point => {
        const pointDate = new Date(point.created);
        return pointDate >= dateRange.start && pointDate <= dateRange.end;
      })
    : [];

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
          latitude: 37.9838,
          longitude: 23.7275,
          zoom: 6
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
      >
        <NavigationControl position="bottom-left" />
        
        {/* Show all fleets button */}
        <div className="absolute top-4 left-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShowAllFleets}
            className="px-4 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg 
                     border border-gray-200/50 dark:border-gray-700/50 text-sm font-medium
                     text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800
                     transition-all duration-200 flex items-center space-x-2"
          >
            <Maximize2 className="h-4 w-4" />
            <span>Show All Fleets</span>
          </motion.button>
        </div>
        
        {/* Fleet markers */}
        {fleets?.map(fleet => (
          <FleetMarker
            key={fleet.id}
            fleet={fleet}
            isSelected={selectedFleetId === fleet.id}
            onClick={() => handleMarkerClick(fleet)}
          />
        ))}

        {/* Route line for selected fleet */}
        {selectedFleetPoints && selectedFleetPoints.length > 1 && (
          <Source
            type="geojson"
            data={{
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: selectedFleetPoints.map(point => [point.lng, point.lat])
              }
            }}
          >
            <Layer
              id="route"
              type="line"
              paint={{
                'line-color': '#3b82f6',
                'line-width': 3,
                'line-opacity': 0.8
              }}
            />
          </Source>
        )}
      </Map>
    </div>
  );
}