import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Polyline, useMap, Marker } from 'react-leaflet';
import L from 'leaflet';
import { toast } from 'react-toastify';
import { useJogs } from '@/hooks/useJogs';
import { useBackgroundTracking } from '@/hooks/useBackgroundTracking';
import { Play, Square, Save, MapPin, Footprints, Clock, Zap, X, Signal } from 'lucide-react';
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

const MapRecenter: React.FC<{ position: Position | null }> = ({ position }) => {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.setView([position.lat, position.lng], map.getZoom());
    }
  }, [position, map]);

  return null;
};

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

interface InlineTrackerProps {
  isOpen: boolean;
  onClose: () => void;
  onJogSaved?: () => void;
}

const InlineTracker: React.FC<InlineTrackerProps> = ({ isOpen, onClose, onJogSaved }) => {
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

  const estimatedSteps = Math.round(distance * 1300);
  const pace = distance > 0 ? ((duration / 60) / distance).toFixed(2) : '0.00';
  
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    syncTrackingState(isTracking, route, distance, duration);
  }, [isTracking, route, distance, duration, syncTrackingState]);

  // Get initial position when opened
  useEffect(() => {
    if (isOpen && navigator.geolocation) {
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
  }, [isOpen]);

  const startTracking = useCallback(async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported');
      return;
    }

    await requestBackgroundPermission();

    setIsTracking(true);
    setRoute([]);
    setDistance(0);
    setDuration(0);

    timerRef.current = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const accuracy = pos.coords.accuracy;
        setGpsAccuracy(accuracy);
        
        if (accuracy > 50) return;

        const newPosition = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        setCurrentPosition(newPosition);
        setRoute((prevRoute) => {
          if (prevRoute.length === 0) return [newPosition];
          
          const lastPos = prevRoute[prevRoute.length - 1];
          const segmentDistance = calculateDistance(lastPos, newPosition);
          
          if (segmentDistance < 0.005 || segmentDistance > 0.1) return prevRoute;
          
          setDistance((prev) => prev + segmentDistance);
          return [...prevRoute, newPosition];
        });
      },
      (error) => {
        console.error('Tracking error:', error);
        toast.error('GPS error - check permissions');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 1000 }
    );

    toast.success('RUN STARTED!');
  }, [requestBackgroundPermission]);

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
      onJogSaved?.();
      toast.success('Run saved!');
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (isTracking) {
      stopTracking();
    }
    onClose();
  };

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

  if (!isOpen) return null;

  const defaultCenter: Position = currentPosition || { lat: 40.7128, lng: -74.006 };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm animate-fade-in">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-2xl text-foreground">
              {isTracking ? 'TRACKING' : 'RUN TRACKER'}
            </h2>
            {isTracking && (
              <div className="flex items-center gap-2 px-3 py-1 rounded bg-primary/20 border border-primary animate-pulse">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-sm text-primary font-display">LIVE</span>
              </div>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded hover:bg-muted transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* GPS Signal */}
        {gpsAccuracy && (
          <div className="flex items-center gap-2 px-4 py-2 text-xs border-b border-border">
            <Signal className={`w-4 h-4 ${gpsAccuracy < 20 ? 'text-accent' : gpsAccuracy < 50 ? 'text-primary' : 'text-destructive'}`} />
            <span className="text-muted-foreground uppercase tracking-wider">
              GPS: {gpsAccuracy < 20 ? 'Excellent' : gpsAccuracy < 50 ? 'Good' : 'Weak'} ({Math.round(gpsAccuracy)}m)
            </span>
          </div>
        )}

        {/* Map */}
        <div className="flex-1 relative">
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

            {route.length > 0 && (
              <Marker
                position={[route[0].lat, route[0].lng]}
                icon={createCustomIcon('#CCFF00')}
              />
            )}

            {currentPosition && (
              <Marker
                position={[currentPosition.lat, currentPosition.lng]}
                icon={createCustomIcon(isTracking ? '#FF3B30' : '#00FFFF', isTracking)}
              />
            )}

            <MapRecenter position={currentPosition} />
          </MapContainer>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 p-4 bg-card border-t border-border">
          <div className="text-center">
            <MapPin className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="font-display text-2xl text-foreground">{distance.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground uppercase">KM</p>
          </div>
          <div className="text-center">
            <Footprints className="h-5 w-5 text-secondary mx-auto mb-1" />
            <p className="font-display text-2xl text-foreground">{estimatedSteps.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground uppercase">STEPS</p>
          </div>
          <div className="text-center">
            <Clock className="h-5 w-5 text-accent mx-auto mb-1" />
            <p className="font-display text-2xl text-foreground">{formatDuration(duration)}</p>
            <p className="text-xs text-muted-foreground uppercase">TIME</p>
          </div>
          <div className="text-center">
            <Zap className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="font-display text-2xl text-foreground">{pace}</p>
            <p className="text-xs text-muted-foreground uppercase">MIN/KM</p>
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 bg-card border-t border-border flex items-center justify-center gap-4">
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
    </div>
  );
};

export default InlineTracker;