-- Create media table to track all uploaded files
CREATE TABLE public.media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  url TEXT NOT NULL,
  bucket TEXT NOT NULL DEFAULT 'blog-images',
  mime_type TEXT,
  size_bytes INTEGER,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  uploaded_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- Public read access for all media
CREATE POLICY "Anyone can view media"
  ON public.media
  FOR SELECT
  USING (true);

-- Only admins and managers can insert media
CREATE POLICY "Admins and managers can insert media"
  ON public.media
  FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'manager')
  );

-- Only admins and managers can update media
CREATE POLICY "Admins and managers can update media"
  ON public.media
  FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'manager')
  );

-- Only admins and managers can delete media
CREATE POLICY "Admins and managers can delete media"
  ON public.media
  FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'manager')
  );

-- Create trigger for updated_at
CREATE TRIGGER update_media_updated_at
  BEFORE UPDATE ON public.media
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Create index for faster lookups
CREATE INDEX idx_media_bucket ON public.media(bucket);
CREATE INDEX idx_media_mime_type ON public.media(mime_type);
CREATE INDEX idx_media_created_at ON public.media(created_at DESC);