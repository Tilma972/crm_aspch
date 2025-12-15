-- ═════════════════════════════════════════════════════════
-- PHASE 3 : Table qualification_mois
-- ═════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS qualification_mois (
  -- Identifiants
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qualification_id UUID NOT NULL REFERENCES qualification(id) ON DELETE CASCADE,
  
  -- Données publication
  mois TEXT NOT NULL CHECK (mois IN (
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  )),
  format TEXT CHECK (format IN ('6X4', '6X8', '12X4')),
  prix NUMERIC DEFAULT 0,
  est_offert BOOLEAN DEFAULT false,
  ordre INTEGER NOT NULL,  -- Position dans la séquence (1, 2, 3...)
  
  -- Suivi visuel client
  visuel_recu BOOLEAN DEFAULT false,
  visuel_url TEXT,
  date_reception_visuel DATE,
  date_relance_visuel DATE,
  nombre_relances INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  UNIQUE(qualification_id, mois)  -- Un seul mois par qualification
);

-- Index
CREATE INDEX IF NOT EXISTS idx_qualification_mois_qualification ON qualification_mois(qualification_id);
CREATE INDEX IF NOT EXISTS idx_qualification_mois_mois ON qualification_mois(mois);
CREATE INDEX IF NOT EXISTS idx_qualification_mois_visuel ON qualification_mois(visuel_recu) WHERE visuel_recu = false;

-- Trigger auto-update
DROP TRIGGER IF EXISTS qualification_mois_updated_at ON qualification_mois;
CREATE TRIGGER qualification_mois_updated_at
  BEFORE UPDATE ON qualification_mois
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Vue helper : qualifications avec comptage publications
CREATE OR REPLACE VIEW qualification_publications_summary AS
SELECT
  q.id AS qualification_id,
  q.entreprise_id,
  COUNT(qm.id) AS nombre_publications,
  COUNT(qm.id) FILTER (WHERE qm.visuel_recu = false) AS visuels_manquants,
  ARRAY_AGG(qm.mois ORDER BY qm.ordre) AS mois_parution,
  SUM(qm.prix) AS total_prix_publications
FROM qualification q
LEFT JOIN qualification_mois qm ON qm.qualification_id = q.id
GROUP BY q.id, q.entreprise_id;
