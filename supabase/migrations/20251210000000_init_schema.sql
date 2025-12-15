-- Enable RLS
ALTER TABLE IF EXISTS entreprise ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS qualification ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS interaction ENABLE ROW LEVEL SECURITY;

-- Functions & Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_facture_numero()
RETURNS TEXT AS $$
DECLARE
  year TEXT;
  max_num INTEGER;
  new_num TEXT;
BEGIN
  year := TO_CHAR(NOW(), 'YYYY');

  SELECT COALESCE(MAX(CAST(SUBSTRING(facture_numero FROM '\d+$') AS INTEGER)), 0)
  INTO max_num
  FROM qualification
  WHERE facture_numero LIKE year || '-%';

  new_num := year || '-' || LPAD((max_num + 1)::TEXT, 4, '0');

  RETURN new_num;
END;
$$ LANGUAGE plpgsql;

-- Table: entreprise
CREATE TABLE IF NOT EXISTS entreprise (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  baserow_id TEXT UNIQUE,
  nom TEXT NOT NULL,
  email TEXT,
  telephone TEXT,
  adresse TEXT,
  ville TEXT,
  cp TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT email_valid CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Indexes entreprise
CREATE INDEX IF NOT EXISTS idx_entreprise_nom ON entreprise(nom);
CREATE INDEX IF NOT EXISTS idx_entreprise_ville ON entreprise(ville);
CREATE INDEX IF NOT EXISTS idx_entreprise_email ON entreprise(email);
CREATE INDEX IF NOT EXISTS idx_entreprise_search ON entreprise USING gin(to_tsvector('french', nom || ' ' || COALESCE(ville, '')));

-- Trigger entreprise
DROP TRIGGER IF EXISTS update_entreprise_updated_at ON entreprise;
CREATE TRIGGER update_entreprise_updated_at
  BEFORE UPDATE ON entreprise
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Table: qualification
CREATE TABLE IF NOT EXISTS qualification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  baserow_id TEXT UNIQUE,
  entreprise_id UUID NOT NULL REFERENCES entreprise(id) ON DELETE CASCADE,
  statut TEXT CHECK (statut IN ('Nouveau', 'Qualifié', 'BC envoyé', 'Payé', 'Terminé', 'Annulé')) DEFAULT 'Nouveau',
  mois_parution TEXT,
  format_encart TEXT CHECK (format_encart IN ('6X4', '6X8', '12X4', '12PARUTIONS')),
  prix_total NUMERIC NOT NULL,
  paiement_echelonne BOOLEAN DEFAULT false,
  echeances JSONB,
  mode_paiement TEXT CHECK (mode_paiement IN ('Chèque', 'Virement', 'CB', 'Espèces')),
  date_contact DATE,
  commentaires TEXT,
  bc_status TEXT CHECK (bc_status IN ('generating', 'ready', 'error')),
  bc_url TEXT,
  bc_generated_at TIMESTAMPTZ,
  bc_error TEXT,
  facture_status TEXT CHECK (facture_status IN ('generating', 'ready', 'error')),
  facture_url TEXT,
  facture_numero TEXT UNIQUE,
  facture_generated_at TIMESTAMPTZ,
  facture_error TEXT,
  bat_status TEXT CHECK (bat_status IN ('generating', 'ready', 'error')),
  bat_url TEXT,
  bat_generated_at TIMESTAMPTZ,
  bat_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes qualification
CREATE INDEX IF NOT EXISTS idx_qualification_entreprise ON qualification(entreprise_id);
CREATE INDEX IF NOT EXISTS idx_qualification_statut ON qualification(statut);
CREATE INDEX IF NOT EXISTS idx_qualification_format ON qualification(format_encart);
-- CREATE INDEX IF NOT EXISTS idx_qualification_bc_status ON qualification(bc_status) WHERE bc_status IS NOT NULL;

-- Trigger qualification
DROP TRIGGER IF EXISTS update_qualification_updated_at ON qualification;
CREATE TRIGGER update_qualification_updated_at
  BEFORE UPDATE ON qualification
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Table: interaction
CREATE TABLE IF NOT EXISTS interaction (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entreprise_id UUID NOT NULL REFERENCES entreprise(id) ON DELETE CASCADE,
  qualification_id UUID REFERENCES qualification(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('email_sent', 'email_received', 'appel_sortant', 'appel_entrant', 'note', 'bc_generated', 'facture_generated', 'paiement_recu')),
  subject TEXT,
  body TEXT,
  gmail_message_id TEXT,
  notes TEXT,
  duree_appel INTEGER,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes interaction
CREATE INDEX IF NOT EXISTS idx_interaction_entreprise ON interaction(entreprise_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interaction_qualification ON interaction(qualification_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interaction_type ON interaction(type);
CREATE INDEX IF NOT EXISTS idx_interaction_created_at ON interaction(created_at DESC);

-- Views
-- CREATE OR REPLACE VIEW entreprise_summary AS
-- SELECT
--   e.id,
--   e.nom,
--   e.email,
--   e.telephone,
--   e.ville,
--   COUNT(DISTINCT q.id) AS nb_qualifications,
--   SUM(q.prix_total) AS ca_total,
--   COUNT(DISTINCT q.id) FILTER (WHERE q.statut = 'Payé') AS nb_qualifications_payees,
--   MAX(i.created_at) AS derniere_interaction_date,
--   (
--     SELECT type
--     FROM interaction
--     WHERE entreprise_id = e.id
--     ORDER BY created_at DESC
--     LIMIT 1
--   ) AS derniere_interaction_type,
--   COUNT(DISTINCT i.id) AS nb_interactions
-- FROM entreprise e
-- LEFT JOIN qualification q ON q.entreprise_id = e.id
-- LEFT JOIN interaction i ON i.entreprise_id = e.id
-- GROUP BY e.id;

-- CREATE OR REPLACE VIEW qualification_alerts AS
-- SELECT
--   q.id,
--   q.entreprise_id,
--   e.nom AS entreprise_nom,
--   q.statut,
--   q.prix_total,
--   q.bc_status,
--   q.bc_generated_at,
--   CASE
--     WHEN q.statut = 'BC envoyé'
--       AND q.bc_generated_at < NOW() - INTERVAL '15 days'
--     THEN 'paiement_retard'
--     WHEN q.statut = 'Payé'
--       AND q.bat_status IS NULL
--     THEN 'visuel_manquant'
--     ELSE NULL
--   END AS alerte_type,
--   EXTRACT(DAY FROM NOW() - q.bc_generated_at)::INTEGER AS jours_depuis_bc
-- FROM qualification q
-- JOIN entreprise e ON e.id = q.entreprise_id
-- WHERE q.statut IN ('BC envoyé', 'Payé');

-- RLS Policies
-- Entreprise
DROP POLICY IF EXISTS "Users authentifiés peuvent tout voir et modifier" ON entreprise;
CREATE POLICY "Users authentifiés peuvent tout voir et modifier"
  ON entreprise
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Qualification
DROP POLICY IF EXISTS "Users authentifiés peuvent tout voir et modifier" ON qualification;
CREATE POLICY "Users authentifiés peuvent tout voir et modifier"
  ON qualification
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Interaction
DROP POLICY IF EXISTS "Users authentifiés peuvent voir et créer interactions" ON interaction;
CREATE POLICY "Users authentifiés peuvent voir et créer interactions"
  ON interaction
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
