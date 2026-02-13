-- Allow anyone to read basic profile info for blog author display
CREATE POLICY "Anyone can read profiles for blog authors"
ON public.profiles
FOR SELECT
USING (
  id IN (SELECT author_user_id FROM public.blog_posts WHERE author_user_id IS NOT NULL)
);