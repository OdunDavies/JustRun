import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import GlowInput from '@/components/ui/GlowInput';
import GlowButton from '@/components/ui/GlowButton';
import { User, Lock, Zap, ArrowRight, CheckCircle } from 'lucide-react';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string; confirmPassword?: string }>({});
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors: { username?: string; password?: string; confirmPassword?: string } = {};
    if (!username.trim()) newErrors.username = 'Username is required';
    if (username && username.length < 3) newErrors.username = 'Username must be at least 3 characters';
    if (!password) newErrors.password = 'Password is required';
    if (password && password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await register(username, password);
      toast.success('Account created! Welcome to JustRun! 🎉');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    'Track your daily runs with GPS',
    'Compete on global leaderboards',
    'Set and achieve fitness goals',
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Register Card */}
      <div className="w-full max-w-md relative z-10">
        <div className="glass rounded-3xl p-8 shadow-elevated animate-scale-in">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <div className="h-20 w-20 rounded-2xl gradient-energy flex items-center justify-center glow-orange animate-float">
                <Zap className="h-10 w-10 text-accent-foreground" />
              </div>
              <div className="absolute inset-0 rounded-2xl gradient-energy opacity-50 blur-xl" />
            </div>
            <h1 className="font-display text-3xl font-bold text-gradient">Join JustRun</h1>
            <p className="text-muted-foreground mt-2">Start your running journey today</p>
          </div>

          {/* Benefits */}
          <div className="mb-6 space-y-2">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <GlowInput
              icon={User}
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={errors.username}
              autoComplete="username"
            />
            <GlowInput
              icon={Lock}
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              autoComplete="new-password"
            />
            <GlowInput
              icon={Lock}
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              autoComplete="new-password"
            />

            <GlowButton
              type="submit"
              variant="accent"
              size="lg"
              icon={ArrowRight}
              iconPosition="right"
              isLoading={isLoading}
              className="w-full"
            >
              Create Account
            </GlowButton>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-primary font-semibold hover:underline transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Motivational text */}
        <p className="text-center text-muted-foreground mt-6 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          Join thousands of runners crushing their goals! 🏆
        </p>
      </div>
    </div>
  );
};

export default Register;
