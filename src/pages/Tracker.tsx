import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Polyline, useMap, Marker } from 'react-leaflet';
import L from 'leaflet';
import { toast } from 'react-toastify';
import { useJogs } from '@/hooks/useJogs';
import GlowButton from '@/components/ui/GlowButton';
import { Play, Square, Save, MapPin, Footprints, Clock, Zap, Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Position {
  lat: number;
  lng: number;
}

// Haversine formula for distance calculation
const calculateDistance = (pos1: Position, pos2: Position): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((pos2.lat - pos1.lat) * Math.PI) / 180;
  const dLon = ((pos2.lng - pos1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((pos1.lat * Math.PI) / 180) *
      Math.cos((pos2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Component to recenter map
const MapRecenter: React.FC<{ position: Position | null }> = ({ position }) => {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.setView([position.lat, position.lng], map.getZoom());
    }
  }, [position, map]);

  return null;
};

// Custom marker icon
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 20px;
      height: 20px;
      background: ${color};
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const Tracker: React.FC = () => {
  const { saveJog } = useJogs();
  const [isTracking, setIsTracking] = useState(false);
  const [route, setRoute] = useState<Position[]>([]);
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  
  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Estimated steps (avg ~1300 steps per km)
  const estimatedSteps = Math.round(distance * 1300);
  
  // Calculate pace (min/km)
  const pace = distance > 0 ? ((duration / 60) / distance).toFixed(2) : '0.00';
  
  // Format duration
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get initial position
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentPosition({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Default to a sample location for demo
          setCurrentPosition({ lat: 40.7128, lng: -74.006 });
        }
      );
    }
  }, []);

  // Start tracking
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsTracking(true);
    setRoute([]);
    setDistance(0);
    setDuration(0);

    // Start timer
    timerRef.current = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);

    // Start watching position
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const newPosition = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        setCurrentPosition(newPosition);
        setRoute((prevRoute) => {
          const newRoute = [...prevRoute, newPosition];
          
          // Calculate new distance
          if (prevRoute.length > 0) {
            const lastPos = prevRoute[prevRoute.length - 1];
            const segmentDistance = calculateDistance(lastPos, newPosition);
            setDistance((prev) => prev + segmentDistance);
          }
          
          return newRoute;
        });
      },
      (error) => {
        console.error('Tracking error:', error);
        toast.error('GPS signal lost. Please check your location settings.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    toast.success('Tracking started! Let\'s go! 🏃‍♂️');
  }, []);

  // Stop tracking
  const stopTracking = useCallback(() => {
    setIsTracking(false);

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    toast.info('Tracking stopped. Great run!');
  }, []);

  // Save route
  const handleSaveRoute = async () => {
    if (route.length < 2) {
      toast.warning('Not enough data to save. Run a bit more!');
      return;
    }

    setIsSaving(true);
    try {
      await saveJog({
        route,
        distance_km: distance,
        duration_seconds: duration,
        steps: estimatedSteps,
      });
      setRoute([]);
      setDistance(0);
      setDuration(0);
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsSaving(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const defaultCenter: Position = currentPosition || { lat: 40.7128, lng: -74.006 };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">GPS Tracker</h1>
          <p className="text-muted-foreground mt-1">Track your run in real-time</p>
        </div>
        {isTracking && (
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-accent/20 border border-accent/30">
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-accent" />
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-accent animate-ping" />
            </div>
            <span className="font-semibold text-accent">LIVE</span>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="relative rounded-3xl overflow-hidden shadow-elevated border border-border/50">
        <div className="h-[400px] md:h-[500px]">
          <MapContainer
            center={[defaultCenter.lat, defaultCenter.lng]}
            zoom={15}
            className="h-full w-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Route polyline */}
            {route.length > 1 && (
              <Polyline
                positions={route.map((p): [number, number] => [p.lat, p.lng])}
                pathOptions={{
                  color: 'hsl(217, 91%, 60%)',
                  weight: 5,
                  opacity: 0.8,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
            )}

            {/* Start marker */}
            {route.length > 0 && (
              <Marker
                position={[route[0].lat, route[0].lng]}
                icon={createCustomIcon('#10B981')}
              />
            )}

            {/* Current position marker */}
            {currentPosition && (
              <Marker
                position={[currentPosition.lat, currentPosition.lng]}
                icon={createCustomIcon(isTracking ? '#F97316' : '#3B82F6')}
              />
            )}

            <MapRecenter position={currentPosition} />
          </MapContainer>
        </div>

        {/* Floating Controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
          {!isTracking ? (
            <GlowButton
              variant="accent"
              size="xl"
              icon={Play}
              onClick={startTracking}
              className="shadow-elevated"
            >
              Start Run
            </GlowButton>
          ) : (
            <>
              <GlowButton
                variant="primary"
                size="lg"
                icon={Square}
                onClick={stopTracking}
                className="shadow-elevated"
              >
                Stop
              </GlowButton>
            </>
          )}
          
          {!isTracking && route.length > 1 && (
            <GlowButton
              variant="secondary"
              size="lg"
              icon={Save}
              onClick={handleSaveRoute}
              isLoading={isSaving}
              className="shadow-elevated"
            >
              Save Run
            </GlowButton>
          )}
        </div>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-2xl p-5 border border-border/50 shadow-card">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
              <MapPin className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Distance</p>
              <p className="font-display text-2xl font-bold text-foreground">
                {distance.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">km</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border/50 shadow-card">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
              <Footprints className="h-6 w-6 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Steps</p>
              <p className="font-display text-2xl font-bold text-foreground">
                {estimatedSteps.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border/50 shadow-card">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center">
              <Clock className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-display text-2xl font-bold text-foreground">
                {formatDuration(duration)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border/50 shadow-card">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
              <Zap className="h-6 w-6 text-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pace</p>
              <p className="font-display text-2xl font-bold text-foreground">
                {pace} <span className="text-sm font-normal text-muted-foreground">min/km</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-2xl p-6 border border-border/50">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Navigation className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">GPS Tips</h3>
            <p className="text-sm text-muted-foreground">
              For best accuracy, ensure location services are enabled and you're outdoors with a clear view of the sky. 
              Keep your phone steady while running for more accurate tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tracker;
