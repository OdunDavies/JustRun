import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import GlowButton from '@/components/ui/GlowButton';
import {
  Trophy,
  MapPin,
  Users,
  Copy,
  Share2,
  Crown,
  Medal,
  LogOut,
  ChevronRight,
} from 'lucide-react';

interface Leaderboard {
  id: string;
  name: string;
  type: 'location' | 'custom';
  location_name: string | null;
  invite_code: string;
  created_by: string;
  member_count?: number;
}

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  total_distance: number;
}

interface LeaderboardCardProps {
  leaderboard: Leaderboard;
  onLeave: (id: string) => Promise<void>;
  onFetchRankings: (id: string) => Promise<LeaderboardEntry[]>;
}

const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  leaderboard,
  onLeave,
  onFetchRankings,
}) => {
  const { user } = useAuth();
  const [showDetails, setShowDetails] = useState(false);
  const [rankings, setRankings] = useState<LeaderboardEntry[]>([]);
  const [isLoadingRankings, setIsLoadingRankings] = useState(false);

  const isCreator = leaderboard.created_by === user?.id;

  const copyInviteCode = () => {
    navigator.clipboard.writeText(leaderboard.invite_code);
    toast.success('Invite code copied to clipboard!');
  };

  const shareInviteLink = async () => {
    const shareUrl = `${window.location.origin}/leaderboards?join=${leaderboard.invite_code}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${leaderboard.name}`,
          text: `Join my running leaderboard on JustRun!`,
          url: shareUrl,
        });
      } catch {
        navigator.clipboard.writeText(shareUrl);
        toast.success('Share link copied to clipboard!');
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
    }
  };

  const handleViewDetails = async () => {
    setShowDetails(true);
    setIsLoadingRankings(true);
    const data = await onFetchRankings(leaderboard.id);
    setRankings(data);
    setIsLoadingRankings(false);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 2:
        return <Medal className="h-4 w-4 text-gray-400" />;
      case 3:
        return <Medal className="h-4 w-4 text-amber-600" />;
      default:
        return <span className="text-xs font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  return (
    <>
      <div
        className={cn(
          'bg-card rounded-2xl border border-border/50 p-5 shadow-card transition-all duration-200 hover:shadow-elevated cursor-pointer',
          leaderboard.type === 'location' && 'border-l-4 border-l-secondary'
        )}
        onClick={handleViewDetails}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div
              className={cn(
                'h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0',
                leaderboard.type === 'location' ? 'bg-secondary' : 'gradient-primary'
              )}
            >
              {leaderboard.type === 'location' ? (
                <MapPin className="h-6 w-6 text-secondary-foreground" />
              ) : (
                <Trophy className="h-6 w-6 text-primary-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{leaderboard.name}</h3>
              {leaderboard.location_name && (
                <p className="text-sm text-muted-foreground">{leaderboard.location_name}</p>
              )}
              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  {leaderboard.member_count || 0} members
                </span>
                {isCreator && (
                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                    Creator
                  </span>
                )}
              </div>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        </div>
      </div>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {leaderboard.type === 'location' ? (
                <MapPin className="h-5 w-5 text-secondary" />
              ) : (
                <Trophy className="h-5 w-5 text-accent" />
              )}
              {leaderboard.name}
            </DialogTitle>
          </DialogHeader>

          {/* Invite Actions */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={copyInviteCode}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-muted rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors"
            >
              <Copy className="h-4 w-4" />
              <span className="font-mono">{leaderboard.invite_code.toUpperCase()}</span>
            </button>
            <button
              onClick={shareInviteLink}
              className="px-4 py-3 gradient-primary rounded-xl text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          {/* Rankings */}
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">Rankings</h4>
            {isLoadingRankings ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : rankings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No runs recorded yet. Start running to climb the ranks!
              </div>
            ) : (
              <div className="space-y-2">
                {rankings.map((entry) => (
                  <div
                    key={entry.user_id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl bg-muted/50',
                      entry.user_id === user?.id && 'bg-primary/10 border border-primary/20'
                    )}
                  >
                    <div className="w-6 flex justify-center">{getRankIcon(entry.rank)}</div>
                    <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-semibold overflow-hidden">
                      {entry.avatar_url ? (
                        <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        entry.display_name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={cn(
                        'text-sm font-medium',
                        entry.user_id === user?.id && 'text-primary'
                      )}>
                        {entry.display_name}
                        {entry.user_id === user?.id && ' (You)'}
                      </p>
                    </div>
                    <div className="text-sm font-mono font-semibold">
                      {entry.total_distance.toFixed(1)} km
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Leave Button */}
          {!isCreator && (
            <div className="pt-4 border-t border-border">
              <button
                onClick={() => {
                  onLeave(leaderboard.id);
                  setShowDetails(false);
                }}
                className="flex items-center gap-2 text-sm text-destructive hover:underline"
              >
                <LogOut className="h-4 w-4" />
                Leave Leaderboard
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LeaderboardCard;
