-- Add missing columns to qualification table
ALTER TABLE qualification 
ADD COLUMN IF NOT EXISTS paiement_echelonne BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS echeances JSONB,
ADD COLUMN IF NOT EXISTS mode_paiement TEXT,
ADD COLUMN IF NOT EXISTS bc_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS bc_url TEXT,
ADD COLUMN IF NOT EXISTS bc_generated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS bc_error TEXT,
ADD COLUMN IF NOT EXISTS facture_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS facture_url TEXT,
ADD COLUMN IF NOT EXISTS facture_numero TEXT,
ADD COLUMN IF NOT EXISTS facture_generated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS facture_error TEXT,
ADD COLUMN IF NOT EXISTS bat_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS bat_url TEXT,
ADD COLUMN IF NOT EXISTS bat_generated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS bat_error TEXT;

-- Add constraints if they are missing (idempotent)
DO $$ BEGIN
    ALTER TABLE qualification ADD CONSTRAINT qualification_mode_paiement_check CHECK (mode_paiement IN ('Chèque', 'Virement', 'CB', 'Espèces'));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE qualification ADD CONSTRAINT qualification_bc_status_check CHECK (bc_status IN ('generating', 'ready', 'error', 'pending'));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE qualification ADD CONSTRAINT qualification_facture_status_check CHECK (facture_status IN ('generating', 'ready', 'error', 'pending'));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE qualification ADD CONSTRAINT qualification_bat_status_check CHECK (bat_status IN ('generating', 'ready', 'error', 'pending'));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
