-- Add initial_word_count column to track permanently generated words
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS initial_word_count INTEGER DEFAULT 0;

-- Backfill existing documents with their current word_count as initial_word_count
UPDATE public.documents SET initial_word_count = COALESCE(word_count, 0) WHERE initial_word_count IS NULL OR initial_word_count = 0;