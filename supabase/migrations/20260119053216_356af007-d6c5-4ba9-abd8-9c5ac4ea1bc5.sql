-- Enable realtime for documents table
ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;

-- Enable realtime for profiles table  
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;