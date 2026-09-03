-- Le message de soins J+1 est retiré : plus de toggle par tatoueur ni de
-- suivi d'envoi à conserver.

alter table profil drop column soin_actif;
alter table rdv drop column soin_envoye_at;
