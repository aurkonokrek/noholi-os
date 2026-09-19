ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS merit_grade text NOT NULL DEFAULT 'Not Assigned',
  ADD COLUMN IF NOT EXISTS merit_note text NOT NULL DEFAULT '';