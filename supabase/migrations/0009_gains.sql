-- Compta : gains manuels (vente, pourboire, ...) en plus de ceux calculés
-- depuis les RDV. Même forme que depense, table séparée.

create table gain (
  id          uuid primary key default gen_random_uuid(),
  tatoueur_id uuid not null references auth.users(id) on delete cascade,
  libelle     text not null,
  montant     numeric(10,2) not null,
  date        date not null default current_date,
  cree_le     timestamptz not null default now()
);

create index gain_tatoueur_date_idx on gain (tatoueur_id, date);

alter table gain enable row level security;

create policy "gain perso" on gain
  for all using (auth.uid() = tatoueur_id) with check (auth.uid() = tatoueur_id);
