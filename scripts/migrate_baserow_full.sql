-- Script de migration des données Baserow vers Supabase
-- Ce script suppose que les tables temporaires baserow_entreprises_temp et baserow_qualifications_temp sont remplies

-- 1. Migration des Entreprises (depuis baserow_entreprises_temp)
-- On insère uniquement les nouvelles entreprises ou on met à jour les existantes ?
-- Pour l'instant, on insère les nouvelles en se basant sur le nom ou l'email pour éviter les doublons
-- Note: baserow_entreprises_temp semble avoir la même structure que baserow_qualifications_temp dans votre message.
-- Je vais supposer que baserow_entreprises_temp contient les infos entreprises (nom, email, tel, ville...)
-- et baserow_qualifications_temp contient l'historique.

-- ATTENTION: Les structures fournies pour les deux tables sont IDENTIQUES.
-- Je vais utiliser baserow_entreprises_temp pour créer/mettre à jour les entreprises
-- et baserow_qualifications_temp pour créer l'historique.

-- 1.1 Insertion/Mise à jour des entreprises
INSERT INTO entreprise (
    nom,
    email,
    telephone,
    -- adresse, ville, cp ne sont pas dans la structure fournie, on laisse null ou on adapte si dispo ailleurs
    baserow_id
)
SELECT DISTINCT
    nom_entreprise,
    contact_email,
    telephone,
    id::text -- On garde l'ID Baserow pour référence
FROM baserow_entreprises_temp
WHERE nom_entreprise IS NOT NULL
ON CONFLICT (baserow_id) DO UPDATE SET
    email = EXCLUDED.email,
    telephone = EXCLUDED.telephone;

-- 2. Migration de l'Historique 2024 (depuis baserow_qualifications_temp)
-- On suppose que ces données correspondent à l'activité 2024 (Calendrier 2025)
INSERT INTO qualification_historique (
    entreprise_id,
    annee_calendrier,
    format_encart,
    mois_parution,
    montant_paye,
    mode_paiement,
    est_paye,
    date_paiement
)
SELECT
    e.id, -- UUID de l'entreprise dans Supabase
    2025, -- Année Calendrier (Activité 2024)
    
    -- Mapping Format
    CASE b.format_encart
        WHEN '6X4' THEN '6X4'
        WHEN '6X8' THEN '6X8'
        WHEN '12X4' THEN '12X4'
        WHEN '12PARUTIONS' THEN '12PARUTIONS'
        ELSE NULL -- Ou une valeur par défaut
    END,
    
    b.mois_parution,
    
    -- Nettoyage Montant (ex: "350,00 €" -> 350.00)
    CASE 
        WHEN b.montant_paye IS NOT NULL AND b.montant_paye != '' 
        THEN CAST(REGEXP_REPLACE(REPLACE(b.montant_paye, ',', '.'), '[^0-9.]', '', 'g') AS NUMERIC)
        ELSE 0
    END,
    
    -- Mapping Mode Paiement
    CASE b.mode_paiement
        WHEN 'Chèque' THEN 'Chèque'
        WHEN 'Virement' THEN 'Virement'
        WHEN 'Espèces' THEN 'Espèces'
        WHEN 'CB' THEN 'CB'
        ELSE NULL
    END,
    
    -- Est payé ? (Si date_paiement existe ou montant_paye > 0)
    (b.date_paiement IS NOT NULL OR (b.montant_paye IS NOT NULL AND b.montant_paye != '')),
    
    -- Date Paiement (Conversion texte -> date)
    CASE 
        WHEN b.date_paiement IS NOT NULL AND b.date_paiement != '' 
        THEN b.date_paiement::DATE 
        ELSE NULL 
    END

FROM baserow_qualifications_temp b
JOIN entreprise e ON e.baserow_id = b.entreprise_id::text -- Jointure via l'ID Baserow stocké
WHERE b.nom_entreprise IS NOT NULL;

-- 3. Migration des Qualifications 2025 (En cours)
-- Si baserow_qualifications_temp contient aussi les qualifs 2025, il faut filtrer.
-- Comment distinguer 2024 de 2025 ? 
-- Hypothèse : Si "Publications_Calendrier" ou une autre colonne indique l'année.
-- Sinon, tout ce qui est dans cette table est considéré comme historique 2024 pour l'instant.
