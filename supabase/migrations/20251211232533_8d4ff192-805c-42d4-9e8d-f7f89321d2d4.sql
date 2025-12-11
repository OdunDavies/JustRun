-- Create leaderboard type enum
CREATE TYPE public.leaderboard_type AS ENUM ('location', 'custom');

-- Create leaderboards table
CREATE TABLE public.leaderboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type leaderboard_type NOT NULL DEFAULT 'custom',
  location_name TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  invite_code TEXT NOT NULL UNIQUE DEFAULT SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8),
  created_by UUID NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leaderboard members table
CREATE TABLE public.leaderboard_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  leaderboard_id UUID NOT NULL REFERENCES public.leaderboards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(leaderboard_id, user_id)
);

-- Enable RLS
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_members ENABLE ROW LEVEL SECURITY;

-- Leaderboards policies
CREATE POLICY "Anyone can view public leaderboards"
ON public.leaderboards FOR SELECT
USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Authenticated users can create leaderboards"
ON public.leaderboards FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update their leaderboards"
ON public.leaderboards FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Creators can delete their leaderboards"
ON public.leaderboards FOR DELETE
USING (auth.uid() = created_by);

-- Leaderboard members policies
CREATE POLICY "Anyone can view leaderboard members"
ON public.leaderboard_members FOR SELECT
USING (true);

CREATE POLICY "Users can join leaderboards"
ON public.leaderboard_members FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave leaderboards"
ON public.leaderboard_members FOR DELETE
USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_leaderboards_updated_at
BEFORE UPDATE ON public.leaderboards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add location columns to profiles for auto-join
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS latitude NUMERIC,
ADD COLUMN IF NOT EXISTS longitude NUMERIC;