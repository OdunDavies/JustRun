import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  total_distance: number;
}

export const useLeaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [user]);

  const fetchLeaderboard = async () => {
    try {
      // Get all jogs with profiles
      const { data: jogs, error: jogsError } = await supabase
        .from('jogs')
        .select('user_id, distance_km');

      if (jogsError) throw jogsError;

      // Aggregate by user
      const userTotals: Record<string, number> = {};
      (jogs || []).forEach(jog => {
        const userId = jog.user_id;
        const distance = Number(jog.distance_km);
        userTotals[userId] = (userTotals[userId] || 0) + distance;
      });

      // Get profiles for these users
      const userIds = Object.keys(userTotals);
      if (userIds.length === 0) {
        setLeaderboard([]);
        setIsLoading(false);
        return;
      }

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Build leaderboard
      const entries: LeaderboardEntry[] = userIds.map(userId => {
        const profile = profiles?.find(p => p.user_id === userId);
        return {
          rank: 0,
          user_id: userId,
          display_name: profile?.display_name || 'Runner',
          avatar_url: profile?.avatar_url,
          total_distance: userTotals[userId],
        };
      });

      // Sort by distance and assign ranks
      entries.sort((a, b) => b.total_distance - a.total_distance);
      entries.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      setLeaderboard(entries.slice(0, 10));

      // Find user's rank
      if (user) {
        const userEntry = entries.find(e => e.user_id === user.id);
        setUserRank(userEntry?.rank || null);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { leaderboard, isLoading, userRank, refetch: fetchLeaderboard };
};
