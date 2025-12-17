import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useDailyStats } from '@/hooks/useDailyStats';
import { useStepCounter } from '@/hooks/useStepCounter';
import ProgressRing from '@/components/ui/ProgressRing';
import StatCard from '@/components/ui/StatCard';
import StreakCalendar from '@/components/StreakCalendar';
import InlineTracker from '@/components/InlineTracker';
import { 
  Footprints, 
  MapPin, 
  Clock, 
  Flame, 
  TrendingUp, 
  Play,
  Trophy,
  Target,
  ChevronRight,
  Activity,
  Pause,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { todayStats, weeklyData, currentStreak, activeDays, isLoading, refetch } = useDailyStats();
  const { steps: autoSteps, isTracking: isAutoTracking, isSupported: stepCounterSupported, toggleTracking } = useStepCounter();
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);

  const stepGoal = 10000;
  // Combine auto-tracked steps with database steps
  const todaySteps = Math.max(todayStats?.steps || 0, autoSteps);
  const todayDistance = todayStats?.distance_km || (autoSteps * 0.0007);
  const stepProgress = Math.min((todaySteps / stepGoal) * 100, 100);
  const caloriesBurned = Math.round(todaySteps * 0.04);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'MORNING';
    if (hour < 18) return 'AFTERNOON';
    return 'EVENING';
  };

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'RUNNER';

  const handleJogSaved = () => {
    refetch();
    setIsTrackerOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header - Athletic Hero */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/20 via-card to-card p-6 border-2 border-border">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">GOOD {greeting()}</p>
            <h1 className="font-display text-4xl md:text-5xl text-foreground tracking-tight">
              {displayName.toUpperCase()}
            </h1>
            <p className="text-muted-foreground mt-2 uppercase tracking-wider text-sm">Ready to crush it?</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Auto Step Tracking Toggle */}
            {stepCounterSupported && (
              <button
                onClick={toggleTracking}
                className={`flex items-center gap-3 px-6 py-3 rounded font-display text-lg uppercase tracking-wide transition-all ${
                  isAutoTracking 
                    ? 'bg-accent text-accent-foreground glow-volt' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 border border-border'
                }`}
              >
                {isAutoTracking ? (
                  <>
                    <Activity className="w-5 h-5 animate-pulse" />
                    TRACKING
                  </>
                ) : (
                  <>
                    <Pause className="w-5 h-5" />
                    AUTO OFF
                  </>
                )}
              </button>
            )}
            {/* Start Run Button */}
            <button
              onClick={() => setIsTrackerOpen(true)}
              className="flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded font-display text-xl uppercase tracking-wide shadow-lg hover:bg-primary/90 transition-all glow-red group"
            >
              <Play className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" />
              START RUN
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Auto-tracking status */}
      {stepCounterSupported && (
        <div className={`flex items-center gap-3 p-4 rounded-lg border ${
          isAutoTracking 
            ? 'bg-accent/10 border-accent/30' 
            : 'bg-muted/30 border-border'
        }`}>
          <Activity className={`w-5 h-5 ${isAutoTracking ? 'text-accent animate-pulse' : 'text-muted-foreground'}`} />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {isAutoTracking ? 'Auto Step Tracking Active' : 'Auto Step Tracking Off'}
            </p>
            <p className="text-xs text-muted-foreground">
              {isAutoTracking 
                ? 'Steps are being counted automatically in the background' 
                : 'Enable to count steps automatically while you move'}
            </p>
          </div>
          {isAutoTracking && (
            <div className="text-right">
              <p className="font-display text-2xl text-accent">{autoSteps.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground uppercase">auto steps</p>
            </div>
          )}
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Ring Card */}
        <div className="lg:col-span-1 athletic-card bg-card rounded-xl p-6 border-2 border-border">
          <div className="flex flex-col items-center">
            <h2 className="font-display text-xl text-foreground tracking-wide mb-6">TODAY'S PROGRESS</h2>
            <ProgressRing progress={stepProgress} size={200} strokeWidth={12} color="primary">
              <div className="text-center">
                <p className="stat-number text-foreground">
                  {todaySteps.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                  / {stepGoal.toLocaleString()} steps
                </p>
              </div>
            </ProgressRing>
            <div className="mt-6 flex items-center gap-2 px-4 py-2 rounded bg-muted/50 border border-border">
              <Target className="h-4 w-4 text-accent" />
              <span className="text-sm text-muted-foreground uppercase tracking-wider">
                {stepProgress >= 100 ? (
                  <span className="text-accent font-semibold">GOAL ACHIEVED!</span>
                ) : (
                  <><span className="text-foreground font-semibold">{(stepGoal - todaySteps).toLocaleString()}</span> to go</>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <StatCard
            title="STEPS"
            value={todaySteps.toLocaleString()}
            subtitle="Keep moving"
            icon={Footprints}
            variant="primary"
            animate
          />
          <StatCard
            title="DISTANCE"
            value={`${todayDistance.toFixed(2)} km`}
            subtitle="Great progress"
            icon={MapPin}
            variant="secondary"
            animate
          />
          <StatCard
            title="CALORIES"
            value={caloriesBurned}
            subtitle="kcal burned"
            icon={Flame}
            variant="accent"
            animate
          />
          <StatCard
            title="STREAK"
            value={`${currentStreak} days`}
            subtitle="Keep it going"
            icon={Clock}
            animate
          />
        </div>
      </div>

      {/* Streak Calendar */}
      <StreakCalendar activeDays={activeDays} currentStreak={currentStreak} />

      {/* Weekly Chart */}
      <div className="athletic-card bg-card rounded-xl p-6 border-2 border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-2xl text-foreground tracking-wide">WEEKLY ACTIVITY</h2>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Your performance this week</p>
          </div>
          <div className="flex items-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-muted-foreground uppercase tracking-wider">Steps</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-secondary" />
              <span className="text-muted-foreground uppercase tracking-wider">Distance</span>
            </div>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDistance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="day" 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                tickLine={false}
              />
              <YAxis 
                yAxisId="steps"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                yAxisId="distance"
                orientation="right"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '2px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))', fontFamily: 'Bebas Neue', fontSize: '16px' }}
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
        <button onClick={() => setIsTrackerOpen(true)} className="group text-left">
          <div className="athletic-card bg-card rounded-xl p-5 border-2 border-border hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded bg-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                <Play className="h-7 w-7 text-primary-foreground fill-current" />
              </div>
              <div>
                <h3 className="font-display text-xl text-foreground">QUICK RUN</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Start now</p>
              </div>
            </div>
          </div>
        </button>

        <Link to="/leaderboards" className="group">
          <div className="athletic-card bg-card rounded-xl p-5 border-2 border-border hover:border-secondary/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded bg-secondary flex items-center justify-center group-hover:scale-105 transition-transform">
                <Trophy className="h-7 w-7 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="font-display text-xl text-foreground">RANKINGS</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Check position</p>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/profile" className="group">
          <div className="athletic-card bg-card rounded-xl p-5 border-2 border-border hover:border-accent/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded bg-accent flex items-center justify-center group-hover:scale-105 transition-transform">
                <TrendingUp className="h-7 w-7 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-display text-xl text-foreground">YOUR STATS</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">View progress</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Inline Tracker Modal */}
      <InlineTracker 
        isOpen={isTrackerOpen} 
        onClose={() => setIsTrackerOpen(false)}
        onJogSaved={handleJogSaved}
      />
    </div>
  );
};

export default Dashboard;
