-- ══════════════════════════════════════════════════════════════════
--  Oscars Hub — Supabase schema
--  Kör hela detta i Supabase → SQL Editor → New query
-- ══════════════════════════════════════════════════════════════════

-- En enda tabell lagrar all data som JSONB-samlingar per användare.
-- Enkel, snabb och kräver noll migration när nya fält läggs till i appen.

CREATE TABLE IF NOT EXISTS public.hub_data (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid        REFERENCES auth.users NOT NULL,
  collection  text        NOT NULL,
  data        jsonb       NOT NULL DEFAULT '[]'::jsonb,
  updated_at  timestamptz DEFAULT now(),

  CONSTRAINT hub_data_user_collection UNIQUE (user_id, collection)
);

-- ── Row Level Security ─────────────────────────────────────────────
ALTER TABLE public.hub_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Användare ser bara sin egen data"
  ON public.hub_data
  FOR ALL
  USING     (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Auto-uppdatera updated_at ──────────────────────────────────────
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS hub_data_touch ON public.hub_data;
CREATE TRIGGER hub_data_touch
  BEFORE UPDATE ON public.hub_data
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ══════════════════════════════════════════════════════════════════
--  Klart. Gå till Authentication → Users och skapa ditt konto.
-- ══════════════════════════════════════════════════════════════════
