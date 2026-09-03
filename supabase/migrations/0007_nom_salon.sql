-- Le nom du salon (ex. "La Belle Hirondelle") est distinct du nom
-- d'artiste (ex. "Josy") — les emails aux clients doivent citer le
-- salon, pas le tatoueur.

alter table profil add column nom_salon text;
