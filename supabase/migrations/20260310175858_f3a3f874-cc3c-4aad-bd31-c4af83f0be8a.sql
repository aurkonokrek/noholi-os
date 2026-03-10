
-- Create storage bucket for book covers
INSERT INTO storage.buckets (id, name, public)
VALUES ('book-covers', 'book-covers', true);

-- Allow anyone to read covers (public bucket)
CREATE POLICY "Public read access for book covers"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'book-covers');

-- Allow authenticated users to upload/update/delete covers
CREATE POLICY "Authenticated users can upload covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'book-covers');

CREATE POLICY "Authenticated users can update covers"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'book-covers');

CREATE POLICY "Authenticated users can delete covers"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'book-covers');

-- Table to persist cover URL mappings (keyed by book ID from Excel)
CREATE TABLE public.book_covers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id TEXT NOT NULL UNIQUE,
  cover_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.book_covers ENABLE ROW LEVEL SECURITY;

-- Anyone can read covers
CREATE POLICY "Public read access for book_covers"
ON public.book_covers FOR SELECT
TO public
USING (true);

-- Authenticated users can manage covers
CREATE POLICY "Authenticated users can insert book_covers"
ON public.book_covers FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update book_covers"
ON public.book_covers FOR UPDATE
TO authenticated
USING (true);
