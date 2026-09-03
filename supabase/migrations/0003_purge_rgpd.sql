-- Purge RGPD : les rendez-vous de plus de 3 ans n'ont plus de raison d'être
-- conservés. Cron mensuel, premier jour du mois à 3h du matin.

create extension if not exists pg_cron with schema extensions;

create or replace function public.purger_vieux_rdv()
returns void
language sql
security definer set search_path = public
as $$
  delete from rdv where debut < now() - interval '3 years';
$$;

select cron.schedule(
  'purge-rdv-mensuelle',
  '0 3 1 * *',
  $$ select public.purger_vieux_rdv() $$
);
