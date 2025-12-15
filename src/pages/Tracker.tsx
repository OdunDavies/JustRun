import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Polyline, useMap, Marker } from 'react-leaflet';
import L from 'leaflet';
import { toast } from 'react-toastify';
import { useJogs } from '@/hooks/useJogs';
import { useBackgroundTracking } from '@/hooks/useBackgroundTracking';
import GlowButton from '@/components/ui/GlowButton';
import { Play, Square, Save, MapPin, Footprints, Clock, Zap, Navigation, Smartphone, Signal } from 'lucide-react';
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
  const R = 6371;
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

// Custom marker icon with athletic style
const createCustomIcon = (color: string, isActive: boolean = false) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: ${isActive ? '24px' : '18px'};
      height: ${isActive ? '24px' : '18px'};
      background: ${color};
      border-radius: 50%;
      border: 3px solid #fff;
      box-shadow: 0 0 ${isActive ? '20px' : '10px'} ${color};
      ${isActive ? 'animation: pulse 1.5s infinite;' : ''}
    "></div>`,
    iconSize: [isActive ? 24 : 18, isActive ? 24 : 18],
    iconAnchor: [isActive ? 12 : 9, isActive ? 12 : 9],
  });
};

const Tracker: React.FC = () => {
  const { saveJog } = useJogs();
  const { isBackgroundSupported, syncTrackingState, requestBackgroundPermission } = useBackgroundTracking();
  
  const [isTracking, setIsTracking] = useState(false);
  const [route, setRoute] = useState<Position[]>([]);
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  
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

  // Sync tracking state for background persistence
  useEffect(() => {
    syncTrackingState(isTracking, route, distance, duration);
  }, [isTracking, route, distance, duration, syncTrackingState]);

  // Get initial position
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentPosition({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setGpsAccuracy(pos.coords.accuracy);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setCurrentPosition({ lat: 40.7128, lng: -74.006 });
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Start tracking
  const startTracking = useCallback(async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    // Request background permission
    await requestBackgroundPermission();

    setIsTracking(true);
    setRoute([]);
    setDistance(0);
    setDuration(0);

    // Start timer
    timerRef.current = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);

    // Start watching position with background support
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const accuracy = pos.coords.accuracy;
        setGpsAccuracy(accuracy);
        
        if (accuracy > 50) {
          return;
        }

        const newPosition = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        setCurrentPosition(newPosition);
        setRoute((prevRoute) => {
          if (prevRoute.length === 0) {
            return [newPosition];
          }
          
          const lastPos = prevRoute[prevRoute.length - 1];
          const segmentDistance = calculateDistance(lastPos, newPosition);
          
          if (segmentDistance < 0.005) {
            return prevRoute;
          }
          
          if (segmentDistance > 0.1) {
            return prevRoute;
          }
          
          setDistance((prev) => prev + segmentDistance);
          return [...prevRoute, newPosition];
        });
      },
      (error) => {
        console.error('Tracking error:', error);
        if (error.code === 1) {
          toast.error('Location permission denied');
        } else if (error.code === 2) {
          toast.error('GPS unavailable - try going outside');
        } else {
          toast.error('GPS signal lost');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 1000,
      }
    );

    toast.success('TRACKING STARTED - GO!');
  }, [requestBackgroundPermission]);

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

    toast.info('Run complete!');
  }, []);

  // Save route
  const handleSaveRoute = async () => {
    if (route.length < 2) {
      toast.warning('Run a bit more to save!');
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
    <div className="space-y-6 animate-fade-in">
      {/* Header - Athletic Style */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            GPS <span className="text-gradient">TRACKER</span>
          </h1>
          <p className="text-muted-foreground mt-1 uppercase tracking-wider text-sm">Real-time run tracking</p>
        </div>
        <div className="flex items-center gap-3">
          {isBackgroundSupported && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-muted/50 border border-border">
              <Smartphone className="w-4 h-4 text-accent" />
              <span className="text-xs text-muted-foreground uppercase">BG Mode</span>
            </div>
          )}
          {isTracking && (
            <div className="flex items-center gap-2 px-4 py-2 rounded bg-primary/20 border-2 border-primary animate-pulse">
              <div className="relative">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <div className="absolute inset-0 w-3 h-3 rounded-full bg-primary animate-ping" />
              </div>
              <span className="font-display text-primary text-lg">LIVE</span>
            </div>
          )}
        </div>
      </div>

      {/* GPS Signal Indicator */}
      {gpsAccuracy && (
        <div className="flex items-center gap-2 text-xs">
          <Signal className={`w-4 h-4 ${gpsAccuracy < 20 ? 'text-accent' : gpsAccuracy < 50 ? 'text-primary' : 'text-destructive'}`} />
          <span className="text-muted-foreground uppercase tracking-wider">
            GPS: {gpsAccuracy < 20 ? 'Excellent' : gpsAccuracy < 50 ? 'Good' : 'Weak'} ({Math.round(gpsAccuracy)}m)
          </span>
        </div>
      )}

      {/* Map Container - Dark Athletic Style */}
      <div className="relative rounded-xl overflow-hidden shadow-elevated border-2 border-border">
        <div className="h-[350px] md:h-[450px]">
          <MapContainer
            center={[defaultCenter.lat, defaultCenter.lng]}
            zoom={16}
            className="h-full w-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            
            {/* Route polyline - hot red */}
            {route.length > 1 && (
              <Polyline
                positions={route.map((p): [number, number] => [p.lat, p.lng])}
                pathOptions={{
                  color: '#FF3B30',
                  weight: 6,
                  opacity: 0.9,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
            )}

            {/* Start marker - volt yellow */}
            {route.length > 0 && (
              <Marker
                position={[route[0].lat, route[0].lng]}
                icon={createCustomIcon('#CCFF00')}
              />
            )}

            {/* Current position marker */}
            {currentPosition && (
              <Marker
                position={[currentPosition.lat, currentPosition.lng]}
                icon={createCustomIcon(isTracking ? '#FF3B30' : '#00FFFF', isTracking)}
              />
            )}

            <MapRecenter position={currentPosition} />
          </MapContainer>
        </div>

        {/* Floating Controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
          {!isTracking ? (
            <button
              onClick={startTracking}
              className="flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded font-display text-xl uppercase tracking-wide shadow-elevated hover:bg-primary/90 transition-all glow-red"
            >
              <Play className="w-6 h-6 fill-current" />
              START RUN
            </button>
          ) : (
            <button
              onClick={stopTracking}
              className="flex items-center gap-3 px-8 py-4 bg-card text-foreground rounded font-display text-xl uppercase tracking-wide shadow-elevated border-2 border-primary hover:bg-primary/20 transition-all"
            >
              <Square className="w-6 h-6 fill-current" />
              STOP
            </button>
          )}
          
          {!isTracking && route.length > 1 && (
            <button
              onClick={handleSaveRoute}
              disabled={isSaving}
              className="flex items-center gap-3 px-8 py-4 bg-accent text-accent-foreground rounded font-display text-xl uppercase tracking-wide shadow-elevated hover:bg-accent/90 transition-all glow-volt disabled:opacity-50"
            >
              <Save className="w-6 h-6" />
              {isSaving ? 'SAVING...' : 'SAVE'}
            </button>
          )}
        </div>
      </div>

      {/* Live Stats - Athletic Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="athletic-card bg-card rounded-lg p-4 border-2 border-border">
          <div className="flex flex-col items-center text-center">
            <MapPin className="h-6 w-6 text-primary mb-2" />
            <p className="stat-number text-foreground">
              {distance.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">KM</p>
          </div>
        </div>

        <div className="athletic-card bg-card rounded-lg p-4 border-2 border-border">
          <div className="flex flex-col items-center text-center">
            <Footprints className="h-6 w-6 text-secondary mb-2" />
            <p className="stat-number text-foreground">
              {estimatedSteps.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">STEPS</p>
          </div>
        </div>

        <div className="athletic-card bg-card rounded-lg p-4 border-2 border-border">
          <div className="flex flex-col items-center text-center">
            <Clock className="h-6 w-6 text-accent mb-2" />
            <p className="stat-number text-foreground">
              {formatDuration(duration)}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">TIME</p>
          </div>
        </div>

        <div className="athletic-card bg-card rounded-lg p-4 border-2 border-border">
          <div className="flex flex-col items-center text-center">
            <Zap className="h-6 w-6 text-primary mb-2" />
            <p className="stat-number text-foreground">
              {pace}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">MIN/KM</p>
          </div>
        </div>
      </div>

      {/* Background Mode Info */}
      {isBackgroundSupported && (
        <div className="bg-muted/30 rounded-lg p-4 border border-border">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded bg-accent/20 flex items-center justify-center flex-shrink-0">
              <Smartphone className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="font-display text-lg text-foreground uppercase">Background Tracking</h3>
              <p className="text-sm text-muted-foreground mt-1">
                GPS continues recording when your screen is off. Keep running - we've got you covered.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tracker;
