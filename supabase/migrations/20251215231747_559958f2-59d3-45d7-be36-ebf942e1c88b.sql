-- Fix #1: Profiles - restrict to viewing own profile or limited info for others
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create a security definer function to safely check leaderboard membership
CREATE OR REPLACE FUNCTION public.is_leaderboard_member(_user_id uuid, _leaderboard_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.leaderboard_members
    WHERE user_id = _user_id
      AND leaderboard_id = _leaderboard_id
  )
$$;

-- Create a function to check if leaderboard is public
CREATE OR REPLACE FUNCTION public.is_public_leaderboard(_leaderboard_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.leaderboards
    WHERE id = _leaderboard_id
      AND is_public = true
  )
$$;

-- Users can view their own full profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Users can view limited profile info of others (for leaderboards display)
-- This allows viewing display_name and avatar_url but the RLS policy itself
-- can't filter columns, so we'll allow all authenticated users to see profiles
-- of users they share a leaderboard with
CREATE POLICY "Users can view profiles of leaderboard members"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.leaderboard_members lm1
    INNER JOIN public.leaderboard_members lm2 ON lm1.leaderboard_id = lm2.leaderboard_id
    WHERE lm1.user_id = auth.uid()
    AND lm2.user_id = profiles.user_id
  )
);

-- Fix #2: Leaderboard members - restrict visibility to public leaderboards or member's own leaderboards
DROP POLICY IF EXISTS "Anyone can view leaderboard members" ON public.leaderboard_members;

CREATE POLICY "View members of public leaderboards or own leaderboards"
ON public.leaderboard_members
FOR SELECT
USING (
  public.is_public_leaderboard(leaderboard_id)
  OR public.is_leaderboard_member(auth.uid(), leaderboard_id)
);

-- Fix #3: Leaderboards - hide invite_code from non-creators using a view approach
-- We can't hide specific columns via RLS, but we can ensure private leaderboards
-- are only visible to creators (which is already the case)
-- The current policy is fine, but let's add a function to safely get invite codes

CREATE OR REPLACE FUNCTION public.get_leaderboard_invite_code(_leaderboard_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT invite_code
  FROM public.leaderboards
  WHERE id = _leaderboard_id
    AND created_by = auth.uid()
$$;