import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import GlowInput from '@/components/ui/GlowInput';
import GlowButton from '@/components/ui/GlowButton';
import { User, Lock, Zap, ArrowRight } from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors: { username?: string; password?: string } = {};
    if (!username.trim()) newErrors.username = 'Username is required';
    if (!password) newErrors.password = 'Password is required';
    if (password && password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await login(username, password);
      toast.success('Welcome back! Let\'s run! 🏃‍♂️');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md relative z-10">
        <div className="glass rounded-3xl p-8 shadow-elevated animate-scale-in">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <div className="h-20 w-20 rounded-2xl gradient-primary flex items-center justify-center glow-emerald animate-float">
                <Zap className="h-10 w-10 text-primary-foreground" />
              </div>
              <div className="absolute inset-0 rounded-2xl gradient-primary opacity-50 blur-xl" />
            </div>
            <h1 className="font-display text-3xl font-bold text-gradient">JustRun</h1>
            <p className="text-muted-foreground mt-2">Welcome back, runner!</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <GlowInput
              icon={User}
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={errors.username}
              autoComplete="username"
            />
            <GlowInput
              icon={Lock}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              autoComplete="current-password"
            />

            <GlowButton
              type="submit"
              variant="primary"
              size="lg"
              icon={ArrowRight}
              iconPosition="right"
              isLoading={isLoading}
              className="w-full"
            >
              Sign In
            </GlowButton>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              New to JustRun?{' '}
              <Link 
                to="/register" 
                className="text-primary font-semibold hover:underline transition-colors"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>

        {/* Motivational text */}
        <p className="text-center text-muted-foreground mt-6 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          Every step counts. Let's make today count! 💪
        </p>
      </div>
    </div>
  );
};

export default Login;
