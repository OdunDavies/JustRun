import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressRingProps {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'accent';
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  className,
  children,
  color = 'primary',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(progress, 100) / 100) * circumference;

  const colorClasses = {
    primary: 'stroke-primary',
    secondary: 'stroke-secondary',
    accent: 'stroke-accent',
  };

  const glowClasses = {
    primary: 'drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]',
    secondary: 'drop-shadow-[0_0_8px_hsl(var(--secondary)/0.5)]',
    accent: 'drop-shadow-[0_0_8px_hsl(var(--accent)/0.5)]',
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="progress-ring"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-muted"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={cn(
            colorClasses[color],
            glowClasses[color],
            'transition-all duration-1000 ease-out'
          )}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default ProgressRing;
