BEGIN;

CREATE TABLE IF NOT EXISTS public.books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    -- NUMERIC without a scale preserves fractions so CHECK rejects them instead of rounding.
    pages NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'To Read',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Apply the same requirements even if this project already has a books table.
-- Existing invalid rows cause the transaction to fail instead of being silently removed.
ALTER TABLE public.books
    ALTER COLUMN user_id SET NOT NULL,
    ALTER COLUMN title SET NOT NULL,
    ALTER COLUMN author SET NOT NULL,
    ALTER COLUMN pages TYPE NUMERIC USING pages::numeric,
    ALTER COLUMN pages SET NOT NULL,
    ALTER COLUMN status SET NOT NULL,
    ALTER COLUMN status SET DEFAULT 'To Read',
    ALTER COLUMN created_at SET NOT NULL,
    ALTER COLUMN created_at SET DEFAULT NOW();

ALTER TABLE public.books DROP CONSTRAINT IF EXISTS books_title_valid;
ALTER TABLE public.books ADD CONSTRAINT books_title_valid
    CHECK (title ~ '[^[:space:]]' AND char_length(title) <= 80);
ALTER TABLE public.books DROP CONSTRAINT IF EXISTS books_author_valid;
ALTER TABLE public.books ADD CONSTRAINT books_author_valid
    CHECK (author ~ '[^[:space:]]' AND char_length(author) <= 60);
ALTER TABLE public.books DROP CONSTRAINT IF EXISTS books_pages_valid;
ALTER TABLE public.books ADD CONSTRAINT books_pages_valid
    CHECK (pages BETWEEN 1 AND 5000 AND pages = trunc(pages));
ALTER TABLE public.books DROP CONSTRAINT IF EXISTS books_status_valid;
ALTER TABLE public.books ADD CONSTRAINT books_status_valid
    CHECK (status IN ('To Read', 'Reading', 'Finished'));
ALTER TABLE public.books DROP CONSTRAINT IF EXISTS books_owner_valid;
ALTER TABLE public.books ADD CONSTRAINT books_owner_valid
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS books_user_created_idx
    ON public.books (user_id, created_at DESC, id DESC);

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE public.books FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES (id, user_id, title, author, pages, status, created_at)
    ON TABLE public.books FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, DELETE ON TABLE public.books TO authenticated;
GRANT UPDATE (status) ON TABLE public.books TO authenticated;

-- Remove previous policies on this table so permissive old policies cannot bypass ownership.
DO $$
DECLARE existing_policy RECORD;
BEGIN
    FOR existing_policy IN
        SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'books'
    LOOP
        EXECUTE format('DROP POLICY %I ON public.books', existing_policy.policyname);
    END LOOP;
END $$;

CREATE POLICY "Users can view own books" ON public.books
    FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own books" ON public.books
    FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own book status" ON public.books
    FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own books" ON public.books
    FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

COMMIT;
