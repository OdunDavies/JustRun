import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useLeaderboards } from '@/hooks/useLeaderboards';
import { useLocationLeaderboard } from '@/hooks/useLocationLeaderboard';
import { useAuth } from '@/contexts/AuthContext';
import CreateLeaderboardDialog from '@/components/leaderboards/CreateLeaderboardDialog';
import JoinLeaderboardDialog from '@/components/leaderboards/JoinLeaderboardDialog';
import LeaderboardCard from '@/components/leaderboards/LeaderboardCard';
import GlowButton from '@/components/ui/GlowButton';
import { 
  Trophy, 
  Medal, 
  Crown, 
  Target,
  Loader2,
  Globe,
  MapPin,
  Users,
  RefreshCw,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Leaderboards: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const {
    myLeaderboards,
    globalLeaderboard,
    isLoading,
    userRank,
    createLeaderboard,
    joinLeaderboardByCode,
    leaveLeaderboard,
    fetchLeaderboardRankings,
    refetch,
  } = useLeaderboards();
  const { autoJoinLocationLeaderboard, isDetecting } = useLocationLeaderboard();
  const [activeTab, setActiveTab] = useState('global');

  // Handle join via URL
  useEffect(() => {
    const joinCode = searchParams.get('join');
    if (joinCode && user) {
      joinLeaderboardByCode(joinCode).then(() => {
        setSearchParams({});
        setActiveTab('my-boards');
      });
    }
  }, [searchParams, user, joinLeaderboardByCode, setSearchParams]);

  const handleDetectLocation = async () => {
    const location = await autoJoinLocationLeaderboard();
    if (location) {
      refetch();
      setActiveTab('my-boards');
    }
  };

  const locationLeaderboards = myLeaderboards.filter(lb => lb.type === 'location');
  const customLeaderboards = myLeaderboards.filter(lb => lb.type === 'custom');

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/30';
      case 2:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/30';
      case 3:
        return 'bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-amber-600/30';
      default:
        return 'bg-card border-border/50';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-accent" />
            </div>
            Leaderboards
          </h1>
          <p className="text-muted-foreground mt-2">Compete with runners worldwide</p>
        </div>
        {userRank && (
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
            <span className="text-sm text-muted-foreground">Your Global Rank</span>
            <span className="font-display text-2xl font-bold text-gradient">#{userRank}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <CreateLeaderboardDialog onCreateLeaderboard={createLeaderboard} />
        <JoinLeaderboardDialog onJoinLeaderboard={joinLeaderboardByCode} />
        {locationLeaderboards.length === 0 && (
          <GlowButton 
            variant="secondary" 
            icon={MapPin}
            onClick={handleDetectLocation}
            isLoading={isDetecting}
          >
            Join Local Leaderboard
          </GlowButton>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 h-12 p-1 bg-muted/50 rounded-2xl">
          <TabsTrigger value="global" className="flex items-center gap-2 rounded-xl data-[state=active]:shadow-md transition-all">
            <Globe className="h-4 w-4" />
            Global Rankings
          </TabsTrigger>
          <TabsTrigger value="my-boards" className="flex items-center gap-2 rounded-xl data-[state=active]:shadow-md transition-all">
            <Users className="h-4 w-4" />
            My Boards ({myLeaderboards.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="mt-0">
          {/* Global Leaderboard */}
          <div className="bg-card rounded-3xl border border-border/30 shadow-card overflow-hidden hover:shadow-elevated transition-shadow duration-300">
            {/* Top 3 Podium */}
            {globalLeaderboard.length >= 3 && (
              <div className="p-8 md:p-10 gradient-hero">
                <h2 className="font-display text-xl md:text-2xl font-bold text-primary-foreground mb-8 text-center">
                  Top Runners Worldwide
                </h2>
                <div className="flex items-end justify-center gap-4 md:gap-8">
                  {/* 2nd Place */}
                  <div className="flex flex-col items-center">
                    <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-xl md:text-2xl border-4 border-white shadow-lg overflow-hidden">
                      {globalLeaderboard[1].avatar_url ? (
                        <img src={globalLeaderboard[1].avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        globalLeaderboard[1].display_name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="mt-3 text-center">
                      <p className={cn(
                        "font-semibold text-primary-foreground text-sm md:text-base",
                        globalLeaderboard[1].user_id === user?.id && "text-accent"
                      )}>
                        {globalLeaderboard[1].display_name}
                        {globalLeaderboard[1].user_id === user?.id && " (You)"}
                      </p>
                      <p className="text-primary-foreground/80 text-xs md:text-sm">{globalLeaderboard[1].total_distance.toFixed(1)} km</p>
                    </div>
                    <div className="mt-2 h-20 w-20 md:h-24 md:w-24 bg-gray-400/30 rounded-t-xl flex items-center justify-center">
                      <span className="font-display text-2xl md:text-3xl font-bold text-white">2</span>
                    </div>
                  </div>

                  {/* 1st Place */}
                  <div className="flex flex-col items-center -mt-8">
                    <Crown className="h-8 w-8 text-yellow-400 mb-2 animate-bounce-subtle" />
                    <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold text-2xl md:text-3xl border-4 border-white shadow-lg animate-glow overflow-hidden">
                      {globalLeaderboard[0].avatar_url ? (
                        <img src={globalLeaderboard[0].avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        globalLeaderboard[0].display_name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="mt-3 text-center">
                      <p className={cn(
                        "font-semibold text-primary-foreground text-sm md:text-base",
                        globalLeaderboard[0].user_id === user?.id && "text-accent"
                      )}>
                        {globalLeaderboard[0].display_name}
                        {globalLeaderboard[0].user_id === user?.id && " (You)"}
                      </p>
                      <p className="text-primary-foreground/80 text-xs md:text-sm">{globalLeaderboard[0].total_distance.toFixed(1)} km</p>
                    </div>
                    <div className="mt-2 h-28 w-24 md:h-32 md:w-28 bg-yellow-500/30 rounded-t-xl flex items-center justify-center">
                      <span className="font-display text-3xl md:text-4xl font-bold text-white">1</span>
                    </div>
                  </div>

                  {/* 3rd Place */}
                  <div className="flex flex-col items-center">
                    <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold text-xl md:text-2xl border-4 border-white shadow-lg overflow-hidden">
                      {globalLeaderboard[2].avatar_url ? (
                        <img src={globalLeaderboard[2].avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        globalLeaderboard[2].display_name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="mt-3 text-center">
                      <p className={cn(
                        "font-semibold text-primary-foreground text-sm md:text-base",
                        globalLeaderboard[2].user_id === user?.id && "text-accent"
                      )}>
                        {globalLeaderboard[2].display_name}
                        {globalLeaderboard[2].user_id === user?.id && " (You)"}
                      </p>
                      <p className="text-primary-foreground/80 text-xs md:text-sm">{globalLeaderboard[2].total_distance.toFixed(1)} km</p>
                    </div>
                    <div className="mt-2 h-16 w-20 md:h-20 md:w-24 bg-amber-600/30 rounded-t-xl flex items-center justify-center">
                      <span className="font-display text-2xl md:text-3xl font-bold text-white">3</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Rest of leaderboard */}
            {globalLeaderboard.length > 3 && (
              <div className="divide-y divide-border">
                {globalLeaderboard.slice(3, 10).map((entry) => (
                  <div
                    key={entry.user_id}
                    className={cn(
                      'flex items-center gap-4 p-4 md:px-6 transition-all duration-200 hover:bg-muted/50',
                      getRankBg(entry.rank),
                      entry.user_id === user?.id && 'bg-primary/10'
                    )}
                  >
                    <div className="w-8 flex justify-center">
                      {getRankIcon(entry.rank)}
                    </div>
                    <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold overflow-hidden">
                      {entry.avatar_url ? (
                        <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        entry.display_name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={cn(
                        "font-semibold",
                        entry.user_id === user?.id ? 'text-primary' : 'text-foreground'
                      )}>
                        {entry.display_name}
                        {entry.user_id === user?.id && (
                          <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono font-semibold text-foreground">{entry.total_distance.toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground">km</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {globalLeaderboard.length === 0 && (
              <div className="text-center py-16">
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">No runners yet</h3>
                <p className="text-muted-foreground">Be the first to log a run and claim the top spot!</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="my-boards" className="mt-0 space-y-6">
          {/* Location Leaderboards */}
          {locationLeaderboards.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-secondary" />
                Local Leaderboards
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {locationLeaderboards.map((lb) => (
                  <LeaderboardCard
                    key={lb.id}
                    leaderboard={lb}
                    onLeave={leaveLeaderboard}
                    onFetchRankings={fetchLeaderboardRankings}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Custom Leaderboards */}
          {customLeaderboards.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-accent" />
                Custom Leaderboards
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {customLeaderboards.map((lb) => (
                  <LeaderboardCard
                    key={lb.id}
                    leaderboard={lb}
                    onLeave={leaveLeaderboard}
                    onFetchRankings={fetchLeaderboardRankings}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {myLeaderboards.length === 0 && (
            <div className="text-center py-16 bg-card rounded-3xl border border-border/50">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Users className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">No leaderboards yet</h3>
              <p className="text-muted-foreground mb-6">Create your own or join one to compete with friends!</p>
              <div className="flex justify-center gap-3">
                <CreateLeaderboardDialog onCreateLeaderboard={createLeaderboard} />
                <JoinLeaderboardDialog onJoinLeaderboard={joinLeaderboardByCode} />
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Leaderboards;
