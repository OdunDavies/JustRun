import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useDailyStats } from '@/hooks/useDailyStats';
import ProgressRing from '@/components/ui/ProgressRing';
import StatCard from '@/components/ui/StatCard';
import GlowButton from '@/components/ui/GlowButton';
import StreakCalendar from '@/components/StreakCalendar';
import { 
  Footprints, 
  MapPin, 
  Clock, 
  Flame, 
  TrendingUp, 
  Play,
  Trophy,
  Target,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { todayStats, weeklyData, currentStreak, activeDays, isLoading } = useDailyStats();

  const stepGoal = 10000;
  const todaySteps = todayStats?.steps || 0;
  const todayDistance = todayStats?.distance_km || 0;
  const stepProgress = Math.min((todaySteps / stepGoal) * 100, 100);
  const caloriesBurned = Math.round(todaySteps * 0.04);
  const avgPace = todayDistance > 0 ? (45 / todayDistance).toFixed(1) : '0';

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Runner';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            {greeting()}, <span className="text-gradient">{displayName}</span>!
          </h1>
          <p className="text-muted-foreground mt-1">Ready to crush your goals today?</p>
        </div>
        <Link to="/tracker">
          <GlowButton variant="primary" size="lg" icon={Play}>
            Start Jogging
          </GlowButton>
        </Link>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Ring Card */}
        <div className="lg:col-span-1 bg-card rounded-3xl p-8 shadow-card border border-border/50">
          <div className="flex flex-col items-center">
            <h2 className="text-lg font-semibold text-foreground mb-6">Today's Progress</h2>
            <ProgressRing progress={stepProgress} size={200} strokeWidth={12} color="primary">
              <div className="text-center">
                <p className="font-display text-4xl font-bold text-foreground">
                  {todaySteps.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">of {stepGoal.toLocaleString()}</p>
              </div>
            </ProgressRing>
            <div className="mt-6 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">
                {stepProgress >= 100 ? (
                  <span className="text-primary font-semibold">Goal achieved! 🎉</span>
                ) : (
                  <>Only <strong className="text-foreground">{(stepGoal - todaySteps).toLocaleString()}</strong> steps to go!</>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <StatCard
            title="Steps Today"
            value={todaySteps.toLocaleString()}
            subtitle="Keep moving!"
            icon={Footprints}
            variant="primary"
            animate
          />
          <StatCard
            title="Distance"
            value={`${todayDistance.toFixed(2)} km`}
            subtitle="Great progress!"
            icon={MapPin}
            variant="secondary"
            animate
          />
          <StatCard
            title="Calories Burned"
            value={caloriesBurned}
            subtitle="kcal burned"
            icon={Flame}
            variant="accent"
            animate
          />
          <StatCard
            title="Current Streak"
            value={`${currentStreak} days`}
            subtitle="Keep it going!"
            icon={Clock}
            animate
          />
        </div>
      </div>

      {/* Streak Calendar */}
      <StreakCalendar activeDays={activeDays} currentStreak={currentStreak} />

      {/* Weekly Chart */}
      <div className="bg-card rounded-3xl p-6 md:p-8 shadow-card border border-border/50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">Weekly Activity</h2>
            <p className="text-sm text-muted-foreground">Your performance this week</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-muted-foreground">Steps</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-secondary" />
              <span className="text-muted-foreground">Distance</span>
            </div>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDistance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="day" 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                yAxisId="steps"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                yAxisId="distance"
                orientation="right"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Area
                yAxisId="steps"
                type="monotone"
                dataKey="steps"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorSteps)"
              />
              <Area
                yAxisId="distance"
                type="monotone"
                dataKey="distance"
                stroke="hsl(var(--secondary))"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorDistance)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/tracker" className="group">
          <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-card hover:shadow-elevated hover:border-primary/30 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Quick Run</h3>
                <p className="text-sm text-muted-foreground">Start tracking now</p>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/leaderboards" className="group">
          <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-card hover:shadow-elevated hover:border-secondary/30 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                <Trophy className="h-7 w-7 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Leaderboards</h3>
                <p className="text-sm text-muted-foreground">See your ranking</p>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/profile" className="group">
          <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-card hover:shadow-elevated hover:border-accent/30 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="h-7 w-7 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Your Stats</h3>
                <p className="text-sm text-muted-foreground">View your progress</p>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
