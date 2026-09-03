export type Profil = {
  id: string;
  nom_artiste: string | null;
  email_reponse: string | null;
  tel: string | null;
  instagram: string | null;
  adresse: string | null;
  ics_token: string;
  rappel_delai_h: number;
  soin_actif: boolean;
  signature: string | null;
};

export type Rdv = {
  id: string;
  tatoueur_id: string;
  client_prenom: string;
  client_nom: string | null;
  client_tel: string | null;
  client_email: string | null;
  debut: string;
  duree_min: number;
  projet: string | null;
  emplacement: string | null;
  tarif_estime: number | null;
  acompte_montant: number | null;
  acompte_paye: boolean;
  photo_url: string | null;
  notes: string | null;
  annule: boolean;
  confirm_envoye_at: string | null;
  rappel_envoye_at: string | null;
  soin_envoye_at: string | null;
  cree_le: string;
};

export type Database = {
  public: {
    Tables: {
      profil: {
        Row: Profil;
        Insert: Partial<Profil> & { id: string };
        Update: Partial<Profil>;
        Relationships: [];
      };
      rdv: {
        Row: Rdv;
        Insert: Partial<Rdv> & {
          tatoueur_id: string;
          client_prenom: string;
          debut: string;
        };
        Update: Partial<Rdv>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
