
    CREATE TABLE IF NOT EXISTS qualification (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        baserow_id TEXT UNIQUE,
        entreprise_id UUID REFERENCES entreprise(id),
        statut TEXT,
        mois_parution TEXT,
        format_encart TEXT,
        prix_total TEXT,
        date_contact TEXT, -- Keeping as text to avoid date parsing issues for now
        commentaires TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );
    

        INSERT INTO qualification (baserow_id, entreprise_id, statut, mois_parution, format_encart, prix_total, date_contact, commentaires)
        VALUES ('630', (SELECT id FROM entreprise WHERE baserow_id = '484'), NULL, 'Mai', '6X4', '350', NULL, 'Qualification créée via Mini CRM - Renouvellement Art Floral')
        ON CONFLICT (baserow_id) DO UPDATE SET
            statut = EXCLUDED.statut,
            mois_parution = EXCLUDED.mois_parution,
            format_encart = EXCLUDED.format_encart,
            prix_total = EXCLUDED.prix_total,
            date_contact = EXCLUDED.date_contact,
            commentaires = EXCLUDED.commentaires;
        

        INSERT INTO qualification (baserow_id, entreprise_id, statut, mois_parution, format_encart, prix_total, date_contact, commentaires)
        VALUES ('662', (SELECT id FROM entreprise WHERE baserow_id = '701'), NULL, 'Janvier', '6X4', '350', NULL, 'Renouvellement 2025 - Souhaite payer en Septembre 2025')
        ON CONFLICT (baserow_id) DO UPDATE SET
            statut = EXCLUDED.statut,
            mois_parution = EXCLUDED.mois_parution,
            format_encart = EXCLUDED.format_encart,
            prix_total = EXCLUDED.prix_total,
            date_contact = EXCLUDED.date_contact,
            commentaires = EXCLUDED.commentaires;
        

        INSERT INTO qualification (baserow_id, entreprise_id, statut, mois_parution, format_encart, prix_total, date_contact, commentaires)
        VALUES ('666', (SELECT id FROM entreprise WHERE baserow_id = '709'), NULL, 'Septembre, Octobre, Novembre', '12X4', '500', NULL, 'Renouvellement 2025 - Montant 2024: €1500,00. Format habituel: 12X4. | Publications: Septembre 6X8 (500€), Octobre 12X4 (500€), Novembre 12X4 (500€)')
        ON CONFLICT (baserow_id) DO UPDATE SET
            statut = EXCLUDED.statut,
            mois_parution = EXCLUDED.mois_parution,
            format_encart = EXCLUDED.format_encart,
            prix_total = EXCLUDED.prix_total,
            date_contact = EXCLUDED.date_contact,
            commentaires = EXCLUDED.commentaires;
        

        INSERT INTO qualification (baserow_id, entreprise_id, statut, mois_parution, format_encart, prix_total, date_contact, commentaires)
        VALUES ('669', (SELECT id FROM entreprise WHERE baserow_id = '570'), NULL, 'Mai, Juin, Juillet', '6X8', '500', NULL, 'Renouvellement 2025 - Montant 2024: €1000,00. Format habituel: 6X8. | Publications: Mai 6X8 (500€), Juin 6X8 (500€), Juillet 6X4 (offert) | 1 parution(s) offerte(s)')
        ON CONFLICT (baserow_id) DO UPDATE SET
            statut = EXCLUDED.statut,
            mois_parution = EXCLUDED.mois_parution,
            format_encart = EXCLUDED.format_encart,
            prix_total = EXCLUDED.prix_total,
            date_contact = EXCLUDED.date_contact,
            commentaires = EXCLUDED.commentaires;
        

        INSERT INTO qualification (baserow_id, entreprise_id, statut, mois_parution, format_encart, prix_total, date_contact, commentaires)
        VALUES ('670', (SELECT id FROM entreprise WHERE baserow_id = '643'), NULL, 'Juin', '6X8', '500', NULL, NULL)
        ON CONFLICT (baserow_id) DO UPDATE SET
            statut = EXCLUDED.statut,
            mois_parution = EXCLUDED.mois_parution,
            format_encart = EXCLUDED.format_encart,
            prix_total = EXCLUDED.prix_total,
            date_contact = EXCLUDED.date_contact,
            commentaires = EXCLUDED.commentaires;
        

        INSERT INTO qualification (baserow_id, entreprise_id, statut, mois_parution, format_encart, prix_total, date_contact, commentaires)
        VALUES ('671', (SELECT id FROM entreprise WHERE baserow_id = '568'), NULL, 'Janvier', '6X4', '350', NULL, 'Renouvellement 2025 - Montant 2024: €500,00. Format habituel: 6X4.')
        ON CONFLICT (baserow_id) DO UPDATE SET
            statut = EXCLUDED.statut,
            mois_parution = EXCLUDED.mois_parution,
            format_encart = EXCLUDED.format_encart,
            prix_total = EXCLUDED.prix_total,
            date_contact = EXCLUDED.date_contact,
            commentaires = EXCLUDED.commentaires;
        

        INSERT INTO qualification (baserow_id, entreprise_id, statut, mois_parution, format_encart, prix_total, date_contact, commentaires)
        VALUES ('793', (SELECT id FROM entreprise WHERE baserow_id = '693'), NULL, 'Octobre', '6X4', '350', NULL, 'Renouvellement 2026 - Identique à l''année dernière. Chèque de 350€ reçu. Bon de commande signé en physique. Facture non encore générée.')
        ON CONFLICT (baserow_id) DO UPDATE SET
            statut = EXCLUDED.statut,
            mois_parution = EXCLUDED.mois_parution,
            format_encart = EXCLUDED.format_encart,
            prix_total = EXCLUDED.prix_total,
            date_contact = EXCLUDED.date_contact,
            commentaires = EXCLUDED.commentaires;
        

        INSERT INTO qualification (baserow_id, entreprise_id, statut, mois_parution, format_encart, prix_total, date_contact, commentaires)
        VALUES ('794', (SELECT id FROM entreprise WHERE baserow_id = '1158'), NULL, 'Mai', '6X4', '350', NULL, 'Qualification 2025 - Parution mai 2025. Problème 2024: oubli parution calendrier, remboursement effectué. Chèque 2025 reçu pour nouvelle parution.')
        ON CONFLICT (baserow_id) DO UPDATE SET
            statut = EXCLUDED.statut,
            mois_parution = EXCLUDED.mois_parution,
            format_encart = EXCLUDED.format_encart,
            prix_total = EXCLUDED.prix_total,
            date_contact = EXCLUDED.date_contact,
            commentaires = EXCLUDED.commentaires;
        

        INSERT INTO qualification (baserow_id, entreprise_id, statut, mois_parution, format_encart, prix_total, date_contact, commentaires)
        VALUES ('826', (SELECT id FROM entreprise WHERE baserow_id = '1222'), 'Commande confirmée', 'Janvier à Décembre 2026', '12PARUTIONS', '1800', NULL, 'Format 6X6 Premium - Accord commercial spécial au tarif 12 parutions 6X4 standard. Effort commercial exceptionnel : 50% de surface supplémentaire offerte.')
        ON CONFLICT (baserow_id) DO UPDATE SET
            statut = EXCLUDED.statut,
            mois_parution = EXCLUDED.mois_parution,
            format_encart = EXCLUDED.format_encart,
            prix_total = EXCLUDED.prix_total,
            date_contact = EXCLUDED.date_contact,
            commentaires = EXCLUDED.commentaires;
        

        INSERT INTO qualification (baserow_id, entreprise_id, statut, mois_parution, format_encart, prix_total, date_contact, commentaires)
        VALUES ('925', (SELECT id FROM entreprise WHERE baserow_id = '564'), NULL, '12 parutions', '12PARUTIONS', '1800', NULL, 'Renouvellement identique à 2025 - 12 parutions - 1800€')
        ON CONFLICT (baserow_id) DO UPDATE SET
            statut = EXCLUDED.statut,
            mois_parution = EXCLUDED.mois_parution,
            format_encart = EXCLUDED.format_encart,
            prix_total = EXCLUDED.prix_total,
            date_contact = EXCLUDED.date_contact,
            commentaires = EXCLUDED.commentaires;
        

        INSERT INTO qualification (baserow_id, entreprise_id, statut, mois_parution, format_encart, prix_total, date_contact, commentaires)
        VALUES ('958', (SELECT id FROM entreprise WHERE baserow_id = '583'), NULL, 'Mars', '6X4', '350', NULL, NULL)
        ON CONFLICT (baserow_id) DO UPDATE SET
            statut = EXCLUDED.statut,
            mois_parution = EXCLUDED.mois_parution,
            format_encart = EXCLUDED.format_encart,
            prix_total = EXCLUDED.prix_total,
            date_contact = EXCLUDED.date_contact,
            commentaires = EXCLUDED.commentaires;
        

        INSERT INTO qualification (baserow_id, entreprise_id, statut, mois_parution, format_encart, prix_total, date_contact, commentaires)
        VALUES ('1090', (SELECT id FROM entreprise WHERE baserow_id = '705'), NULL, 'Avril', NULL, '0', '2025-09-16', 'Erreur D''édition 2025 Encart 2026 offert')
        ON CONFLICT (baserow_id) DO UPDATE SET
            statut = EXCLUDED.statut,
            mois_parution = EXCLUDED.mois_parution,
            format_encart = EXCLUDED.format_encart,
            prix_total = EXCLUDED.prix_total,
            date_contact = EXCLUDED.date_contact,
            commentaires = EXCLUDED.commentaires;
        

        INSERT INTO qualification (baserow_id, entreprise_id, statut, mois_parution, format_encart, prix_total, date_contact, commentaires)
        VALUES ('1156', (SELECT id FROM entreprise WHERE baserow_id = '548'), 'Relance programmée', 'Juin, Novembre', '6X8', '500', '2025-09-25', 'Renouvellement 2025 - 2 encarts 6x8 pour juin et novembre')
        ON CONFLICT (baserow_id) DO UPDATE SET
            statut = EXCLUDED.statut,
            mois_parution = EXCLUDED.mois_parution,
            format_encart = EXCLUDED.format_encart,
            prix_total = EXCLUDED.prix_total,
            date_contact = EXCLUDED.date_contact,
            commentaires = EXCLUDED.commentaires;
        

        INSERT INTO qualification (baserow_id, entreprise_id, statut, mois_parution, format_encart, prix_total, date_contact, commentaires)
        VALUES ('1157', (SELECT id FROM entreprise WHERE baserow_id = '508'), 'Relance programmée', 'À définir', NULL, '0', '2025-09-25', 'Renouvellement 2026 - Format identique à 2025 (6x4)')
        ON CONFLICT (baserow_id) DO UPDATE SET
            statut = EXCLUDED.statut,
            mois_parution = EXCLUDED.mois_parution,
            format_encart = EXCLUDED.format_encart,
            prix_total = EXCLUDED.prix_total,
            date_contact = EXCLUDED.date_contact,
            commentaires = EXCLUDED.commentaires;
        

        INSERT INTO qualification (baserow_id, entreprise_id, statut, mois_parution, format_encart, prix_total, date_contact, commentaires)
        VALUES ('1158', (SELECT id FROM entreprise WHERE baserow_id = '514'), 'Relance programmée', 'Juillet', NULL, '0', '2025-09-25', 'Renouvellement 2026 - Format identique à 2025 (6x4)')
        ON CONFLICT (baserow_id) DO UPDATE SET
            statut = EXCLUDED.statut,
            mois_parution = EXCLUDED.mois_parution,
            format_encart = EXCLUDED.format_encart,
            prix_total = EXCLUDED.prix_total,
            date_contact = EXCLUDED.date_contact,
            commentaires = EXCLUDED.commentaires;
        

        INSERT INTO qualification (baserow_id, entreprise_id, statut, mois_parution, format_encart, prix_total, date_contact, commentaires)
        VALUES ('1159', (SELECT id FROM entreprise WHERE baserow_id = '522'), 'Terminé', 'Novembre', NULL, '0', '2025-09-25', 'Renouvellement 2026 - Format identique à 2025 (6x4)')
        ON CONFLICT (baserow_id) DO UPDATE SET
            statut = EXCLUDED.statut,
            mois_parution = EXCLUDED.mois_parution,
            format_encart = EXCLUDED.format_encart,
            prix_total = EXCLUDED.prix_total,
            date_contact = EXCLUDED.date_contact,
            commentaires = EXCLUDED.commentaires;
        

        INSERT INTO qualification (baserow_id, entreprise_id, statut, mois_parution, format_encart, prix_total, date_contact, commentaires)
        VALUES ('1160', (SELECT id FROM entreprise WHERE baserow_id = '618'), 'Terminé', 'Janvier ou Juillet', NULL, '0', '2025-09-25', 'Renouvellement 2026 - Format identique à 2025 (6x4)')
        ON CONFLICT (baserow_id) DO UPDATE SET
            statut = EXCLUDED.statut,
            mois_parution = EXCLUDED.mois_parution,
            format_encart = EXCLUDED.format_encart,
            prix_total = EXCLUDED.prix_total,
            date_contact = EXCLUDED.date_contact,
            commentaires = EXCLUDED.commentaires;
        

        INSERT INTO qualification (baserow_id, entreprise_id, statut, mois_parution, format_encart, prix_total, date_contact, commentaires)
        VALUES ('1161', (SELECT id FROM entreprise WHERE baserow_id = '707'), 'Relance programmée', '12 Mois', '12PARUTIONS', '1800', '2025-09-25', 'Renouvellement 2026 - Format 12 parutions comme 2025')
        ON CONFLICT (baserow_id) DO UPDATE SET
            statut = EXCLUDED.statut,
            mois_parution = EXCLUDED.mois_parution,
            format_encart = EXCLUDED.format_encart,
            prix_total = EXCLUDED.prix_total,
            date_contact = EXCLUDED.date_contact,
            commentaires = EXCLUDED.commentaires;
        

        INSERT INTO qualification (baserow_id, entreprise_id, statut, mois_parution, format_encart, prix_total, date_contact, commentaires)
        VALUES ('1162', (SELECT id FROM entreprise WHERE baserow_id = '1123'), 'Terminé', 'À définir', NULL, '0', '2025-09-25', 'Nouvelle prospection 2026 - Format 6x4')
        ON CONFLICT (baserow_id) DO UPDATE SET
            statut = EXCLUDED.statut,
            mois_parution = EXCLUDED.mois_parution,
            format_encart = EXCLUDED.format_encart,
            prix_total = EXCLUDED.prix_total,
            date_contact = EXCLUDED.date_contact,
            commentaires = EXCLUDED.commentaires;
        

        INSERT INTO qualification (baserow_id, entreprise_id, statut, mois_parution, format_encart, prix_total, date_contact, commentaires)
        VALUES ('1189', (SELECT id FROM entreprise WHERE baserow_id = '710'), 'Terminé', NULL, NULL, '0', '2025-09-26', 'Problème de budget')
        ON CONFLICT (baserow_id) DO UPDATE SET
            statut = EXCLUDED.statut,
            mois_parution = EXCLUDED.mois_parution,
            format_encart = EXCLUDED.format_encart,
            prix_total = EXCLUDED.prix_total,
            date_contact = EXCLUDED.date_contact,
            commentaires = EXCLUDED.commentaires;
        

        INSERT INTO qualification (baserow_id, entreprise_id, statut, mois_parution, format_encart, prix_total, date_contact, commentaires)
        VALUES ('1222', (SELECT id FROM entreprise WHERE baserow_id = '1359'), 'Nouveau', 'Janvier', '6X4', '350', '2025-10-02', NULL)
        ON CONFLICT (baserow_id) DO UPDATE SET
            statut = EXCLUDED.statut,
            mois_parution = EXCLUDED.mois_parution,
            format_encart = EXCLUDED.format_encart,
            prix_total = EXCLUDED.prix_total,
            date_contact = EXCLUDED.date_contact,
            commentaires = EXCLUDED.commentaires;
        

        INSERT INTO qualification (baserow_id, entreprise_id, statut, mois_parution, format_encart, prix_total, date_contact, commentaires)
        VALUES ('1255', (SELECT id FROM entreprise WHERE baserow_id = '1420'), 'Nouveau', '12 parutions annuelles', '12PARUTIONS', '540', '2025-10-03', 'Sapeur-pompier volontaire - Tarif préférentiel -70% première année')
        ON CONFLICT (baserow_id) DO UPDATE SET
            statut = EXCLUDED.statut,
            mois_parution = EXCLUDED.mois_parution,
            format_encart = EXCLUDED.format_encart,
            prix_total = EXCLUDED.prix_total,
            date_contact = EXCLUDED.date_contact,
            commentaires = EXCLUDED.commentaires;
        

        INSERT INTO qualification (baserow_id, entreprise_id, statut, mois_parution, format_encart, prix_total, date_contact, commentaires)
        VALUES ('1321', (SELECT id FROM entreprise WHERE baserow_id = '1354'), 'Nouveau', 'Juin', '6X4', '350', '2025-10-06', 'Utilise le visuel envoyé par mail avec le bon de commande')
        ON CONFLICT (baserow_id) DO UPDATE SET
            statut = EXCLUDED.statut,
            mois_parution = EXCLUDED.mois_parution,
            format_encart = EXCLUDED.format_encart,
            prix_total = EXCLUDED.prix_total,
            date_contact = EXCLUDED.date_contact,
            commentaires = EXCLUDED.commentaires;
        

        INSERT INTO qualification (baserow_id, entreprise_id, statut, mois_parution, format_encart, prix_total, date_contact, commentaires)
        VALUES ('1354', (SELECT id FROM entreprise WHERE baserow_id = '703'), 'Nouveau', 'Janvier', '12PARUTIONS', '1800', '2025-10-08', 'Échéancier accordé')
        ON CONFLICT (baserow_id) DO UPDATE SET
            statut = EXCLUDED.statut,
            mois_parution = EXCLUDED.mois_parution,
            format_encart = EXCLUDED.format_encart,
            prix_total = EXCLUDED.prix_total,
            date_contact = EXCLUDED.date_contact,
            commentaires = EXCLUDED.commentaires;
        

        INSERT INTO qualification (baserow_id, entreprise_id, statut, mois_parution, format_encart, prix_total, date_contact, commentaires)
        VALUES ('1420', (SELECT id FROM entreprise WHERE baserow_id = '1486'), 'Nouveau', 'Février', '6X4', '350', '2025-10-09', NULL)
        ON CONFLICT (baserow_id) DO UPDATE SET
            statut = EXCLUDED.statut,
            mois_parution = EXCLUDED.mois_parution,
            format_encart = EXCLUDED.format_encart,
            prix_total = EXCLUDED.prix_total,
            date_contact = EXCLUDED.date_contact,
            commentaires = EXCLUDED.commentaires;
        

        INSERT INTO qualification (baserow_id, entreprise_id, statut, mois_parution, format_encart, prix_total, date_contact, commentaires)
        VALUES ('1453', (SELECT id FROM entreprise WHERE baserow_id = '1519'), 'Nouveau', 'Avril', '6X4', '350', '2025-10-09', NULL)
        ON CONFLICT (baserow_id) DO UPDATE SET
            statut = EXCLUDED.statut,
            mois_parution = EXCLUDED.mois_parution,
            format_encart = EXCLUDED.format_encart,
            prix_total = EXCLUDED.prix_total,
            date_contact = EXCLUDED.date_contact,
            commentaires = EXCLUDED.commentaires;
        

        INSERT INTO qualification (baserow_id, entreprise_id, statut, mois_parution, format_encart, prix_total, date_contact, commentaires)
        VALUES ('1487', (SELECT id FROM entreprise WHERE baserow_id = '476'), 'Nouveau', 'Janvier', '6X4', '350', '2025-10-09', NULL)
        ON CONFLICT (baserow_id) DO UPDATE SET
            statut = EXCLUDED.statut,
            mois_parution = EXCLUDED.mois_parution,
            format_encart = EXCLUDED.format_encart,
            prix_total = EXCLUDED.prix_total,
            date_contact = EXCLUDED.date_contact,
            commentaires = EXCLUDED.commentaires;
        

        INSERT INTO qualification (baserow_id, entreprise_id, statut, mois_parution, format_encart, prix_total, date_contact, commentaires)
        VALUES ('1488', (SELECT id FROM entreprise WHERE baserow_id = '1552'), NULL, 'Février', '6X4', '350', '2025-10-09', NULL)
        ON CONFLICT (baserow_id) DO UPDATE SET
            statut = EXCLUDED.statut,
            mois_parution = EXCLUDED.mois_parution,
            format_encart = EXCLUDED.format_encart,
            prix_total = EXCLUDED.prix_total,
            date_contact = EXCLUDED.date_contact,
            commentaires = EXCLUDED.commentaires;
        