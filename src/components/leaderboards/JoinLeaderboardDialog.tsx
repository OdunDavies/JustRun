import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GlowButton from '@/components/ui/GlowButton';
import { UserPlus, Link } from 'lucide-react';

interface JoinLeaderboardDialogProps {
  onJoinLeaderboard: (inviteCode: string) => Promise<boolean>;
}

const JoinLeaderboardDialog: React.FC<JoinLeaderboardDialogProps> = ({
  onJoinLeaderboard,
}) => {
  const [open, setOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setIsJoining(true);
    const success = await onJoinLeaderboard(inviteCode.trim());
    setIsJoining(false);

    if (success) {
      setOpen(false);
      setInviteCode('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <GlowButton variant="secondary" icon={UserPlus}>
          Join with Code
        </GlowButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="h-5 w-5 text-primary" />
            Join Leaderboard
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Invite Code</Label>
            <Input
              id="code"
              placeholder="Enter 8-character invite code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toLowerCase())}
              maxLength={8}
              className="font-mono text-center text-lg tracking-widest uppercase"
            />
            <p className="text-xs text-muted-foreground">
              Ask the leaderboard creator for their invite code
            </p>
          </div>
          <GlowButton
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isJoining}
          >
            Join Leaderboard
          </GlowButton>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JoinLeaderboardDialog;
