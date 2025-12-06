import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import GlowInput from '@/components/ui/GlowInput';
import GlowButton from '@/components/ui/GlowButton';
import StatCard from '@/components/ui/StatCard';
import { 
  User, 
  MapPin, 
  Calendar, 
  Award, 
  Edit3, 
  Save, 
  X,
  Camera,
  TrendingUp,
  Footprints,
  Target
} from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('Running enthusiast | Always chasing new PRs! 🏃‍♂️');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Mock lifetime stats
  const lifetimeStats = {
    totalDistance: 487.5,
    totalJogs: 156,
    totalSteps: 634750,
    joinDate: 'January 2024',
    streak: 12,
    bestPace: '5:24',
  };

  const displayName = user?.email?.split('@')[0] || 'Runner';
  const userInitial = user?.email?.charAt(0).toUpperCase() || 'U';

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // In a real app, call API here
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const achievements = [
    { icon: '🏆', title: 'Century Club', description: 'Ran 100+ km total' },
    { icon: '🔥', title: 'On Fire', description: '7-day streak' },
    { icon: '⚡', title: 'Speed Demon', description: 'Pace under 6 min/km' },
    { icon: '🌅', title: 'Early Bird', description: 'Morning runner' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Profile Header */}
      <div className="bg-card rounded-3xl border border-border/50 shadow-card overflow-hidden">
        {/* Cover gradient */}
        <div className="h-32 md:h-40 gradient-hero relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwdi0ySDEweiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')] opacity-50" />
        </div>

        {/* Profile Info */}
        <div className="px-6 pb-6 -mt-16 relative">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            {/* Avatar */}
            <div className="flex items-end gap-4">
              <div className="relative">
                <div className="h-28 w-28 rounded-2xl bg-card border-4 border-card shadow-elevated flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
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
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  {displayName}
                </h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Member since {lifetimeStats.joinDate}
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
                    onClick={() => setIsEditing(false)}
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
              <p className="text-foreground">{bio}</p>
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
            value={`${lifetimeStats.totalDistance} km`}
            icon={MapPin}
            variant="primary"
          />
          <StatCard
            title="Total Jogs"
            value={lifetimeStats.totalJogs}
            icon={Target}
            variant="secondary"
          />
          <StatCard
            title="Total Steps"
            value={lifetimeStats.totalSteps.toLocaleString()}
            icon={Footprints}
            variant="accent"
          />
          <StatCard
            title="Current Streak"
            value={`${lifetimeStats.streak} days`}
            subtitle="Keep it up!"
            icon={Award}
          />
        </div>
      </div>

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
              className="bg-card rounded-2xl p-5 border border-border/50 shadow-card hover:shadow-elevated hover:scale-[1.02] transition-all duration-300 text-center"
            >
              <div className="text-4xl mb-3">{achievement.icon}</div>
              <h3 className="font-semibold text-foreground">{achievement.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{achievement.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Personal Records */}
      <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-3xl p-6 md:p-8 border border-border/50">
        <h2 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Personal Records
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-3xl font-display font-bold text-gradient">
              {lifetimeStats.bestPace}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Best Pace (min/km)</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-display font-bold text-gradient">21.1</p>
            <p className="text-sm text-muted-foreground mt-1">Longest Run (km)</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-display font-bold text-gradient">28,450</p>
            <p className="text-sm text-muted-foreground mt-1">Most Steps (day)</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-display font-bold text-gradient">15</p>
            <p className="text-sm text-muted-foreground mt-1">Best Streak (days)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
