import React from 'react';
import { cn } from '@/lib/utils';
import { Flame, Check } from 'lucide-react';

interface StreakCalendarProps {
  activeDays: Date[];
  currentStreak: number;
}

const StreakCalendar: React.FC<StreakCalendarProps> = ({ activeDays, currentStreak }) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Get days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Create array of day numbers
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Check if a day is active
  const isActiveDay = (day: number) => {
    return activeDays.some(activeDate => {
      const d = new Date(activeDate);
      return (
        d.getDate() === day &&
        d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear
      );
    });
  };

  const isToday = (day: number) => {
    return day === today.getDate();
  };

  const isFuture = (day: number) => {
    return day > today.getDate();
  };

  const monthName = new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-card rounded-3xl p-6 border border-border/50 shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
            <Flame className="h-5 w-5 text-accent" />
            Activity Streak
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{monthName}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 border border-accent/20">
          <Flame className="h-5 w-5 text-accent" />
          <span className="font-display text-2xl font-bold text-accent">{currentStreak}</span>
          <span className="text-sm text-muted-foreground">day streak</span>
        </div>
      </div>

      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs text-muted-foreground font-medium py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before the 1st */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Day cells */}
        {days.map(day => {
          const active = isActiveDay(day);
          const todayCell = isToday(day);
          const future = isFuture(day);

          return (
            <div
              key={day}
              className={cn(
                'aspect-square rounded-xl flex items-center justify-center relative transition-all duration-200',
                future && 'opacity-40',
                todayCell && !active && 'ring-2 ring-primary ring-offset-2 ring-offset-card',
                active && 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-glow',
                !active && !future && 'bg-muted/50 hover:bg-muted',
              )}
            >
              {active ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className={cn(
                  'text-sm font-medium',
                  future ? 'text-muted-foreground/50' : 'text-muted-foreground'
                )}>
                  {day}
                </span>
              )}
              {todayCell && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-primary to-primary/80" />
          <span className="text-xs text-muted-foreground">Active day</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-muted/50 ring-2 ring-primary ring-offset-1 ring-offset-card" />
          <span className="text-xs text-muted-foreground">Today</span>
        </div>
      </div>
    </div>
  );
};

export default StreakCalendar;
