-- Migration: Prefix existing facture numbers with 'FA-' and update generator
-- Adds 'FA-' to existing numbers matching 'YYYY-NNNN' and replaces
-- the generate_facture_numero() function to produce 'FA-YYYY-NNNN'.

BEGIN;

-- 1) Prefix existing qualification.facture_numero values like '2025-0001'
UPDATE qualification
SET facture_numero = 'FA-' || facture_numero
WHERE facture_numero IS NOT NULL
  AND facture_numero ~ '^[0-9]{4}-[0-9]{4}$';

-- 2) Prefix existing document.numero values (table `public.document`)
-- Only affect rows where type = 'facture' and the number matches 'YYYY-NNNN'.
UPDATE public.document
SET numero = 'FA-' || numero
WHERE type = 'facture'
  AND numero IS NOT NULL
  AND numero ~ '^[0-9]{4}-[0-9]{4}$';

-- 3) Replace generator function so new numbers are prefixed with 'FA-'
CREATE OR REPLACE FUNCTION generate_facture_numero()
RETURNS TEXT AS $$
DECLARE
  year TEXT;
  max_num INTEGER;
  new_num TEXT;
BEGIN
  year := TO_CHAR(NOW(), 'YYYY');

  -- Consider both legacy numbers ("YYYY-NNNN") and already-prefixed ones ("FA-YYYY-NNNN")
  SELECT COALESCE(MAX(CAST(SUBSTRING(facture_numero FROM '\\d+$') AS INTEGER)), 0)
  INTO max_num
  FROM qualification
  WHERE facture_numero LIKE year || '-%'
     OR facture_numero LIKE 'FA-' || year || '-%';

  new_num := year || '-' || LPAD((max_num + 1)::TEXT, 4, '0');

  RETURN 'FA-' || new_num;
END;
$$ LANGUAGE plpgsql;

COMMIT;
