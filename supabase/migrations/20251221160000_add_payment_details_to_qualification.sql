-- Add payment details to qualification table for invoice generation
ALTER TABLE qualification 
ADD COLUMN IF NOT EXISTS date_paiement DATE,
ADD COLUMN IF NOT EXISTS reference_paiement TEXT;
