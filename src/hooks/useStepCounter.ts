import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const STEP_THRESHOLD = 12; // Acceleration threshold to detect a step
const STEP_TIMEOUT = 250; // Minimum time between steps (ms)
const SAVE_INTERVAL = 30000; // Save to database every 30 seconds

export const useStepCounter = () => {
  const { user } = useAuth();
  const [steps, setSteps] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  
  const lastStepTimeRef = useRef(0);
  const stepsToSaveRef = useRef(0);
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load today's steps from localStorage on mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const savedData = localStorage.getItem('dailySteps');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      if (parsed.date === today) {
        setSteps(parsed.steps);
        stepsToSaveRef.current = parsed.steps;
      } else {
        // New day, reset
        localStorage.setItem('dailySteps', JSON.stringify({ date: today, steps: 0 }));
      }
    }
  }, []);

  // Check if DeviceMotion is supported
  useEffect(() => {
    const supported = 'DeviceMotionEvent' in window;
    setIsSupported(supported);
    
    // Check if already tracking from localStorage
    const wasTracking = localStorage.getItem('stepTracking') === 'true';
    if (wasTracking && supported) {
      requestPermission();
    }
  }, []);

  // Save steps to localStorage whenever they change
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('dailySteps', JSON.stringify({ date: today, steps }));
    stepsToSaveRef.current = steps;
  }, [steps]);

  // Save to database periodically
  const saveToDatabase = useCallback(async () => {
    if (!user || stepsToSaveRef.current === 0) return;

    const today = new Date().toISOString().split('T')[0];
    
    try {
      // Check if record exists for today
      const { data: existing } = await supabase
        .from('daily_stats')
        .select('id, steps')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (existing) {
        // Update existing record - add new steps
        await supabase
          .from('daily_stats')
          .update({ steps: stepsToSaveRef.current })
          .eq('id', existing.id);
      } else {
        // Create new record
        await supabase
          .from('daily_stats')
          .insert({
            user_id: user.id,
            date: today,
            steps: stepsToSaveRef.current,
            distance_km: stepsToSaveRef.current * 0.0007, // Rough estimate: 0.7m per step
            jogs_count: 0,
          });
      }
    } catch (error) {
      console.error('Error saving steps:', error);
    }
  }, [user]);

  // Set up periodic save
  useEffect(() => {
    if (isTracking && user) {
      saveIntervalRef.current = setInterval(saveToDatabase, SAVE_INTERVAL);
      return () => {
        if (saveIntervalRef.current) {
          clearInterval(saveIntervalRef.current);
        }
        // Save on cleanup
        saveToDatabase();
      };
    }
  }, [isTracking, user, saveToDatabase]);

  // Handle device motion
  const handleMotion = useCallback((event: DeviceMotionEvent) => {
    const acceleration = event.accelerationIncludingGravity;
    if (!acceleration) return;

    const { x, y, z } = acceleration;
    if (x === null || y === null || z === null) return;

    // Calculate total acceleration magnitude
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    const now = Date.now();

    // Detect step: acceleration spike above threshold with minimum time gap
    if (magnitude > STEP_THRESHOLD && now - lastStepTimeRef.current > STEP_TIMEOUT) {
      lastStepTimeRef.current = now;
      setSteps(prev => prev + 1);
    }
  }, []);

  const requestPermission = async () => {
    try {
      // iOS 13+ requires permission request
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        if (permission === 'granted') {
          setPermissionGranted(true);
          startTracking();
        }
      } else {
        // Non-iOS or older iOS
        setPermissionGranted(true);
        startTracking();
      }
    } catch (error) {
      console.error('Motion permission error:', error);
    }
  };

  const startTracking = useCallback(() => {
    if (!isSupported) return;
    
    window.addEventListener('devicemotion', handleMotion);
    setIsTracking(true);
    localStorage.setItem('stepTracking', 'true');
  }, [isSupported, handleMotion]);

  const stopTracking = useCallback(() => {
    window.removeEventListener('devicemotion', handleMotion);
    setIsTracking(false);
    localStorage.setItem('stepTracking', 'false');
    saveToDatabase();
  }, [handleMotion, saveToDatabase]);

  const toggleTracking = useCallback(() => {
    if (isTracking) {
      stopTracking();
    } else {
      if (permissionGranted) {
        startTracking();
      } else {
        requestPermission();
      }
    }
  }, [isTracking, permissionGranted, startTracking, stopTracking]);

  const resetSteps = useCallback(() => {
    setSteps(0);
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('dailySteps', JSON.stringify({ date: today, steps: 0 }));
  }, []);

  return {
    steps,
    isTracking,
    isSupported,
    permissionGranted,
    toggleTracking,
    resetSteps,
    startTracking: requestPermission,
    stopTracking,
  };
};