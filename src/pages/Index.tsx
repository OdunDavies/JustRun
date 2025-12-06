import React from 'react';
import { Link } from 'react-router-dom';
import GlowButton from '@/components/ui/GlowButton';
import { 
  Zap, 
  MapPin, 
  Trophy, 
  Users, 
  ArrowRight, 
  Play,
  Target,
  TrendingUp,
  Footprints
} from 'lucide-react';

const Index: React.FC = () => {
  const features = [
    {
      icon: MapPin,
      title: 'GPS Tracking',
      description: 'Real-time route tracking with beautiful map visualization',
      color: 'primary',
    },
    {
      icon: Target,
      title: 'Set Goals',
      description: 'Daily step goals and progress tracking to keep you motivated',
      color: 'secondary',
    },
    {
      icon: Trophy,
      title: 'Leaderboards',
      description: 'Compete globally or create private groups with friends',
      color: 'accent',
    },
    {
      icon: TrendingUp,
      title: 'Analytics',
      description: 'Beautiful charts showing your progress over time',
      color: 'primary',
    },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-pulse-slow" />
          <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
          
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8 animate-fade-in">
            <div className="relative">
              <div className="h-24 w-24 rounded-3xl gradient-hero flex items-center justify-center shadow-elevated animate-float">
                <Zap className="h-12 w-12 text-primary-foreground" />
              </div>
              <div className="absolute inset-0 rounded-3xl gradient-hero opacity-50 blur-2xl animate-glow" />
            </div>
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-foreground mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <span className="text-gradient">JustRun</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Track your runs, crush your goals, and compete with runners worldwide. 
            Your journey to fitness starts here.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Link to="/register">
              <GlowButton variant="primary" size="xl" icon={Play}>
                Get Started Free
              </GlowButton>
            </Link>
            <Link to="/login">
              <GlowButton variant="outline" size="xl" icon={ArrowRight} iconPosition="right">
                Sign In
              </GlowButton>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="text-center">
              <p className="font-display text-3xl md:text-4xl font-bold text-gradient">50K+</p>
              <p className="text-sm text-muted-foreground">Runners</p>
            </div>
            <div className="text-center">
              <p className="font-display text-3xl md:text-4xl font-bold text-gradient">2M+</p>
              <p className="text-sm text-muted-foreground">KM Tracked</p>
            </div>
            <div className="text-center">
              <p className="font-display text-3xl md:text-4xl font-bold text-gradient">100+</p>
              <p className="text-sm text-muted-foreground">Countries</p>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-subtle">
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1.5">
            <div className="w-1.5 h-3 rounded-full bg-muted-foreground/50 animate-[bounce_1.5s_infinite]" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Everything you need to <span className="text-gradient">run better</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to help you track, improve, and enjoy your running journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-card rounded-3xl p-8 border border-border/50 shadow-card hover:shadow-elevated hover:scale-[1.02] transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-6 ${
                  feature.color === 'primary' ? 'gradient-primary' : 
                  feature.color === 'secondary' ? 'bg-secondary' : 'bg-accent'
                } group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-90" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwdi0ySDEweiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')] opacity-30" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <Footprints className="h-16 w-16 text-primary-foreground/80 mx-auto mb-6 animate-bounce-subtle" />
          <h2 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            Ready to start running?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
            Join thousands of runners who are already crushing their goals with JustRun. 
            It's free to get started!
          </p>
          <Link to="/register">
            <GlowButton 
              variant="accent" 
              size="xl" 
              icon={ArrowRight} 
              iconPosition="right"
              className="shadow-xl"
            >
              Start Your Journey
            </GlowButton>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground">JustRun</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 JustRun. Every step counts.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
