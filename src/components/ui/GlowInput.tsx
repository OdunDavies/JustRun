import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface GlowInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  error?: string;
  label?: string;
}

const GlowInput = forwardRef<HTMLInputElement, GlowInputProps>(
  ({ icon: Icon, error, label, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="relative group">
          {Icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
              <Icon className="h-5 w-5" />
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full rounded-xl border-2 bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground',
              'transition-all duration-300',
              'focus:outline-none focus:ring-0',
              'border-border focus:border-primary focus:shadow-[0_0_20px_hsl(var(--primary)/0.2)]',
              Icon && 'pl-12',
              error && 'border-destructive focus:border-destructive focus:shadow-[0_0_20px_hsl(var(--destructive)/0.2)]',
              className
            )}
            {...props}
          />
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none">
            <div className="absolute inset-0 rounded-xl glow-emerald blur-lg" />
          </div>
        </div>
        {error && (
          <p className="text-sm text-destructive animate-fade-in">{error}</p>
        )}
      </div>
    );
  }
);

GlowInput.displayName = 'GlowInput';

export default GlowInput;
