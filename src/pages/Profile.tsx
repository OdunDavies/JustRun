import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useJogs } from '@/hooks/useJogs';
import { useDailyStats } from '@/hooks/useDailyStats';
import GlowInput from '@/components/ui/GlowInput';
import GlowButton from '@/components/ui/GlowButton';
import StatCard from '@/components/ui/StatCard';
import StreakCalendar from '@/components/StreakCalendar';
import { 
  MapPin, 
  Calendar, 
  Award, 
  Edit3, 
  Save, 
  X,
  Camera,
  TrendingUp,
  Footprints,
  Target,
  Loader2
} from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { profile, isLoading: profileLoading, updateProfile } = useProfile();
  const { totalDistance, totalSteps, totalJogs, isLoading: jogsLoading } = useJogs();
  const { currentStreak, activeDays } = useDailyStats();
  
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form when profile loads
  React.useEffect(() => {
    if (profile) {
      setBio(profile.bio || '');
      setDisplayName(profile.display_name || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  const userInitial = profile?.display_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U';
  const joinDate = profile?.created_at 
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Unknown';

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        display_name: displayName,
        bio,
        avatar_url: avatarUrl || null,
      });
      setIsEditing(false);
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setBio(profile?.bio || '');
    setDisplayName(profile?.display_name || '');
    setAvatarUrl(profile?.avatar_url || '');
    setIsEditing(false);
  };

  const achievements = [
    { icon: '🏆', title: 'Century Club', description: 'Ran 100+ km total', unlocked: totalDistance >= 100 },
    { icon: '🔥', title: 'On Fire', description: '7-day streak', unlocked: currentStreak >= 7 },
    { icon: '🎯', title: 'Committed', description: '10+ runs logged', unlocked: totalJogs >= 10 },
    { icon: '🌟', title: 'Star Runner', description: '50+ km total', unlocked: totalDistance >= 50 },
  ];

  if (profileLoading || jogsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Profile Header */}
      <div className="bg-card rounded-3xl border border-border/30 shadow-card overflow-hidden hover:shadow-elevated transition-shadow duration-300">
        {/* Cover gradient */}
        <div className="h-36 md:h-48 gradient-hero relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwdi0ySDEweiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')] opacity-40" />
        </div>

        {/* Profile Info */}
        <div className="px-6 md:px-8 pb-8 -mt-16 relative">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            {/* Avatar */}
            <div className="flex items-end gap-5">
              <div className="relative">
                <div className="h-32 w-32 rounded-2xl bg-card border-4 border-card shadow-elevated flex items-center justify-center overflow-hidden">
                  {avatarUrl || profile?.avatar_url ? (
                    <img src={avatarUrl || profile?.avatar_url || ''} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full gradient-primary flex items-center justify-center">
                      <span className="font-display text-4xl font-bold text-primary-foreground">
                        {userInitial}
                      </span>
                    </div>
                  )}
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                    <Camera className="h-5 w-5" />
                  </button>
                )}
              </div>
              <div className="pb-2">
                {isEditing ? (
                  <GlowInput
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Display name"
                    className="max-w-[200px]"
                  />
                ) : (
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                    {profile?.display_name || 'Runner'}
                  </h1>
                )}
                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4" />
                  Member since {joinDate}
                </p>
              </div>
            </div>

            {/* Edit Button */}
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <GlowButton
                    variant="outline"
                    size="sm"
                    icon={X}
                    onClick={handleCancel}
                  >
                    Cancel
                  </GlowButton>
                  <GlowButton
                    variant="primary"
                    size="sm"
                    icon={Save}
                    onClick={handleSave}
                    isLoading={isSaving}
                  >
                    Save
                  </GlowButton>
                </>
              ) : (
                <GlowButton
                  variant="outline"
                  size="sm"
                  icon={Edit3}
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </GlowButton>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="mt-6">
            {isEditing ? (
              <div className="space-y-4">
                <GlowInput
                  label="Bio"
                  placeholder="Tell us about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
                <GlowInput
                  label="Avatar URL"
                  placeholder="https://example.com/avatar.jpg"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                />
              </div>
            ) : (
              <p className="text-foreground">{profile?.bio || 'No bio yet. Click edit to add one!'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Lifetime Stats */}
      <div>
        <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Lifetime Statistics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Distance"
            value={`${totalDistance.toFixed(1)} km`}
            icon={MapPin}
            variant="primary"
          />
          <StatCard
            title="Total Jogs"
            value={totalJogs}
            icon={Target}
            variant="secondary"
          />
          <StatCard
            title="Total Steps"
            value={totalSteps.toLocaleString()}
            icon={Footprints}
            variant="accent"
          />
          <StatCard
            title="Current Streak"
            value={`${currentStreak} days`}
            subtitle="Keep it up!"
            icon={Award}
          />
        </div>
      </div>

      {/* Streak Calendar */}
      <StreakCalendar activeDays={activeDays} currentStreak={currentStreak} />

      {/* Achievements */}
      <div>
        <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Award className="h-5 w-5 text-accent" />
          Achievements
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {achievements.map((achievement, index) => (
            <div
              key={index}
              className={`bg-card rounded-2xl p-5 border shadow-card transition-all duration-300 text-center ${
                achievement.unlocked 
                  ? 'border-primary/30 hover:shadow-elevated hover:scale-[1.02]' 
                  : 'border-border/50 opacity-50'
              }`}
            >
              <div className={`text-4xl mb-3 ${achievement.unlocked ? '' : 'grayscale'}`}>
                {achievement.icon}
              </div>
              <h3 className="font-semibold text-foreground">{achievement.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{achievement.description}</p>
              {achievement.unlocked && (
                <span className="inline-block mt-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                  Unlocked!
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
