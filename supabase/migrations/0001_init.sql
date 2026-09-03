-- Compagnon tatoueur — schéma initial
-- Deux tables : profil (réglages du tatoueur) et rdv (les rendez-vous).

create table profil (
  id             uuid primary key references auth.users(id) on delete cascade,
  nom_artiste    text,
  email_reponse  text,          -- email affiché en "répondre à"
  tel            text,
  instagram      text,
  adresse        text,          -- affichée dans les emails de rappel
  ics_token      uuid not null default gen_random_uuid(),
  rappel_delai_h int  not null default 48,
  soin_actif     boolean not null default true,
  signature      text
);

create table rdv (
  id              uuid primary key default gen_random_uuid(),
  tatoueur_id     uuid not null references auth.users(id) on delete cascade,
  client_prenom   text not null,
  client_nom      text,
  client_tel      text,
  client_email    text,
  debut           timestamptz not null,
  duree_min       int  not null default 120,
  projet          text,          -- la courte description
  emplacement     text,          -- avant-bras gauche, dos, ...
  tarif_estime    numeric(10,2),
  acompte_montant numeric(10,2),
  acompte_paye    boolean not null default false,
  photo_url       text,          -- référence, Supabase Storage
  notes           text,
  annule          boolean not null default false,
  confirm_envoye_at timestamptz,
  rappel_envoye_at  timestamptz,
  soin_envoye_at    timestamptz,
  cree_le         timestamptz not null default now()
);

create index rdv_tatoueur_debut_idx on rdv (tatoueur_id, debut);
create index rdv_relances_idx on rdv (debut) where annule = false;
create index rdv_tel_idx on rdv (tatoueur_id, client_tel);

-- RLS — activée dès le départ

alter table profil enable row level security;
alter table rdv    enable row level security;

create policy "profil perso" on profil
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "rdv perso" on rdv
  for all using (auth.uid() = tatoueur_id) with check (auth.uid() = tatoueur_id);

-- Un profil est créé automatiquement à la création du compte auth,
-- pour ne jamais avoir à gérer sa création côté application.

create function public.gerer_nouvel_utilisateur()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profil (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.gerer_nouvel_utilisateur();
