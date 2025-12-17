-- Add RLS policy to allow viewing basic profile info for users with jogs (for global leaderboard)
CREATE POLICY "Allow viewing profiles for users with jogs"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.jogs WHERE jogs.user_id = profiles.user_id
  )
);