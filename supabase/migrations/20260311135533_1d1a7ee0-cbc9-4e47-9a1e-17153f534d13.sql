
ALTER TABLE public.loans
  ADD COLUMN IF NOT EXISTS return_date date,
  ADD COLUMN IF NOT EXISTS guarantor_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS guarantor_phone text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS guarantor_email text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS guarantor_relationship text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS guarantor_street text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS guarantor_city text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS guarantor_district text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS guarantor_postal_code text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS fine_amount numeric NOT NULL DEFAULT 0;
