
-- Books table
CREATE TABLE public.books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  title_bangla TEXT NOT NULL DEFAULT '',
  author TEXT NOT NULL,
  author_bangla TEXT NOT NULL DEFAULT '',
  genre TEXT NOT NULL DEFAULT 'Uncategorized',
  category TEXT NOT NULL DEFAULT 'General',
  language TEXT NOT NULL DEFAULT 'Bangla',
  isbn TEXT NOT NULL DEFAULT '',
  publisher TEXT NOT NULL DEFAULT '',
  year_of_publication TEXT NOT NULL DEFAULT '',
  edition TEXT NOT NULL DEFAULT '',
  condition TEXT NOT NULL DEFAULT '',
  pages INTEGER NOT NULL DEFAULT 0,
  price NUMERIC NOT NULL DEFAULT 0,
  total_copies INTEGER NOT NULL DEFAULT 0,
  available_copies INTEGER NOT NULL DEFAULT 0,
  issued_copies INTEGER NOT NULL DEFAULT 0,
  reserved_copies INTEGER NOT NULL DEFAULT 0,
  location TEXT NOT NULL DEFAULT '',
  thumbnail TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read books" ON public.books FOR SELECT TO public USING (true);
CREATE POLICY "Auth insert books" ON public.books FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update books" ON public.books FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete books" ON public.books FOR DELETE TO authenticated USING (true);

-- Members table
CREATE TABLE public.members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  active_loans INTEGER NOT NULL DEFAULT 0,
  fines NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Active',
  avatar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read members" ON public.members FOR SELECT TO public USING (true);
CREATE POLICY "Auth insert members" ON public.members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update members" ON public.members FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete members" ON public.members FOR DELETE TO authenticated USING (true);

-- Loans table
CREATE TABLE public.loans (
  id TEXT PRIMARY KEY,
  member_name TEXT NOT NULL,
  member_id TEXT NOT NULL,
  book_title TEXT NOT NULL,
  accession_id TEXT NOT NULL,
  issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read loans" ON public.loans FOR SELECT TO public USING (true);
CREATE POLICY "Auth insert loans" ON public.loans FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update loans" ON public.loans FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete loans" ON public.loans FOR DELETE TO authenticated USING (true);

-- Donations table
CREATE TABLE public.donations (
  id TEXT PRIMARY KEY,
  donor_name TEXT NOT NULL,
  book_title TEXT NOT NULL,
  condition TEXT NOT NULL DEFAULT 'New',
  date_received DATE NOT NULL DEFAULT CURRENT_DATE,
  review_status TEXT NOT NULL DEFAULT 'Pending',
  assigned_accession_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read donations" ON public.donations FOR SELECT TO public USING (true);
CREATE POLICY "Auth insert donations" ON public.donations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update donations" ON public.donations FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete donations" ON public.donations FOR DELETE TO authenticated USING (true);
