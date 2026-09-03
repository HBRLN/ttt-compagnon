-- Compta : dépenses du tatoueur (matériel, loyer, ...) pour calculer un
-- résultat net face aux gains des RDV.

create table depense (
  id          uuid primary key default gen_random_uuid(),
  tatoueur_id uuid not null references auth.users(id) on delete cascade,
  libelle     text not null,
  montant     numeric(10,2) not null,
  date        date not null default current_date,
  cree_le     timestamptz not null default now()
);

create index depense_tatoueur_date_idx on depense (tatoueur_id, date);

alter table depense enable row level security;

create policy "depense perso" on depense
  for all using (auth.uid() = tatoueur_id) with check (auth.uid() = tatoueur_id);
