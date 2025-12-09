import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';

interface Jog {
  id: string;
  user_id: string;
  route: { lat: number; lng: number }[];
  distance_km: number;
  duration_seconds: number;
  steps: number;
  created_at: string;
}

export const useJogs = () => {
  const { user } = useAuth();
  const [jogs, setJogs] = useState<Jog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchJogs();
    }
  }, [user]);

  const fetchJogs = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('jogs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Parse route JSON properly
      const parsedJogs = (data || []).map(jog => ({
        ...jog,
        route: typeof jog.route === 'string' ? JSON.parse(jog.route) : jog.route,
        distance_km: Number(jog.distance_km),
      }));

      setJogs(parsedJogs);
    } catch (error) {
      console.error('Error fetching jogs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveJog = async (jogData: {
    route: { lat: number; lng: number }[];
    distance_km: number;
    duration_seconds: number;
    steps: number;
  }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('jogs')
        .insert({
          user_id: user.id,
          route: jogData.route,
          distance_km: jogData.distance_km,
          duration_seconds: jogData.duration_seconds,
          steps: jogData.steps,
        })
        .select()
        .single();

      if (error) throw error;

      // Update daily stats
      await updateDailyStats(jogData.distance_km, jogData.steps);

      toast.success('Run saved successfully! 🎉');
      fetchJogs();
      return data;
    } catch (error) {
      toast.error('Failed to save run');
      throw error;
    }
  };

  const updateDailyStats = async (distance: number, steps: number) => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    try {
      // Check if stats exist for today
      const { data: existing } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (existing) {
        // Update existing
        await supabase
          .from('daily_stats')
          .update({
            distance_km: Number(existing.distance_km) + distance,
            steps: existing.steps + steps,
            jogs_count: existing.jogs_count + 1,
          })
          .eq('id', existing.id);
      } else {
        // Create new
        await supabase
          .from('daily_stats')
          .insert({
            user_id: user.id,
            date: today,
            distance_km: distance,
            steps: steps,
            jogs_count: 1,
          });
      }
    } catch (error) {
      console.error('Error updating daily stats:', error);
    }
  };

  // Calculate totals
  const totalDistance = jogs.reduce((sum, jog) => sum + jog.distance_km, 0);
  const totalSteps = jogs.reduce((sum, jog) => sum + jog.steps, 0);
  const totalJogs = jogs.length;

  return {
    jogs,
    isLoading,
    saveJog,
    refetch: fetchJogs,
    totalDistance,
    totalSteps,
    totalJogs,
  };
};
