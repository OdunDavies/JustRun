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
    default: 'bg-card border-2 border-border',
    primary: 'bg-primary/10 border-2 border-primary/30',
    secondary: 'bg-secondary/10 border-2 border-secondary/30',
    accent: 'bg-accent/10 border-2 border-accent/30',
  };

  const iconStyles = {
    default: 'text-foreground',
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
  };

  return (
    <div
      className={cn(
        'athletic-card rounded-xl p-5 transition-all duration-200',
        variantStyles[variant],
        animate && 'animate-fade-in',
        className
      )}
    >
      <div className="flex flex-col items-center text-center">
        <Icon className={cn('h-6 w-6 mb-2', iconStyles[variant])} />
        <p className="stat-number text-foreground">
          {value}
        </p>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
          {title}
        </p>
        {subtitle && (
          <p className="text-xs text-muted-foreground/70 mt-1">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
