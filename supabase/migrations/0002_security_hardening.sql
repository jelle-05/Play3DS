-- ============================================================================
-- Play3DS — security hardening (Fase 2)
-- Adresseert Supabase database-linter waarschuwingen op 0001.
-- ============================================================================

-- 1) Pin een vaste search_path op de updated_at-trigger (lint 0011).
alter function public.set_updated_at() set search_path = '';

-- 2) handle_new_user() is uitsluitend een trigger op auth.users en hoeft nooit
--    via de REST-RPC aanroepbaar te zijn — trek EXECUTE in voor de API-rollen
--    (de trigger blijft gewoon werken). (lint 0028/0029)
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Opmerking: public.is_admin() blijft uitvoerbaar voor anon/authenticated. Dat is
-- vereist: de functie wordt binnen RLS-policies aangeroepen en moet daar door de
-- query-rol uitvoerbaar zijn. Ze is SECURITY DEFINER om RLS-recursie op profiles te
-- voorkomen en geeft enkel een boolean terug of de huidige gebruiker admin is.
