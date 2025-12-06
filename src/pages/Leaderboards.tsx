import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import GlowButton from '@/components/ui/GlowButton';
import GlowInput from '@/components/ui/GlowInput';
import { 
  Trophy, 
  Medal, 
  Users, 
  Plus, 
  Crown, 
  Star,
  Target,
  X,
  ChevronRight
} from 'lucide-react';

// Mock data
const globalLeaderboard = [
  { rank: 1, username: 'SpeedDemon', totalDistance: 1245.8, avatar: 'S' },
  { rank: 2, username: 'RunnerQueen', totalDistance: 1189.3, avatar: 'R' },
  { rank: 3, username: 'MarathonMike', totalDistance: 1056.2, avatar: 'M' },
  { rank: 4, username: 'JoggerJane', totalDistance: 987.5, avatar: 'J' },
  { rank: 5, username: 'PaceKing', totalDistance: 923.1, avatar: 'P' },
  { rank: 6, username: 'StrideStrong', totalDistance: 876.4, avatar: 'S' },
  { rank: 7, username: 'TrailBlazer', totalDistance: 812.9, avatar: 'T' },
  { rank: 8, username: 'EnduranceElite', totalDistance: 756.3, avatar: 'E' },
  { rank: 9, username: 'DashMaster', totalDistance: 698.7, avatar: 'D' },
  { rank: 10, username: 'RunForFun', totalDistance: 645.2, avatar: 'R' },
];

const myGroups = [
  { 
    id: '1', 
    name: 'Morning Runners Club', 
    members: 8,
    ranked: [
      { rank: 1, username: 'You', totalDistance: 156.8 },
      { rank: 2, username: 'FastFred', totalDistance: 142.3 },
      { rank: 3, username: 'JillJogs', totalDistance: 128.9 },
    ]
  },
  { 
    id: '2', 
    name: 'Office Challenge', 
    members: 12,
    ranked: [
      { rank: 1, username: 'BossRunner', totalDistance: 234.5 },
      { rank: 2, username: 'You', totalDistance: 198.2 },
      { rank: 3, username: 'TeamLead', totalDistance: 176.4 },
    ]
  },
];

