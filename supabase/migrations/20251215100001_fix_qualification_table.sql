-- ═════════════════════════════════════════════════════════
-- PHASE 1 : Correction qualification
-- ═════════════════════════════════════════════════════════

-- 1. Ajouter colonnes manquantes
ALTER TABLE qualification
  ADD COLUMN IF NOT EXISTS mode_paiement TEXT,
  ADD COLUMN IF NOT EXISTS paiement_echelonne BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS echeances JSONB,
  ADD COLUMN IF NOT EXISTS is_pompiers BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS remise_pourcentage NUMERIC DEFAULT 0;

-- Add constraints safely
DO $$ BEGIN
    ALTER TABLE qualification ADD CONSTRAINT qualification_mode_paiement_check CHECK (mode_paiement IN ('Chèque', 'Virement', 'CB', 'Espèces'));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE qualification ADD CONSTRAINT qualification_remise_pourcentage_check CHECK (remise_pourcentage >= 0 AND remise_pourcentage <= 100);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE qualification ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Convertir types (avec gestion des erreurs)
-- Note: If columns are already correct, these blocks might fail or need adjustment. 
-- We use a safe approach checking type first or just attempting conversion if needed.
-- However, since we don't know the exact state, we will assume the plan's logic is desired.
-- But if the column is already NUMERIC, the conversion logic below involving 'prix_total_new' is redundant but safe if we check first.

-- Check if prix_total is TEXT before converting
DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'qualification' AND column_name = 'prix_total' AND data_type = 'text') THEN
    -- 2.1 Prix total TEXT → NUMERIC
    ALTER TABLE qualification ADD COLUMN prix_total_new NUMERIC;

    EXECUTE 'UPDATE qualification SET prix_total_new = CASE WHEN prix_total ~ ''^[0-9]+(\.[0-9]+)?$'' THEN prix_total::NUMERIC ELSE 0 END';

    ALTER TABLE qualification DROP COLUMN prix_total;
    ALTER TABLE qualification RENAME COLUMN prix_total_new TO prix_total;
    ALTER TABLE qualification ALTER COLUMN prix_total SET NOT NULL;
  END IF;
END $$;

-- Check if date_contact is TEXT before converting
DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'qualification' AND column_name = 'date_contact' AND data_type = 'text') THEN
    -- 2.2 Date contact TEXT → DATE
    ALTER TABLE qualification ADD COLUMN date_contact_new DATE;

    EXECUTE 'UPDATE qualification SET date_contact_new = CASE WHEN date_contact IS NOT NULL AND date_contact != '''' THEN date_contact::DATE ELSE NULL END';

    ALTER TABLE qualification DROP COLUMN date_contact;
    ALTER TABLE qualification RENAME COLUMN date_contact_new TO date_contact;
  END IF;
END $$;

-- Clean up invalid status before adding constraint
UPDATE qualification 
SET statut = 'Nouveau' 
WHERE statut NOT IN ('Nouveau', 'Qualifié', 'BC envoyé', 'Payé', 'Terminé', 'Annulé') 
   OR statut IS NULL;

-- 3. Ajouter contraintes CHECK (Idempotent)
DO $$ BEGIN
    ALTER TABLE qualification DROP CONSTRAINT IF EXISTS check_statut;
    ALTER TABLE qualification ADD CONSTRAINT check_statut CHECK (statut IN ('Nouveau', 'Qualifié', 'BC envoyé', 'Payé', 'Terminé', 'Annulé'));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE qualification DROP CONSTRAINT IF EXISTS check_format_encart;
    ALTER TABLE qualification ADD CONSTRAINT check_format_encart CHECK (format_encart IN ('6X4', '6X8', '12X4', '12PARUTIONS'));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. Ajouter contrainte NOT NULL sur statut
UPDATE qualification SET statut = 'Nouveau' WHERE statut IS NULL;
ALTER TABLE qualification ALTER COLUMN statut SET DEFAULT 'Nouveau';
ALTER TABLE qualification ALTER COLUMN statut SET NOT NULL;

-- 5. Index de performance
CREATE INDEX IF NOT EXISTS idx_qualification_statut ON qualification(statut);
CREATE INDEX IF NOT EXISTS idx_qualification_entreprise ON qualification(entreprise_id);
CREATE INDEX IF NOT EXISTS idx_qualification_format ON qualification(format_encart);
CREATE INDEX IF NOT EXISTS idx_qualification_created_at ON qualification(created_at DESC);

-- 6. Trigger auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS qualification_updated_at ON qualification;
CREATE TRIGGER qualification_updated_at
  BEFORE UPDATE ON qualification
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
