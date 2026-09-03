-- Cron horaire qui déclenche la fonction Edge "relances" (rappel J-2 + soins J+1).
-- Cette migration doit être adaptée après le déploiement de la fonction Edge :
-- remplacer <projet> par la référence du projet Supabase, et <service_role>
-- par la clé service_role (à stocker dans Vault plutôt qu'en clair si possible).

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

select cron.schedule(
  'relances-horaires',
  '5 * * * *',
  $$ select net.http_post(
       url     := 'https://<projet>.supabase.co/functions/v1/relances',
       headers := '{"Authorization": "Bearer <service_role>", "Content-Type": "application/json"}'::jsonb
     ) $$
);
