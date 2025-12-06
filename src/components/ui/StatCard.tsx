import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'primary' | 'secondary' | 'accent';
  className?: string;
  animate?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  className,
  animate = false,
}) => {
  const variantStyles = {
    default: 'bg-card shadow-card border border-border/50',
    primary: 'gradient-primary text-primary-foreground glow-emerald',
    secondary: 'bg-secondary text-secondary-foreground glow-blue',
    accent: 'bg-accent text-accent-foreground glow-orange',
  };

  const iconBgStyles = {
    default: 'bg-primary/10 text-primary',
    primary: 'bg-primary-foreground/20 text-primary-foreground',
    secondary: 'bg-secondary-foreground/20 text-secondary-foreground',
    accent: 'bg-accent-foreground/20 text-accent-foreground',
  };

  return (
    <div
      className={cn(
        'rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-elevated',
        variantStyles[variant],
        animate && 'animate-fade-in',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className={cn(
            'text-sm font-medium',
            variant === 'default' ? 'text-muted-foreground' : 'opacity-80'
          )}>
            {title}
          </p>
          <p className="text-3xl font-display font-bold tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className={cn(
              'text-sm',
              variant === 'default' ? 'text-muted-foreground' : 'opacity-70'
            )}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={cn(
          'h-12 w-12 rounded-xl flex items-center justify-center',
          iconBgStyles[variant]
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
