import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface LocationData {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

export const useLocationLeaderboard = () => {
  const { user } = useAuth();
  const [isDetecting, setIsDetecting] = useState(false);

  const detectLocation = useCallback(async (): Promise<LocationData | null> => {
    setIsDetecting(true);
    
    try {
      // First try to get GPS coordinates
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation not supported'));
          return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10000,
        });
      });

      const { latitude, longitude } = position.coords;

      // Reverse geocode using free Nominatim API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
        {
          headers: {
            'User-Agent': 'JustRun Fitness App',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to geocode location');
      }

      const data = await response.json();
      const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || 'Unknown';
      const country = data.address?.country || 'Unknown';

      return {
        city,
        country,
        latitude,
        longitude,
      };
    } catch (error) {
      console.error('Error detecting location:', error);
      return null;
    } finally {
      setIsDetecting(false);
    }
  }, []);

  const saveLocationToProfile = useCallback(async (location: LocationData) => {
    if (!user) return;

    try {
      await supabase
        .from('profiles')
        .update({
          city: location.city,
          country: location.country,
          latitude: location.latitude,
          longitude: location.longitude,
        })
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error saving location to profile:', error);
    }
  }, [user]);

  const autoJoinLocationLeaderboard = useCallback(async () => {
    if (!user) return null;

    const location = await detectLocation();
    if (!location) return null;

    // Save location to profile
    await saveLocationToProfile(location);

    // Check if location leaderboard exists or create it
    const locationName = `${location.city}, ${location.country}`;

    // Check existing
    const { data: existing } = await supabase
      .from('leaderboards')
      .select('*')
      .eq('type', 'location')
      .eq('location_name', locationName)
      .maybeSingle();

    let leaderboardId: string;

    if (existing) {
      leaderboardId = existing.id;
    } else {
      // Create new location leaderboard
      const { data: newLeaderboard, error } = await supabase
        .from('leaderboards')
        .insert({
          name: `${locationName} Runners`,
          type: 'location',
          location_name: locationName,
          latitude: location.latitude,
          longitude: location.longitude,
          created_by: user.id,
          is_public: true,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating location leaderboard:', error);
        return null;
      }
      leaderboardId = newLeaderboard.id;
    }

    // Check if already member
    const { data: membership } = await supabase
      .from('leaderboard_members')
      .select('id')
      .eq('leaderboard_id', leaderboardId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!membership) {
      await supabase
        .from('leaderboard_members')
        .insert({
          leaderboard_id: leaderboardId,
          user_id: user.id,
        });
    }

    return locationName;
  }, [user, detectLocation, saveLocationToProfile]);

  return {
    detectLocation,
    autoJoinLocationLeaderboard,
    isDetecting,
  };
};
