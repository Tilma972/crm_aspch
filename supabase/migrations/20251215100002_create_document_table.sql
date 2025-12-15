-- ═════════════════════════════════════════════════════════
-- PHASE 2 : Table document
-- ═════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS document (
  -- Identifiants
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qualification_id UUID NOT NULL REFERENCES qualification(id) ON DELETE CASCADE,
  
  -- Type de document
  type TEXT NOT NULL CHECK (type IN (
    'bon_commande',
    'facture',
    'bat',
    'relance'
  )),
  
  -- État génération
  status TEXT CHECK (status IN ('generating', 'ready', 'error')),
  url TEXT,
  numero TEXT,  -- Ex: "BC-2026-0042", "FA-2026-0042"
  error_message TEXT,
  
  -- Tracking workflow
  generated_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,  -- Pour BC uniquement
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  UNIQUE(qualification_id, type)  -- Un seul BC/facture/BAT par qualification
);

-- Index
CREATE INDEX IF NOT EXISTS idx_document_qualification ON document(qualification_id);
CREATE INDEX IF NOT EXISTS idx_document_type ON document(type);
CREATE INDEX IF NOT EXISTS idx_document_status ON document(status) WHERE status IS NOT NULL;

-- Trigger auto-update
DROP TRIGGER IF EXISTS document_updated_at ON document;
CREATE TRIGGER document_updated_at
  BEFORE UPDATE ON document
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Vue helper pour récupérer documents par qualification
CREATE OR REPLACE VIEW qualification_documents AS
SELECT
  q.id AS qualification_id,
  q.entreprise_id,
  MAX(CASE WHEN d.type = 'bon_commande' THEN d.url END) AS bc_url,
  MAX(CASE WHEN d.type = 'bon_commande' THEN d.status END) AS bc_status,
  MAX(CASE WHEN d.type = 'bon_commande' THEN d.generated_at END) AS bc_generated_at,
  MAX(CASE WHEN d.type = 'facture' THEN d.url END) AS facture_url,
  MAX(CASE WHEN d.type = 'facture' THEN d.status END) AS facture_status,
  MAX(CASE WHEN d.type = 'facture' THEN d.numero END) AS facture_numero,
  MAX(CASE WHEN d.type = 'facture' THEN d.generated_at END) AS facture_generated_at
FROM qualification q
LEFT JOIN document d ON d.qualification_id = q.id
GROUP BY q.id, q.entreprise_id;
