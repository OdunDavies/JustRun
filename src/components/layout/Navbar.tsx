import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, 
  MapPin, 
  Trophy, 
  User, 
  LogOut, 
  Menu, 
  X,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/dashboard', label: 'HOME', icon: Home },
    { to: '/tracker', label: 'TRACK', icon: MapPin },
    { to: '/leaderboards', label: 'RANK', icon: Trophy },
    { to: '/profile', label: 'YOU', icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b-2 border-border">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - Athletic Style */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="h-11 w-11 rounded bg-primary flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Zap className="h-6 w-6 text-primary-foreground fill-current" />
              </div>
              <div className="absolute -inset-1 bg-primary/30 rounded blur-md opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
            </div>
            <div className="hidden sm:block">
              <span className="font-display text-2xl text-foreground tracking-tight">JUST</span>
              <span className="font-display text-2xl text-primary tracking-tight">RUN</span>
            </div>
          </Link>

          {/* Desktop Navigation - Athletic Tabs */}
          <div className="hidden md:flex items-center gap-1 bg-card rounded-lg p-1 border border-border">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-2 px-5 py-2 rounded font-display text-sm tracking-wide transition-all duration-200",
                  isActive(to)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-3 px-4 py-2 rounded bg-muted/50 border border-border">
              <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-display text-lg">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="font-medium text-foreground text-sm uppercase tracking-wider">
                {user?.email?.split('@')[0]}
              </span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200 border border-transparent hover:border-primary/30"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded hover:bg-muted transition-colors border border-border"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background border-b-2 border-border animate-slide-up">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {/* User Info */}
            <div className="flex items-center gap-3 px-4 py-3 rounded bg-muted/50 border border-border mb-4">
              <div className="h-12 w-12 rounded bg-primary flex items-center justify-center text-primary-foreground font-display text-2xl">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-display text-lg text-foreground uppercase">{user?.email?.split('@')[0]}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Runner</p>
              </div>
            </div>

            {/* Navigation Links */}
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded font-display text-lg tracking-wide transition-all duration-200",
                  isActive(to)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted border border-border"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            ))}

            {/* Logout */}
            <button
              onClick={() => {
                logout();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded font-display text-lg tracking-wide text-primary hover:bg-primary/10 transition-all duration-200 border border-primary/30"
            >
              <LogOut className="h-5 w-5" />
              <span>LOGOUT</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
