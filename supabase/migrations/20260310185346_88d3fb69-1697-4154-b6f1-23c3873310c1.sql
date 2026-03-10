
-- Drop all restrictive policies and recreate as permissive

-- books
DROP POLICY IF EXISTS "Public read books" ON public.books;
DROP POLICY IF EXISTS "Auth insert books" ON public.books;
DROP POLICY IF EXISTS "Auth update books" ON public.books;
DROP POLICY IF EXISTS "Auth delete books" ON public.books;

CREATE POLICY "Public read books" ON public.books FOR SELECT USING (true);
CREATE POLICY "Auth insert books" ON public.books FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update books" ON public.books FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete books" ON public.books FOR DELETE TO authenticated USING (true);

-- book_covers
DROP POLICY IF EXISTS "Public read access for book_covers" ON public.book_covers;
DROP POLICY IF EXISTS "Authenticated users can insert book_covers" ON public.book_covers;
DROP POLICY IF EXISTS "Authenticated users can update book_covers" ON public.book_covers;

CREATE POLICY "Public read book_covers" ON public.book_covers FOR SELECT USING (true);
CREATE POLICY "Auth insert book_covers" ON public.book_covers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update book_covers" ON public.book_covers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete book_covers" ON public.book_covers FOR DELETE TO authenticated USING (true);

-- donations
DROP POLICY IF EXISTS "Public read donations" ON public.donations;
DROP POLICY IF EXISTS "Auth insert donations" ON public.donations;
DROP POLICY IF EXISTS "Auth update donations" ON public.donations;
DROP POLICY IF EXISTS "Auth delete donations" ON public.donations;

CREATE POLICY "Public read donations" ON public.donations FOR SELECT USING (true);
CREATE POLICY "Auth insert donations" ON public.donations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update donations" ON public.donations FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete donations" ON public.donations FOR DELETE TO authenticated USING (true);

-- loans
DROP POLICY IF EXISTS "Public read loans" ON public.loans;
DROP POLICY IF EXISTS "Auth insert loans" ON public.loans;
DROP POLICY IF EXISTS "Auth update loans" ON public.loans;
DROP POLICY IF EXISTS "Auth delete loans" ON public.loans;

CREATE POLICY "Public read loans" ON public.loans FOR SELECT USING (true);
CREATE POLICY "Auth insert loans" ON public.loans FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update loans" ON public.loans FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete loans" ON public.loans FOR DELETE TO authenticated USING (true);

-- members
DROP POLICY IF EXISTS "Public read members" ON public.members;
DROP POLICY IF EXISTS "Auth insert members" ON public.members;
DROP POLICY IF EXISTS "Auth update members" ON public.members;
DROP POLICY IF EXISTS "Auth delete members" ON public.members;

CREATE POLICY "Public read members" ON public.members FOR SELECT USING (true);
CREATE POLICY "Auth insert members" ON public.members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update members" ON public.members FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete members" ON public.members FOR DELETE TO authenticated USING (true);
