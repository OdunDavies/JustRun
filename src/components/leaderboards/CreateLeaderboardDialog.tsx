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
import { Switch } from '@/components/ui/switch';
import GlowButton from '@/components/ui/GlowButton';
import { Plus, Trophy } from 'lucide-react';

interface CreateLeaderboardDialogProps {
  onCreateLeaderboard: (name: string, isPublic: boolean) => Promise<any>;
}

const CreateLeaderboardDialog: React.FC<CreateLeaderboardDialogProps> = ({
  onCreateLeaderboard,
}) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsCreating(true);
    const result = await onCreateLeaderboard(name.trim(), isPublic);
    setIsCreating(false);

    if (result) {
      setOpen(false);
      setName('');
      setIsPublic(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <GlowButton variant="primary" icon={Plus}>
          Create Leaderboard
        </GlowButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-accent" />
            Create New Leaderboard
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Leaderboard Name</Label>
            <Input
              id="name"
              placeholder="e.g., Weekend Warriors, Office Running Club"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="public">Public Leaderboard</Label>
              <p className="text-xs text-muted-foreground">
                Anyone with the invite code can join
              </p>
            </div>
            <Switch
              id="public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>
          <GlowButton
            type="submit"
            variant="accent"
            className="w-full"
            isLoading={isCreating}
          >
            Create Leaderboard
          </GlowButton>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateLeaderboardDialog;
