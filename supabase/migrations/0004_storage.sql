-- Bucket privé pour les photos de référence des RDV.
-- Chaque tatoueur ne peut lire/écrire que dans son propre dossier
-- (préfixe du chemin = son uid), via les policies RLS de storage.objects.

insert into storage.buckets (id, name, public)
values ('photos', 'photos', false)
on conflict (id) do nothing;

create policy "photos lecture perso" on storage.objects
  for select using (
    bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "photos ecriture perso" on storage.objects
  for insert with check (
    bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "photos suppression perso" on storage.objects
  for delete using (
    bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text
  );