const Leaderboards: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'global' | 'groups'>('global');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

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

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      // In a real app, call API here
      setShowCreateModal(false);
      setNewGroupName('');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
            <Trophy className="h-8 w-8 text-accent" />
            Leaderboards
          </h1>
          <p className="text-muted-foreground mt-1">Compete with runners worldwide</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-muted rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('global')}
          className={cn(
            'px-6 py-3 rounded-lg font-semibold transition-all duration-200',
            activeTab === 'global'
              ? 'bg-card text-foreground shadow-md'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <span className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Global
          </span>
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={cn(
            'px-6 py-3 rounded-lg font-semibold transition-all duration-200',
            activeTab === 'groups'
              ? 'bg-card text-foreground shadow-md'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            My Groups
          </span>
        </button>
      </div>

      {/* Global Leaderboard */}
      {activeTab === 'global' && (
        <div className="bg-card rounded-3xl border border-border/50 shadow-card overflow-hidden">
          {/* Top 3 Podium */}
          <div className="p-6 md:p-8 gradient-hero">
            <h2 className="font-display text-xl font-bold text-primary-foreground mb-6 text-center">
              Top Runners This Month
            </h2>
            <div className="flex items-end justify-center gap-4 md:gap-8">
              {/* 2nd Place */}
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-xl md:text-2xl border-4 border-white shadow-lg">
                  {globalLeaderboard[1].avatar}
                </div>
                <div className="mt-3 text-center">
                  <p className="font-semibold text-primary-foreground text-sm md:text-base">{globalLeaderboard[1].username}</p>
                  <p className="text-primary-foreground/80 text-xs md:text-sm">{globalLeaderboard[1].totalDistance} km</p>
                </div>
                <div className="mt-2 h-20 w-20 md:h-24 md:w-24 bg-gray-400/30 rounded-t-xl flex items-center justify-center">
                  <span className="font-display text-2xl md:text-3xl font-bold text-white">2</span>
                </div>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center -mt-8">
                <Crown className="h-8 w-8 text-yellow-400 mb-2 animate-bounce-subtle" />
                <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold text-2xl md:text-3xl border-4 border-white shadow-lg animate-glow">
                  {globalLeaderboard[0].avatar}
                </div>
                <div className="mt-3 text-center">
                  <p className="font-semibold text-primary-foreground text-sm md:text-base">{globalLeaderboard[0].username}</p>
                  <p className="text-primary-foreground/80 text-xs md:text-sm">{globalLeaderboard[0].totalDistance} km</p>
                </div>
                <div className="mt-2 h-28 w-24 md:h-32 md:w-28 bg-yellow-500/30 rounded-t-xl flex items-center justify-center">
                  <span className="font-display text-3xl md:text-4xl font-bold text-white">1</span>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold text-xl md:text-2xl border-4 border-white shadow-lg">
                  {globalLeaderboard[2].avatar}
                </div>
                <div className="mt-3 text-center">
                  <p className="font-semibold text-primary-foreground text-sm md:text-base">{globalLeaderboard[2].username}</p>
                  <p className="text-primary-foreground/80 text-xs md:text-sm">{globalLeaderboard[2].totalDistance} km</p>
                </div>
                <div className="mt-2 h-16 w-20 md:h-20 md:w-24 bg-amber-600/30 rounded-t-xl flex items-center justify-center">
                  <span className="font-display text-2xl md:text-3xl font-bold text-white">3</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rest of leaderboard */}
          <div className="divide-y divide-border">
            {globalLeaderboard.slice(3).map((user, index) => (
              <div
                key={user.rank}
                className={cn(
                  'flex items-center gap-4 p-4 md:px-6 transition-all duration-200 hover:bg-muted/50',
                  getRankBg(user.rank)
                )}
              >
                <div className="w-8 flex justify-center">
                  {getRankIcon(user.rank)}
                </div>
                <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                  {user.avatar}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{user.username}</p>
                  <p className="text-sm text-muted-foreground">{user.totalDistance} km total</p>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono font-semibold text-foreground">{user.totalDistance}</span>
                  <span className="text-sm text-muted-foreground">km</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Groups */}
      {activeTab === 'groups' && (
        <div className="space-y-6">
          {/* Create Group Button */}
          <GlowButton
            variant="primary"
            icon={Plus}
            onClick={() => setShowCreateModal(true)}
          >
            Create New Group
          </GlowButton>

          {/* Groups List */}
          <div className="grid gap-4">
            {myGroups.map((group) => (
              <div
                key={group.id}
                className="bg-card rounded-2xl border border-border/50 shadow-card overflow-hidden"
              >
                <button
                  onClick={() => setSelectedGroup(selectedGroup === group.id ? null : group.id)}
                  className="w-full p-5 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
                      <Users className="h-6 w-6 text-secondary-foreground" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-foreground">{group.name}</h3>
                      <p className="text-sm text-muted-foreground">{group.members} members</p>
                    </div>
                  </div>
                  <ChevronRight className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform",
                    selectedGroup === group.id && "rotate-90"
                  )} />
                </button>

                {selectedGroup === group.id && (
                  <div className="border-t border-border divide-y divide-border animate-fade-in">
                    {group.ranked.map((member) => (
                      <div
                        key={member.rank}
                        className={cn(
                          'flex items-center gap-4 p-4',
                          getRankBg(member.rank)
                        )}
                      >
                        <div className="w-8 flex justify-center">
                          {getRankIcon(member.rank)}
                        </div>
                        <div className="flex-1">
                          <p className={cn(
                            "font-semibold",
                            member.username === 'You' ? 'text-primary' : 'text-foreground'
                          )}>
                            {member.username}
                            {member.username === 'You' && (
                              <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                                You
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="font-mono font-semibold text-foreground">
                          {member.totalDistance} km
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Empty State */}
          {myGroups.length === 0 && (
            <div className="text-center py-16">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Users className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">No groups yet</h3>
              <p className="text-muted-foreground mb-6">Create a group to compete with friends!</p>
              <GlowButton
                variant="primary"
                icon={Plus}
                onClick={() => setShowCreateModal(true)}
              >
                Create Your First Group
              </GlowButton>
            </div>
          )}
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-card rounded-3xl p-6 md:p-8 w-full max-w-md shadow-elevated border border-border animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-foreground">Create New Group</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <GlowInput
                label="Group Name"
                placeholder="e.g., Morning Runners"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />

              <p className="text-sm text-muted-foreground">
                After creating your group, you can invite members by sharing the group link.
              </p>

              <div className="flex gap-3 pt-4">
                <GlowButton
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1"
                >
                  Cancel
                </GlowButton>
                <GlowButton
                  variant="primary"
                  onClick={handleCreateGroup}
                  className="flex-1"
                  disabled={!newGroupName.trim()}
                >
                  Create Group
                </GlowButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboards;
