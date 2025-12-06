import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  children: React.ReactNode;
}

const GlowButton: React.FC<GlowButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  isLoading = false,
  children,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group';

  const variantStyles = {
    primary: 'gradient-primary text-primary-foreground hover:shadow-lg glow-emerald hover:scale-105',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 hover:shadow-lg glow-blue hover:scale-105',
    accent: 'bg-accent text-accent-foreground hover:bg-accent/90 hover:shadow-lg glow-orange hover:scale-105',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm gap-1.5',
    md: 'px-6 py-3 text-base gap-2',
    lg: 'px-8 py-4 text-lg gap-2.5',
    xl: 'px-10 py-5 text-xl gap-3',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-7 w-7',
  };

  return (
    <button
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-shimmer bg-[length:200%_100%] opacity-0 group-hover:opacity-100 group-hover:animate-shimmer" />
      
      {/* Content */}
      <span className="relative flex items-center gap-2">
        {isLoading ? (
          <div className={cn('animate-spin rounded-full border-2 border-current border-t-transparent', iconSizes[size])} />
        ) : (
          <>
            {Icon && iconPosition === 'left' && <Icon className={iconSizes[size]} />}
            {children}
            {Icon && iconPosition === 'right' && <Icon className={iconSizes[size]} />}
          </>
        )}
      </span>
    </button>
  );
};

export default GlowButton;
