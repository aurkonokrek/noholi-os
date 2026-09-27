CREATE OR REPLACE FUNCTION public.add_donation_to_inventory(_donation_id text)
RETURNS text
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  d public.donations%ROWTYPE;
  next_num integer;
  new_id text;
BEGIN
  SELECT * INTO d FROM public.donations WHERE id = _donation_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Donation % not found', _donation_id; END IF;
  IF d.review_status = 'Added to Inventory' OR coalesce(d.assigned_accession_id, '') <> '' THEN
    RAISE EXCEPTION 'Donation % was already added to Inventory (%)', _donation_id, d.assigned_accession_id;
  END IF;
  IF d.review_status <> 'Approved' THEN
    RAISE EXCEPTION 'Only Approved donations can be added to Inventory (current: %)', d.review_status;
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('books_bk_id'));
  SELECT coalesce(max((substring(id from '^BK-(\d+)$'))::int), 0) + 1 INTO next_num
    FROM public.books WHERE id ~ '^BK-\d+$';
  new_id := 'BK-' || lpad(next_num::text, 4, '0');

  INSERT INTO public.books (id, title, author, condition, total_copies, available_copies, issued_copies, reserved_copies)
  VALUES (new_id, d.book_title, coalesce(d.book_author, ''), d.condition, 1, 1, 0, 0);

  UPDATE public.donations SET review_status = 'Added to Inventory', assigned_accession_id = new_id WHERE id = _donation_id;
  RETURN new_id;
END;
$$;