-- Migration: add storage_path to document, create RPC next_facture_numero, and set documents bucket private
-- Date: 2025-12-21

-- 1) Add `storage_path` column + index
ALTER TABLE IF EXISTS document
ADD COLUMN IF NOT EXISTS storage_path TEXT;

CREATE INDEX IF NOT EXISTS idx_document_storage_path ON document(storage_path);

-- 2) RPC wrapper around existing generate_facture_numero()
CREATE OR REPLACE FUNCTION next_facture_numero()
RETURNS TEXT LANGUAGE SQL SECURITY DEFINER
AS $$ SELECT generate_facture_numero(); $$;

-- 3) Make storage bucket 'documents' private (if table exists)
-- Note: this updates Supabase internal storage metadata. Ensure you have
-- appropriate permissions (service_role key) when running against production.
UPDATE storage.buckets
SET public = false
WHERE id = 'documents';

-- End of migration
