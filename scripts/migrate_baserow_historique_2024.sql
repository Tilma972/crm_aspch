-- Script de migration de l'historique 2024 depuis un export Baserow
-- Pré-requis : Avoir importé l'export Baserow dans une table temporaire 'baserow_entreprises_temp'
-- Cette table doit contenir les colonnes : id (correspondant à entreprise.id ou baserow_id), baserow_format_2025, baserow_mois_2025, baserow_montant_2024, baserow_mode_paiement_2024, baserow_client_2025

-- Insérer historique 2024 depuis table entreprise Baserow
INSERT INTO qualification_historique (
  entreprise_id,
  annee_calendrier,
  format_encart,
  mois_parution,
  montant_paye,
  mode_paiement,
  est_paye
)
SELECT
  e.id, -- Assurez-vous que c'est bien l'UUID de la table entreprise, sinon faites une jointure
  2025 AS annee_calendrier,  -- Calendrier 2025 = Année commerciale 2024
  
  -- Mapping format depuis Baserow
  CASE baserow_format_2025
    WHEN '6X4' THEN '6X4'
    WHEN '6X8' THEN '6X8'
    WHEN '12X4' THEN '12X4'
    WHEN '12PARUTIONS' THEN '12PARUTIONS'
    ELSE NULL -- Ou gérer les cas inconnus
  END AS format_encart,
  
  baserow_mois_2025 AS mois_parution,
  
  -- Parser montant (€350,00 → 350)
  -- Adaptez le parsing selon le format exact de votre export
  CAST(REGEXP_REPLACE(REPLACE(baserow_montant_2024, ',', '.'), '[^0-9.]', '', 'g') AS NUMERIC) 
    AS montant_paye,
  
  CASE baserow_mode_paiement_2024
    WHEN 'Chèque' THEN 'Chèque'
    WHEN 'Virement' THEN 'Virement'
    WHEN 'Espèces' THEN 'Espèces'
    WHEN 'CB' THEN 'CB'
    ELSE NULL
  END AS mode_paiement,
  
  -- Client 2025 = "Oui" → est_paye = true (Hypothèse : si client 2025, c'est qu'il a payé 2024 ?)
  -- Ou utiliser une colonne spécifique "Paiement Reçu" si elle existe
  (baserow_client_2025 = 'Oui') AS est_paye
  
FROM baserow_entreprises_temp e
WHERE baserow_client_2025 = 'Oui'  -- Uniquement clients 2024
  AND baserow_montant_2024 IS NOT NULL;
