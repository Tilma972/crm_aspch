-- ═════════════════════════════════════════════════════════
-- PHASE 4 : Table paiement
-- ═════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS paiement (
  -- Identifiants
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qualification_id UUID NOT NULL REFERENCES qualification(id) ON DELETE CASCADE,
  
  -- Données paiement
  montant NUMERIC NOT NULL CHECK (montant > 0),
  date_echeance DATE NOT NULL,
  date_paiement DATE,
  
  statut TEXT DEFAULT 'en_attente' CHECK (statut IN (
    'en_attente',
    'paye',
    'retard',
    'annule'
  )),
  
  -- Détails paiement
  mode_paiement TEXT CHECK (mode_paiement IN ('Chèque', 'Virement', 'CB', 'Espèces')),
  reference TEXT,  -- Numéro chèque, référence virement
  numero_ordre INTEGER NOT NULL,  -- 1ère, 2ème, 3ème échéance
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_paiement_qualification ON paiement(qualification_id);
CREATE INDEX IF NOT EXISTS idx_paiement_statut ON paiement(statut);
CREATE INDEX IF NOT EXISTS idx_paiement_echeance ON paiement(date_echeance);

-- Trigger auto-update
DROP TRIGGER IF EXISTS paiement_updated_at ON paiement;
CREATE TRIGGER paiement_updated_at
  BEFORE UPDATE ON paiement
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger auto-update statut si retard
CREATE OR REPLACE FUNCTION update_paiement_statut_retard()
RETURNS TRIGGER AS $$
BEGIN
  -- Si échéance passée et pas payé → statut retard
  IF NEW.statut = 'en_attente' 
     AND NEW.date_echeance < CURRENT_DATE 
     AND NEW.date_paiement IS NULL 
  THEN
    NEW.statut = 'retard';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS paiement_check_retard ON paiement;
CREATE TRIGGER paiement_check_retard
  BEFORE INSERT OR UPDATE ON paiement
  FOR EACH ROW
  EXECUTE FUNCTION update_paiement_statut_retard();

-- Vue helper : résumé paiements par qualification
CREATE OR REPLACE VIEW qualification_paiements_summary AS
SELECT
  q.id AS qualification_id,
  q.entreprise_id,
  COUNT(p.id) AS nombre_echeances,
  COUNT(p.id) FILTER (WHERE p.statut = 'paye') AS echeances_payees,
  COUNT(p.id) FILTER (WHERE p.statut = 'retard') AS echeances_retard,
  SUM(p.montant) AS montant_total,
  SUM(p.montant) FILTER (WHERE p.statut = 'paye') AS montant_paye,
  MIN(p.date_echeance) FILTER (WHERE p.statut = 'en_attente') AS prochaine_echeance
FROM qualification q
LEFT JOIN paiement p ON p.qualification_id = q.id
GROUP BY q.id, q.entreprise_id;
