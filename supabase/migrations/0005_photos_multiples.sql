-- Plusieurs photos de référence par RDV (inspirations client), au lieu
-- d'une seule. On migre la valeur existante avant de retirer l'ancienne
-- colonne.

alter table rdv add column photo_urls text[] not null default '{}';

update rdv set photo_urls = array[photo_url] where photo_url is not null;

alter table rdv drop column photo_url;
