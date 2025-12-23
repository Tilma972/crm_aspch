-- ═════════════════════════════════════════════════════════
-- Migration: Fix Supabase Security Issues
-- Date: 2025-12-23
-- Description: Corrects RLS configuration and view security settings
-- ═════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────
-- PARTIE 1: Activer RLS sur toutes les tables publiques
-- ────────────────────────────────────────────────────────

-- Table interaction: RLS existe mais n'était pas activé correctement
ALTER TABLE interaction ENABLE ROW LEVEL SECURITY;

-- Table document: Activation RLS + politiques
ALTER TABLE document ENABLE ROW LEVEL SECURITY;

-- Table qualification_mois: Activation RLS + politiques
ALTER TABLE qualification_mois ENABLE ROW LEVEL SECURITY;

-- Table paiement: Activation RLS + politiques
ALTER TABLE paiement ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────
-- PARTIE 2: Créer les politiques RLS pour les nouvelles tables
-- ────────────────────────────────────────────────────────

-- Politique pour document
DROP POLICY IF EXISTS "Users authentifiés peuvent tout voir et modifier" ON document;
CREATE POLICY "Users authentifiés peuvent tout voir et modifier"
  ON document
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Politique pour qualification_mois
DROP POLICY IF EXISTS "Users authentifiés peuvent tout voir et modifier" ON qualification_mois;
CREATE POLICY "Users authentifiés peuvent tout voir et modifier"
  ON qualification_mois
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Politique pour paiement
DROP POLICY IF EXISTS "Users authentifiés peuvent tout voir et modifier" ON paiement;
CREATE POLICY "Users authentifiés peuvent tout voir et modifier"
  ON paiement
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ────────────────────────────────────────────────────────
-- PARTIE 3: Recréer les vues avec SECURITY INVOKER
-- ────────────────────────────────────────────────────────

-- Vue 1: qualification_documents
-- Change SECURITY DEFINER to SECURITY INVOKER
CREATE OR REPLACE VIEW qualification_documents
WITH (security_invoker = true) AS
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

-- Vue 2: qualification_publications_summary
CREATE OR REPLACE VIEW qualification_publications_summary
WITH (security_invoker = true) AS
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

-- Vue 3: qualification_paiements_summary
CREATE OR REPLACE VIEW qualification_paiements_summary
WITH (security_invoker = true) AS
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

-- Vue 4: entreprise_historique_complet
CREATE OR REPLACE VIEW entreprise_historique_complet
WITH (security_invoker = true) AS
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
