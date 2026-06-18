-- Fase 3.2 — Game search
-- Zoekfunctie die op titel én aliassen matcht, accent-ongevoelig
-- ("pokemon" vindt "Pokémon"), dubbele games dedupliceert en op relevantie
-- sorteert (prefix-match eerst, daarna alfabetisch).
--
-- unaccent staat in het `extensions`-schema (Supabase-conventie, niet public).
-- De functie is security invoker (default) en leest enkel publiek-leesbare
-- tabellen (RLS select-policy = true). search_path leeg + alles ge-qualified.

create extension if not exists unaccent with schema extensions;

create or replace function public.search_games(search_query text)
returns setof public.games
language sql
stable
set search_path = ''
as $$
  select g.*
  from public.games g
  where extensions.unaccent(g.title) ilike '%' || extensions.unaccent(search_query) || '%'
     or exists (
       select 1
       from public.game_aliases a
       where a.game_id = g.id
         and extensions.unaccent(a.alias) ilike '%' || extensions.unaccent(search_query) || '%'
     )
  order by
    case
      when extensions.unaccent(g.title) ilike extensions.unaccent(search_query) || '%'
      then 0 else 1
    end,
    g.title asc;
$$;

comment on function public.search_games(text) is
  'Fase 3.2 — zoekt games op titel of alias (accent-ongevoelig), dedupe + relevantie.';
