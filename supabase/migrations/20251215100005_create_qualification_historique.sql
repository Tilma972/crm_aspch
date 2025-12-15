-- Create qualification_historique table
CREATE TABLE IF NOT EXISTS qualification_historique (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entreprise_id UUID NOT NULL REFERENCES entreprise(id) ON DELETE CASCADE,
  
  -- Année calendrier
  annee_calendrier INTEGER NOT NULL,  -- 2025, 2026, 2027...
  
  -- Données qualification
  format_encart TEXT CHECK (format_encart IN ('6X4', '6X8', '12X4', '12PARUTIONS')),
  mois_parution TEXT,
  montant_paye NUMERIC,
  mode_paiement TEXT CHECK (mode_paiement IN ('Chèque', 'Virement', 'CB', 'Espèces')),
  date_paiement DATE,
  
  -- Statut
  est_paye BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  UNIQUE(entreprise_id, annee_calendrier)  -- Une seule qualification par an
);

-- Enable RLS
ALTER TABLE qualification_historique ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_qualification_historique_entreprise 
  ON qualification_historique(entreprise_id);
CREATE INDEX IF NOT EXISTS idx_qualification_historique_annee 
  ON qualification_historique(annee_calendrier);
CREATE INDEX IF NOT EXISTS idx_qualification_historique_paye 
  ON qualification_historique(est_paye) WHERE est_paye = true;

-- Vue helper : historique complet par entreprise
CREATE OR REPLACE VIEW entreprise_historique_complet AS
SELECT
  e.id,
  e.nom,
  e.email,
  e.telephone,
  e.ville,
  e.adresse,
  e.cp,
  e.baserow_id,
  
  -- Client 2024 (Calendrier 2025)
  MAX(CASE WHEN qh.annee_calendrier = 2025 THEN qh.format_encart END) AS format_2024,
  MAX(CASE WHEN qh.annee_calendrier = 2025 THEN qh.montant_paye END) AS montant_2024,
  BOOL_OR(CASE WHEN qh.annee_calendrier = 2025 THEN qh.est_paye END) AS est_client_2024,
  
  -- Client 2025 (Calendrier 2026)
  MAX(CASE WHEN qh.annee_calendrier = 2026 THEN qh.format_encart END) AS format_2025,
  MAX(CASE WHEN qh.annee_calendrier = 2026 THEN qh.montant_paye END) AS montant_2025,
  BOOL_OR(CASE WHEN qh.annee_calendrier = 2026 THEN qh.est_paye END) AS est_client_2025,
  
  -- Segmentation
  CASE
    WHEN COALESCE(BOOL_OR(CASE WHEN qh.annee_calendrier = 2025 THEN qh.est_paye END), false) 
         AND COALESCE(BOOL_OR(CASE WHEN qh.annee_calendrier = 2026 THEN qh.est_paye END), false) 
      THEN 'fidele'
    WHEN COALESCE(BOOL_OR(CASE WHEN qh.annee_calendrier = 2025 THEN qh.est_paye END), false) 
         AND NOT COALESCE(BOOL_OR(CASE WHEN qh.annee_calendrier = 2026 THEN qh.est_paye END), false) 
      THEN 'churn'
    WHEN NOT COALESCE(BOOL_OR(CASE WHEN qh.annee_calendrier = 2025 THEN qh.est_paye END), false) 
         AND COALESCE(BOOL_OR(CASE WHEN qh.annee_calendrier = 2026 THEN qh.est_paye END), false) 
      THEN 'nouveau'
    ELSE 'prospect'
  END AS segment_client,
  
  -- Stats
  COUNT(DISTINCT qh.annee_calendrier) AS nb_annees_client,
  SUM(qh.montant_paye) AS ca_total_historique
  
FROM entreprise e
LEFT JOIN qualification_historique qh ON qh.entreprise_id = e.id
GROUP BY e.id, e.nom, e.email, e.telephone, e.ville;
