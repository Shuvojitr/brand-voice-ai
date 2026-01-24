-- Create storage bucket for blog images
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true);

-- Policy: Anyone can view blog images (public bucket)
CREATE POLICY "Blog images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

-- Policy: Admins can upload blog images
CREATE POLICY "Admins can upload blog images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blog-images' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Policy: Admins can update blog images
CREATE POLICY "Admins can update blog images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'blog-images' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Policy: Admins can delete blog images
CREATE POLICY "Admins can delete blog images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'blog-images' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Policy: Managers can also upload blog images
CREATE POLICY "Managers can upload blog images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blog-images' 
  AND public.has_role(auth.uid(), 'manager'::app_role)
);

-- Policy: Managers can update blog images
CREATE POLICY "Managers can update blog images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'blog-images' 
  AND public.has_role(auth.uid(), 'manager'::app_role)
);

-- Policy: Managers can delete blog images
CREATE POLICY "Managers can delete blog images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'blog-images' 
  AND public.has_role(auth.uid(), 'manager'::app_role)
);