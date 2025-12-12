import React, { useState, useEffect } from 'react';
import { Smartphone, Share, Plus, Check, X } from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';

interface AddToHomeScreenNoticeProps {
  onAcknowledge: () => void;
}

const AddToHomeScreenNotice: React.FC<AddToHomeScreenNoticeProps> = ({ onAcknowledge }) => {
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));
    
    // Check if already installed as PWA
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                       (window.navigator as any).standalone === true;
    setIsStandalone(standalone);
  }, []);

  const steps = isIOS ? [
    { icon: Share, text: 'Tap the Share button in Safari' },
    { icon: Plus, text: 'Scroll down and tap "Add to Home Screen"' },
    { icon: Check, text: 'Tap "Add" to confirm' },
  ] : isAndroid ? [
    { icon: Smartphone, text: 'Tap the menu (⋮) in Chrome' },
    { icon: Plus, text: 'Tap "Add to Home Screen" or "Install App"' },
    { icon: Check, text: 'Tap "Add" to confirm' },
  ] : [
    { icon: Smartphone, text: 'Open this page on your mobile device' },
    { icon: Share, text: 'Use your browser\'s "Add to Home Screen" option' },
    { icon: Check, text: 'Enjoy the full app experience!' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <div className="w-full max-w-md animate-scale-in">
        <div className="glass rounded-3xl p-6 shadow-elevated border border-primary/20">
          {/* Header */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-4">
              <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center glow-primary animate-float">
                <Smartphone className="h-8 w-8 text-primary-foreground" />
              </div>
              <div className="absolute inset-0 rounded-2xl gradient-primary opacity-40 blur-xl" />
            </div>
            <h2 className="font-display text-2xl font-bold text-gradient text-center">
              Get the Full Experience
            </h2>
            <p className="text-muted-foreground mt-2 text-center text-sm">
              Add JustRun to your home screen for the best mobile experience
            </p>
          </div>

          {/* Benefits */}
          <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
            <h3 className="font-semibold text-foreground mb-3 text-sm">Why add to home screen?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Launch instantly like a native app</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Full-screen experience without browser UI</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Faster loading and offline support</span>
              </li>
            </ul>
          </div>

          {/* Instructions */}
          {!isStandalone && (
            <div className="mb-6">
              <h3 className="font-semibold text-foreground mb-3 text-sm">
                {isIOS ? 'On iPhone/iPad:' : isAndroid ? 'On Android:' : 'How to install:'}
              </h3>
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <step.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">{step.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isStandalone && (
            <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 text-primary">
                <Check className="h-5 w-5" />
                <span className="font-semibold">Already installed!</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                You're using JustRun as an app. Great choice!
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <GlowButton
              variant="primary"
              size="lg"
              className="w-full"
              onClick={onAcknowledge}
            >
              {isStandalone ? 'Continue to Sign Up' : 'I\'ll Add It Later, Continue'}
            </GlowButton>
            
            {!isStandalone && (
              <p className="text-xs text-muted-foreground text-center">
                You can always add it later from your browser menu
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddToHomeScreenNotice;
