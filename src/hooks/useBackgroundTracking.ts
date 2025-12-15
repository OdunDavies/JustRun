import { useEffect, useRef, useCallback, useState } from 'react';

interface Position {
  lat: number;
  lng: number;
}

interface BackgroundTrackingState {
  isBackgroundSupported: boolean;
  isTrackingInBackground: boolean;
  backgroundRoute: Position[];
  backgroundDistance: number;
  backgroundDuration: number;
}

// Store tracking state in localStorage for persistence across page visibility changes
const STORAGE_KEY = 'justrun_background_tracking';

interface StoredTrackingData {
  isTracking: boolean;
  route: Position[];
  distance: number;
  duration: number;
  startTime: number;
  lastUpdate: number;
}

export function useBackgroundTracking() {
  const [state, setState] = useState<BackgroundTrackingState>({
    isBackgroundSupported: false,
    isTrackingInBackground: false,
    backgroundRoute: [],
    backgroundDistance: 0,
    backgroundDuration: 0,
  });
  
  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check if background tracking is supported
  useEffect(() => {
    const isSupported = 
      'geolocation' in navigator && 
      'serviceWorker' in navigator;
    
    setState(prev => ({ ...prev, isBackgroundSupported: isSupported }));

    // Restore tracking state if page was reloaded while tracking
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data: StoredTrackingData = JSON.parse(stored);
        if (data.isTracking) {
          // Calculate elapsed time since last update
          const elapsedSinceStart = Math.floor((Date.now() - data.startTime) / 1000);
          setState(prev => ({
            ...prev,
            isTrackingInBackground: true,
            backgroundRoute: data.route,
            backgroundDistance: data.distance,
            backgroundDuration: elapsedSinceStart,
          }));
        }
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save state to localStorage
  const saveState = useCallback((route: Position[], distance: number, duration: number, isTracking: boolean) => {
    const data: StoredTrackingData = {
      isTracking,
      route,
      distance,
      duration,
      startTime: Date.now() - (duration * 1000),
      lastUpdate: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, []);

  // Clear saved state
  const clearState = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Handle page visibility change - keep tracking when hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && state.isTrackingInBackground) {
        // Page hidden - tracking continues via watchPosition
        console.log('App moved to background - tracking continues');
        saveState(
          state.backgroundRoute, 
          state.backgroundDistance, 
          state.backgroundDuration, 
          true
        );
      } else if (!document.hidden && state.isTrackingInBackground) {
        // Page visible again - sync state
        console.log('App returned to foreground');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [state.isTrackingInBackground, state.backgroundRoute, state.backgroundDistance, state.backgroundDuration, saveState]);

  // Request notification permission for background alerts
  const requestBackgroundPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  // Get current tracking data
  const getTrackingData = useCallback(() => {
    return {
      route: state.backgroundRoute,
      distance: state.backgroundDistance,
      duration: state.backgroundDuration,
    };
  }, [state.backgroundRoute, state.backgroundDistance, state.backgroundDuration]);

  // Sync external tracking state with background storage
  const syncTrackingState = useCallback((
    isTracking: boolean,
    route: Position[],
    distance: number,
    duration: number
  ) => {
    if (isTracking) {
      saveState(route, distance, duration, true);
      setState(prev => ({
        ...prev,
        isTrackingInBackground: true,
        backgroundRoute: route,
        backgroundDistance: distance,
        backgroundDuration: duration,
      }));
    } else {
      clearState();
      setState(prev => ({
        ...prev,
        isTrackingInBackground: false,
        backgroundRoute: [],
        backgroundDistance: 0,
        backgroundDuration: 0,
      }));
    }
  }, [saveState, clearState]);

  return {
    isBackgroundSupported: state.isBackgroundSupported,
    isTrackingInBackground: state.isTrackingInBackground,
    requestBackgroundPermission,
    getTrackingData,
    syncTrackingState,
  };
}
