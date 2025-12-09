import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DailyStat {
  id: string;
  user_id: string;
  date: string;
  steps: number;
  distance_km: number;
  jogs_count: number;
  created_at: string;
}

export const useDailyStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DailyStat[]>([]);
  const [todayStats, setTodayStats] = useState<DailyStat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      // Fetch last 30 days of stats
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) throw error;

      const parsedStats = (data || []).map(stat => ({
        ...stat,
        distance_km: Number(stat.distance_km),
      }));

      setStats(parsedStats);

      // Get today's stats
      const today = new Date().toISOString().split('T')[0];
      const todayStat = parsedStats.find(s => s.date === today);
      setTodayStats(todayStat || null);

      // Calculate streak
      calculateStreak(parsedStats);
    } catch (error) {
      console.error('Error fetching daily stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStreak = (statsData: DailyStat[]) => {
    if (statsData.length === 0) {
      setCurrentStreak(0);
      return;
    }

    // Sort by date descending
    const sorted = [...statsData].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sorted.length; i++) {
      const statDate = new Date(sorted[i].date);
      statDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - streak);

      // Check if this is the expected date in the streak
      if (statDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else if (streak === 0 && i === 0) {
        // If today doesn't have activity, check if yesterday does
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        if (statDate.getTime() === yesterday.getTime()) {
          streak++;
        } else {
          break;
        }
      } else {
        break;
      }
    }

    setCurrentStreak(streak);
  };

  // Get active days for calendar
  const activeDays = stats.map(s => new Date(s.date));

  // Get weekly data for chart
  const getWeeklyData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const stat = stats.find(s => s.date === dateStr);

      weekData.push({
        day: days[date.getDay()],
        steps: stat?.steps || 0,
        distance: stat?.distance_km || 0,
      });
    }

    return weekData;
  };

  return {
    stats,
    todayStats,
    isLoading,
    currentStreak,
    activeDays,
    weeklyData: getWeeklyData(),
    refetch: fetchStats,
  };
};
