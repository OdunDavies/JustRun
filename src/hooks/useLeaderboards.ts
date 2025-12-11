import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';

interface Leaderboard {
  id: string;
  name: string;
  type: 'location' | 'custom';
  location_name: string | null;
  invite_code: string;
  created_by: string;
  is_public: boolean;
  member_count?: number;
}

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  total_distance: number;
}

export const useLeaderboards = () => {
  const { user } = useAuth();
  const [myLeaderboards, setMyLeaderboards] = useState<Leaderboard[]>([]);
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  const fetchLeaderboards = useCallback(async () => {
    if (!user) return;

    try {
      // Get leaderboards user is member of
      const { data: memberships } = await supabase
        .from('leaderboard_members')
        .select('leaderboard_id')
        .eq('user_id', user.id);

      const leaderboardIds = memberships?.map(m => m.leaderboard_id) || [];

      if (leaderboardIds.length > 0) {
        const { data: leaderboards } = await supabase
          .from('leaderboards')
          .select('*')
          .in('id', leaderboardIds);

        // Get member counts for each leaderboard
        const leaderboardsWithCounts = await Promise.all(
          (leaderboards || []).map(async (lb) => {
            const { count } = await supabase
              .from('leaderboard_members')
              .select('*', { count: 'exact', head: true })
              .eq('leaderboard_id', lb.id);

            return {
              ...lb,
              type: lb.type as 'location' | 'custom',
              member_count: count || 0,
            };
          })
        );

        setMyLeaderboards(leaderboardsWithCounts);
      } else {
        setMyLeaderboards([]);
      }
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
    }
  }, [user]);

  const fetchGlobalLeaderboard = useCallback(async () => {
    try {
      // Get all jogs
      const { data: jogs } = await supabase
        .from('jogs')
        .select('user_id, distance_km');

      // Aggregate by user
      const userTotals: Record<string, number> = {};
      (jogs || []).forEach(jog => {
        const userId = jog.user_id;
        const distance = Number(jog.distance_km);
        userTotals[userId] = (userTotals[userId] || 0) + distance;
      });

      const userIds = Object.keys(userTotals);
      if (userIds.length === 0) {
        setGlobalLeaderboard([]);
        return;
      }

      // Get profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', userIds);

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

      entries.sort((a, b) => b.total_distance - a.total_distance);
      entries.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      setGlobalLeaderboard(entries);

      if (user) {
        const userEntry = entries.find(e => e.user_id === user.id);
        setUserRank(userEntry?.rank || null);
      }
    } catch (error) {
      console.error('Error fetching global leaderboard:', error);
    }
  }, [user]);

  const fetchLeaderboardRankings = async (leaderboardId: string): Promise<LeaderboardEntry[]> => {
    try {
      // Get members of this leaderboard
      const { data: members } = await supabase
        .from('leaderboard_members')
        .select('user_id')
        .eq('leaderboard_id', leaderboardId);

      const memberIds = members?.map(m => m.user_id) || [];
      if (memberIds.length === 0) return [];

      // Get jogs for these members
      const { data: jogs } = await supabase
        .from('jogs')
        .select('user_id, distance_km')
        .in('user_id', memberIds);

      // Aggregate
      const userTotals: Record<string, number> = {};
      memberIds.forEach(id => {
        userTotals[id] = 0;
      });
      (jogs || []).forEach(jog => {
        const userId = jog.user_id;
        userTotals[userId] = (userTotals[userId] || 0) + Number(jog.distance_km);
      });

      // Get profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', memberIds);

      const entries: LeaderboardEntry[] = memberIds.map(userId => {
        const profile = profiles?.find(p => p.user_id === userId);
        return {
          rank: 0,
          user_id: userId,
          display_name: profile?.display_name || 'Runner',
          avatar_url: profile?.avatar_url,
          total_distance: userTotals[userId] || 0,
        };
      });

      entries.sort((a, b) => b.total_distance - a.total_distance);
      entries.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      return entries;
    } catch (error) {
      console.error('Error fetching leaderboard rankings:', error);
      return [];
    }
  };

  const createLeaderboard = async (name: string, isPublic: boolean = true): Promise<Leaderboard | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('leaderboards')
        .insert({
          name,
          type: 'custom',
          created_by: user.id,
          is_public: isPublic,
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-join the creator
      await supabase
        .from('leaderboard_members')
        .insert({
          leaderboard_id: data.id,
          user_id: user.id,
        });

      toast.success('Leaderboard created! Share the invite code with friends.');
      fetchLeaderboards();
      
      return {
        ...data,
        type: data.type as 'location' | 'custom',
      };
    } catch (error) {
      console.error('Error creating leaderboard:', error);
      toast.error('Failed to create leaderboard');
      return null;
    }
  };

  const joinLeaderboardByCode = async (inviteCode: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Find leaderboard by invite code
      const { data: leaderboard, error: findError } = await supabase
        .from('leaderboards')
        .select('*')
        .eq('invite_code', inviteCode.trim().toLowerCase())
        .maybeSingle();

      if (findError) throw findError;
      if (!leaderboard) {
        toast.error('Invalid invite code');
        return false;
      }

      // Check if already a member
      const { data: existing } = await supabase
        .from('leaderboard_members')
        .select('id')
        .eq('leaderboard_id', leaderboard.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        toast.info('You are already a member of this leaderboard');
        return true;
      }

      // Join
      const { error: joinError } = await supabase
        .from('leaderboard_members')
        .insert({
          leaderboard_id: leaderboard.id,
          user_id: user.id,
        });

      if (joinError) throw joinError;

      toast.success(`Joined ${leaderboard.name}!`);
      fetchLeaderboards();
      return true;
    } catch (error) {
      console.error('Error joining leaderboard:', error);
      toast.error('Failed to join leaderboard');
      return false;
    }
  };

  const leaveLeaderboard = async (leaderboardId: string): Promise<void> => {
    if (!user) return;

    try {
      await supabase
        .from('leaderboard_members')
        .delete()
        .eq('leaderboard_id', leaderboardId)
        .eq('user_id', user.id);

      toast.success('Left leaderboard');
      fetchLeaderboards();
    } catch (error) {
      console.error('Error leaving leaderboard:', error);
      toast.error('Failed to leave leaderboard');
    }
  };

  const createLocationLeaderboard = async (
    locationName: string,
    latitude: number,
    longitude: number
  ): Promise<Leaderboard | null> => {
    if (!user) return null;

    try {
      // Check if location leaderboard already exists
      const { data: existing } = await supabase
        .from('leaderboards')
        .select('*')
        .eq('type', 'location')
        .eq('location_name', locationName)
        .maybeSingle();

      if (existing) {
        // Join existing leaderboard
        const { data: membership } = await supabase
          .from('leaderboard_members')
          .select('id')
          .eq('leaderboard_id', existing.id)
          .eq('user_id', user.id)
          .maybeSingle();

        if (!membership) {
          await supabase
            .from('leaderboard_members')
            .insert({
              leaderboard_id: existing.id,
              user_id: user.id,
            });
        }

        fetchLeaderboards();
        return {
          ...existing,
          type: existing.type as 'location' | 'custom',
        };
      }

      // Create new location leaderboard
      const { data, error } = await supabase
        .from('leaderboards')
        .insert({
          name: `${locationName} Runners`,
          type: 'location',
          location_name: locationName,
          latitude,
          longitude,
          created_by: user.id,
          is_public: true,
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-join
      await supabase
        .from('leaderboard_members')
        .insert({
          leaderboard_id: data.id,
          user_id: user.id,
        });

      fetchLeaderboards();
      return {
        ...data,
        type: data.type as 'location' | 'custom',
      };
    } catch (error) {
      console.error('Error creating location leaderboard:', error);
      return null;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchLeaderboards(), fetchGlobalLeaderboard()]);
      setIsLoading(false);
    };
    
    if (user) {
      loadData();
    }
  }, [user, fetchLeaderboards, fetchGlobalLeaderboard]);

  return {
    myLeaderboards,
    globalLeaderboard,
    isLoading,
    userRank,
    createLeaderboard,
    joinLeaderboardByCode,
    leaveLeaderboard,
    createLocationLeaderboard,
    fetchLeaderboardRankings,
    refetch: () => Promise.all([fetchLeaderboards(), fetchGlobalLeaderboard()]),
  };
};
