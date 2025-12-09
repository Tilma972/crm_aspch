
    CREATE TABLE IF NOT EXISTS entreprise (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        baserow_id TEXT UNIQUE,
        nom TEXT NOT NULL,
        email TEXT,
        telephone TEXT,
        adresse TEXT,
        ville TEXT,
        cp TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );
    

            INSERT INTO entreprise (baserow_id, nom, email, telephone, adresse, ville)
            VALUES ('476', 'SARL YABAELLE', 'restoburgers34@hotmail.com', '06 26 34 32 58', '14 Rue du Sauvignon 34800 Clermont-l''Hérault', 'CLERMONT-L''HÉRAULT')
            ON CONFLICT (baserow_id) DO UPDATE SET
                nom = EXCLUDED.nom,
                email = EXCLUDED.email,
                telephone = EXCLUDED.telephone,
                adresse = EXCLUDED.adresse,
                ville = EXCLUDED.ville;
            

            INSERT INTO entreprise (baserow_id, nom, email, telephone, adresse, ville)
            VALUES ('484', 'Art Floral', 'art-floral34@orange.fr', '04 67 96 01 50', '19 Boulevard Gambetta 34800 Clermont-l''Hérault', 'CLERMONT-L''HÉRAULT')
            ON CONFLICT (baserow_id) DO UPDATE SET
                nom = EXCLUDED.nom,
                email = EXCLUDED.email,
                telephone = EXCLUDED.telephone,
                adresse = EXCLUDED.adresse,
                ville = EXCLUDED.ville;
            

            INSERT INTO entreprise (baserow_id, nom, email, telephone, adresse, ville)
            VALUES ('508', 'Bureau Vallée', 'bv.clermont-34800@bureau-vallee.fr', '06 60 52 33 37', '10 rue du Chardonnet 34800 Clermont-l''Hérault', 'CLERMONT-L''HÉRAULT')
            ON CONFLICT (baserow_id) DO UPDATE SET
                nom = EXCLUDED.nom,
                email = EXCLUDED.email,
                telephone = EXCLUDED.telephone,
                adresse = EXCLUDED.adresse,
                ville = EXCLUDED.ville;
            

            INSERT INTO entreprise (baserow_id, nom, email, telephone, adresse, ville)
            VALUES ('514', 'Centor', 'christophe.imbert@business.fr', '04 67 96 06 45', 'Centre Commercial Grand Axe 34800 Clermont-l''Hérault', 'CLERMONT-L''HÉRAULT')
            ON CONFLICT (baserow_id) DO UPDATE SET
                nom = EXCLUDED.nom,
                email = EXCLUDED.email,
                telephone = EXCLUDED.telephone,
                adresse = EXCLUDED.adresse,
                ville = EXCLUDED.ville;
            

            INSERT INTO entreprise (baserow_id, nom, email, telephone, adresse, ville)
            VALUES ('522', 'CIC', 'celine.aussillous@cic.fr', '04 67 88 10 20', '32 rue Doyen Renegos 34800 Clermont-l''Hérault', 'CLERMONT-L''HÉRAULT')
            ON CONFLICT (baserow_id) DO UPDATE SET
                nom = EXCLUDED.nom,
                email = EXCLUDED.email,
                telephone = EXCLUDED.telephone,
                adresse = EXCLUDED.adresse,
                ville = EXCLUDED.ville;
            

            INSERT INTO entreprise (baserow_id, nom, email, telephone, adresse, ville)
            VALUES ('548', 'Favreau Claude', 'claude.favreau@gmail.com', '04 67 96 67 90', '17 Av. Marcellin Albert, 34725 Saint-Félix-de-Lodez', 'SAINT-FELIX-DE-LODEZ')
            ON CONFLICT (baserow_id) DO UPDATE SET
                nom = EXCLUDED.nom,
                email = EXCLUDED.email,
                telephone = EXCLUDED.telephone,
                adresse = EXCLUDED.adresse,
                ville = EXCLUDED.ville;
            

            INSERT INTO entreprise (baserow_id, nom, email, telephone, adresse, ville)
            VALUES ('564', 'Hyper U and drive', 'morgan.boutier@cooperative-u.fr', '04 67 88 45 45', 'Centre Commercial Grand Axe, Chem. de la Madeleine, 34800 Clermont-l''Hérault', 'CLERMONT-L''HÉRAULT')
            ON CONFLICT (baserow_id) DO UPDATE SET
                nom = EXCLUDED.nom,
                email = EXCLUDED.email,
                telephone = EXCLUDED.telephone,
                adresse = EXCLUDED.adresse,
                ville = EXCLUDED.ville;
            

            INSERT INTO entreprise (baserow_id, nom, email, telephone, adresse, ville)
            VALUES ('568', 'Intermarché', 'pdv10223@mousquetaires.com', '04 67 88 42 00', '2 rue du Servant 34800 Clermont-l''Hérault', 'CLERMONT-L''HÉRAULT')
            ON CONFLICT (baserow_id) DO UPDATE SET
                nom = EXCLUDED.nom,
                email = EXCLUDED.email,
                telephone = EXCLUDED.telephone,
                adresse = EXCLUDED.adresse,
                ville = EXCLUDED.ville;
            

            INSERT INTO entreprise (baserow_id, nom, email, telephone, adresse, ville)
            VALUES ('570', 'IRRIPISCINE', 'irri34cle@irrijardin.com', '04 67 88 23 70', '3 rue du Chardonnay 34800 Clermont-l''Hérault', 'CLERMONT-L''HÉRAULT')
            ON CONFLICT (baserow_id) DO UPDATE SET
                nom = EXCLUDED.nom,
                email = EXCLUDED.email,
                telephone = EXCLUDED.telephone,
                adresse = EXCLUDED.adresse,
                ville = EXCLUDED.ville;
            

            INSERT INTO entreprise (baserow_id, nom, email, telephone, adresse, ville)
            VALUES ('583', 'Huilerie Coopérative', 'contact@olidoc.com', '04 67 96 10 36', '13 Avenue Président Wilson 34800 Clermont-l''Hérault', 'CLERMONT-L''HÉRAULT')
            ON CONFLICT (baserow_id) DO UPDATE SET
                nom = EXCLUDED.nom,
                email = EXCLUDED.email,
                telephone = EXCLUDED.telephone,
                adresse = EXCLUDED.adresse,
                ville = EXCLUDED.ville;
            

            INSERT INTO entreprise (baserow_id, nom, email, telephone, adresse, ville)
            VALUES ('618', 'Love Literie', 'loveliterie.clermont@wanadoo.fr', '04 67 88 10 10', 'Clermont Commercial Tanes Basses, 7, Rue de la Syrah, 34800 Clermont-l''Hérault', 'CLERMONT-L''HÉRAULT')
            ON CONFLICT (baserow_id) DO UPDATE SET
                nom = EXCLUDED.nom,
                email = EXCLUDED.email,
                telephone = EXCLUDED.telephone,
                adresse = EXCLUDED.adresse,
                ville = EXCLUDED.ville;
            

            INSERT INTO entreprise (baserow_id, nom, email, telephone, adresse, ville)
            VALUES ('643', 'Normand Aluminium', 'contact@normand-alu.com', '06 25 01 62 12', '900 Avenue de la Salamane 34800 Clermont-l''Hérault', 'CLERMONT-L''HÉRAULT')
            ON CONFLICT (baserow_id) DO UPDATE SET
                nom = EXCLUDED.nom,
                email = EXCLUDED.email,
                telephone = EXCLUDED.telephone,
                adresse = EXCLUDED.adresse,
                ville = EXCLUDED.ville;
            

            INSERT INTO entreprise (baserow_id, nom, email, telephone, adresse, ville)
            VALUES ('693', 'FORD', 'tanes-basses@orange.fr', '04 67 96 90 69', '1 rue Grenache Zae Tanes Basses', 'CLERMONT-L''HÉRAULT')
            ON CONFLICT (baserow_id) DO UPDATE SET
                nom = EXCLUDED.nom,
                email = EXCLUDED.email,
                telephone = EXCLUDED.telephone,
                adresse = EXCLUDED.adresse,
                ville = EXCLUDED.ville;
            

            INSERT INTO entreprise (baserow_id, nom, email, telephone, adresse, ville)
            VALUES ('701', 'MEUBLES FERRAND', 'meubles.ferrand@yahoo.com', '04 67 96 09 77', '17 Av. de Montpellier', 'CLERMONT-L''HÉRAULT')
            ON CONFLICT (baserow_id) DO UPDATE SET
                nom = EXCLUDED.nom,
                email = EXCLUDED.email,
                telephone = EXCLUDED.telephone,
                adresse = EXCLUDED.adresse,
                ville = EXCLUDED.ville;
            

            INSERT INTO entreprise (baserow_id, nom, email, telephone, adresse, ville)
            VALUES ('703', 'Papé Matteo', 'papematteoclermont@gmail.com', '06 13 45 14 99', '1 rue du Cardinal - ZAE Les Tanès Basses', 'CLERMONT-L''HÉRAULT')
            ON CONFLICT (baserow_id) DO UPDATE SET
                nom = EXCLUDED.nom,
                email = EXCLUDED.email,
                telephone = EXCLUDED.telephone,
                adresse = EXCLUDED.adresse,
                ville = EXCLUDED.ville;
            

            INSERT INTO entreprise (baserow_id, nom, email, telephone, adresse, ville)
            VALUES ('705', 'CEYRAS Pizza', 'muriel.gardelle@sfr.fr', '06 18 88 13 31', '251 Route de Clermont', 'CEYRAS')
            ON CONFLICT (baserow_id) DO UPDATE SET
                nom = EXCLUDED.nom,
                email = EXCLUDED.email,
                telephone = EXCLUDED.telephone,
                adresse = EXCLUDED.adresse,
                ville = EXCLUDED.ville;
            

            INSERT INTO entreprise (baserow_id, nom, email, telephone, adresse, ville)
            VALUES ('707', 'Emporus', 'maxime@emporus.fr', '04 30 40 01 60', '11 Avenue de Montpellier', 'CLERMONT-L''HÉRAULT')
            ON CONFLICT (baserow_id) DO UPDATE SET
                nom = EXCLUDED.nom,
                email = EXCLUDED.email,
                telephone = EXCLUDED.telephone,
                adresse = EXCLUDED.adresse,
                ville = EXCLUDED.ville;
            

            INSERT INTO entreprise (baserow_id, nom, email, telephone, adresse, ville)
            VALUES ('709', 'Vandenhoeck Vigroux', 'contact@laclermontaise.fr', '04 67 96 09 91', 'Route de Montpellier', 'CLERMONT-L''HÉRAULT')
            ON CONFLICT (baserow_id) DO UPDATE SET
                nom = EXCLUDED.nom,
                email = EXCLUDED.email,
                telephone = EXCLUDED.telephone,
                adresse = EXCLUDED.adresse,
                ville = EXCLUDED.ville;
            

            INSERT INTO entreprise (baserow_id, nom, email, telephone, adresse, ville)
            VALUES ('710', 'Schmidt', 'b.cabot@schmidt34.fr', '06 10 78 98 88', '8 Rue Servent', 'CLERMONT-L''HÉRAULT')
            ON CONFLICT (baserow_id) DO UPDATE SET
                nom = EXCLUDED.nom,
                email = EXCLUDED.email,
                telephone = EXCLUDED.telephone,
                adresse = EXCLUDED.adresse,
                ville = EXCLUDED.ville;
            

            INSERT INTO entreprise (baserow_id, nom, email, telephone, adresse, ville)
            VALUES ('1123', 'VECTORIA', 'contact@vectoria.fr', '04 67 71 32 62', '62 avenue de la Salamane -Z.A. Castellum 34800 CLERMONT L''HERAULT', 'CLERMONT-L''HÉRAULT')
            ON CONFLICT (baserow_id) DO UPDATE SET
                nom = EXCLUDED.nom,
                email = EXCLUDED.email,
                telephone = EXCLUDED.telephone,
                adresse = EXCLUDED.adresse,
                ville = EXCLUDED.ville;
            

            INSERT INTO entreprise (baserow_id, nom, email, telephone, adresse, ville)
            VALUES ('1158', 'Atelier Tiphon', 'seb-t34@hotmail.fr', '04.30.40.29.25', '7 avenue Léon Rouquet, 34800 Clermont-l''Hérault', 'CLERMONT-L''HÉRAULT')
            ON CONFLICT (baserow_id) DO UPDATE SET
                nom = EXCLUDED.nom,
                email = EXCLUDED.email,
                telephone = EXCLUDED.telephone,
                adresse = EXCLUDED.adresse,
                ville = EXCLUDED.ville;
            

            INSERT INTO entreprise (baserow_id, nom, email, telephone, adresse, ville)
            VALUES ('1222', 'Taxi Vallée de l''Hérault', 'groupetvh@gmail.com', '06 27 30 58 94', 'Vallée de l''Hérault, 34800', NULL)
            ON CONFLICT (baserow_id) DO UPDATE SET
                nom = EXCLUDED.nom,
                email = EXCLUDED.email,
                telephone = EXCLUDED.telephone,
                adresse = EXCLUDED.adresse,
                ville = EXCLUDED.ville;
            

            INSERT INTO entreprise (baserow_id, nom, email, telephone, adresse, ville)
            VALUES ('1354', 'Maison JEAN JEAN', 'camille.jeanjean@maison-jeanjean.com', '04 67 88 45 75', '128 Avenue Marcellin Albert', 'SAINT-FELIX-DE-LODEZ')
            ON CONFLICT (baserow_id) DO UPDATE SET
                nom = EXCLUDED.nom,
                email = EXCLUDED.email,
                telephone = EXCLUDED.telephone,
                adresse = EXCLUDED.adresse,
                ville = EXCLUDED.ville;
            

            INSERT INTO entreprise (baserow_id, nom, email, telephone, adresse, ville)
            VALUES ('1359', 'MB DIAG EXPERT', 'mbdiagexpert34@gmail.com', '07 49 56 58 35', NULL, 'CLERMONT-L''HÉRAULT')
            ON CONFLICT (baserow_id) DO UPDATE SET
                nom = EXCLUDED.nom,
                email = EXCLUDED.email,
                telephone = EXCLUDED.telephone,
                adresse = EXCLUDED.adresse,
                ville = EXCLUDED.ville;
            

            INSERT INTO entreprise (baserow_id, nom, email, telephone, adresse, ville)
            VALUES ('1420', 'AQUAFAMILY', 'jocours.lacoste@gmail.com', '07 55 73 24 50', '100 du Pauferit, LACOSTE', 'CEYRAS')
            ON CONFLICT (baserow_id) DO UPDATE SET
                nom = EXCLUDED.nom,
                email = EXCLUDED.email,
                telephone = EXCLUDED.telephone,
                adresse = EXCLUDED.adresse,
                ville = EXCLUDED.ville;
            

            INSERT INTO entreprise (baserow_id, nom, email, telephone, adresse, ville)
            VALUES ('1486', 'LOHEZ Fabien', 'fabien.lohez@sfr.fr', '06 75 99 34 28', '58 Impasse des Maraîchers', 'CLERMONT-L''HÉRAULT')
            ON CONFLICT (baserow_id) DO UPDATE SET
                nom = EXCLUDED.nom,
                email = EXCLUDED.email,
                telephone = EXCLUDED.telephone,
                adresse = EXCLUDED.adresse,
                ville = EXCLUDED.ville;
            

            INSERT INTO entreprise (baserow_id, nom, email, telephone, adresse, ville)
            VALUES ('1519', 'A+Clim', 'aplusclim@gmail.com', '06 69 74 16 16', '210 Avenue des cocardières', 'CASTRIES')
            ON CONFLICT (baserow_id) DO UPDATE SET
                nom = EXCLUDED.nom,
                email = EXCLUDED.email,
                telephone = EXCLUDED.telephone,
                adresse = EXCLUDED.adresse,
                ville = EXCLUDED.ville;
            

            INSERT INTO entreprise (baserow_id, nom, email, telephone, adresse, ville)
            VALUES ('1552', 'O'' Jardins', 'odinservices34@gmail.com', '06 38 18 06 30', '1 Chemin des Cadene', 'ARGELLIERS')
            ON CONFLICT (baserow_id) DO UPDATE SET
                nom = EXCLUDED.nom,
                email = EXCLUDED.email,
                telephone = EXCLUDED.telephone,
                adresse = EXCLUDED.adresse,
                ville = EXCLUDED.ville;
            