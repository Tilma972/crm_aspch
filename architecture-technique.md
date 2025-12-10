# Architecture Technique - CRM ASPCH

**Date** : 2025-12-09
**Version** : 1.0
**Statut** : Spécifications MVP

---

## 📐 Vue d'Ensemble Architecture

### **Principe Directeur**
> **CRM = Interface + Maître des Données (100% CRUD)**
> **n8n = Moteur de Workflows (Génération, IA, Enrichissement)**

```
┌────────────────────────────────────────────────────────────────┐
│  USER (Browser)                                                │
└────────────────────────────────────────────────────────────────┘
                            ↓ HTTPS
┌────────────────────────────────────────────────────────────────┐
│  VERCEL (Next.js 15 App Router)                                │
│  ─────────────────────────────────────────────────────────────│
│  • Pages React (SSR + Client Components)                       │
│  • API Routes (/api/webhooks/*)                                │
│  • Supabase Client (auth, queries, realtime)                   │
└────────────────────────────────────────────────────────────────┘
         ↓ PostgreSQL                    ↓ Webhooks HTTP
┌──────────────────────────┐    ┌─────────────────────────────┐
│  SUPABASE                │    │  n8n (Workflows)            │
│  ──────────────────────  │    │  ─────────────────────────  │
│  • Postgres Database     │    │  • generate-bc              │
│  • Auth (JWT)            │←───│  • generate-facture         │
│  • Realtime (WebSocket)  │    │  • email-draft (IA)         │
│  • Storage (optionnel)   │    │  • email-send (Gmail)       │
└──────────────────────────┘    │  • UPDATE Supabase (results)│
                                └─────────────────────────────┘
                                         ↓
                                ┌─────────────────────────────┐
                                │  Services Externes          │
                                │  ─────────────────────────  │
                                │  • Google Drive (PDFs)      │
                                │  • Gmail API (envoi)        │
                                │  • Claude/Gemini (IA)       │
                                └─────────────────────────────┘
```

---

## 🗄️ SCHÉMA BASE DE DONNÉES SUPABASE

### **Table : entreprise**

**Responsabilité** : CRM gère 100% du CRUD (INSERT, UPDATE, DELETE)

```sql
CREATE TABLE entreprise (
  -- Identifiants
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  baserow_id TEXT UNIQUE, -- Migration historique Baserow

  -- Données métier
  nom TEXT NOT NULL,
  email TEXT,
  telephone TEXT,
  adresse TEXT,
  ville TEXT,
  cp TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Contraintes
  CONSTRAINT email_valid CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Index pour performance
CREATE INDEX idx_entreprise_nom ON entreprise(nom);
CREATE INDEX idx_entreprise_ville ON entreprise(ville);
CREATE INDEX idx_entreprise_email ON entreprise(email);

-- Full-text search
CREATE INDEX idx_entreprise_search ON entreprise USING gin(to_tsvector('french', nom || ' ' || COALESCE(ville, '')));

-- Trigger auto-update updated_at
CREATE TRIGGER update_entreprise_updated_at
  BEFORE UPDATE ON entreprise
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

### **Table : qualification**

**Responsabilité** :
- **CRM** : Gère données métier (format, prix, statut, commentaires)
- **n8n** : Met à jour uniquement champs résultats workflows (bc_*, facture_*, bat_*)

```sql
CREATE TABLE qualification (
  -- Identifiants
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  baserow_id TEXT UNIQUE, -- Migration historique
  entreprise_id UUID NOT NULL REFERENCES entreprise(id) ON DELETE CASCADE,

  -- ===== DONNÉES MÉTIER (gérées par CRM) =====
  statut TEXT CHECK (statut IN (
    'Nouveau',
    'Qualifié',
    'BC envoyé',
    'Payé',
    'Terminé',
    'Annulé'
  )) DEFAULT 'Nouveau',

  mois_parution TEXT, -- Ex: "Mai" ou "Janvier, Février, Mars"
  format_encart TEXT CHECK (format_encart IN ('6X4', '6X8', '12X4', '12PARUTIONS')),
  prix_total NUMERIC NOT NULL,
  paiement_echelonne BOOLEAN DEFAULT false,
  echeances JSONB, -- Array: [{ date: '2026-01-15', montant: 175 }]
  mode_paiement TEXT CHECK (mode_paiement IN ('Chèque', 'Virement', 'CB', 'Espèces')),

  date_contact DATE,
  commentaires TEXT,

  -- ===== CHAMPS BON DE COMMANDE (mis à jour par n8n) =====
  bc_status TEXT CHECK (bc_status IN ('generating', 'ready', 'error')),
  bc_url TEXT, -- URL Google Drive
  bc_generated_at TIMESTAMPTZ,
  bc_error TEXT,

  -- ===== CHAMPS FACTURE (mis à jour par n8n) =====
  facture_status TEXT CHECK (facture_status IN ('generating', 'ready', 'error')),
  facture_url TEXT,
  facture_numero TEXT UNIQUE, -- Ex: "2026-0042"
  facture_generated_at TIMESTAMPTZ,
  facture_error TEXT,

  -- ===== CHAMPS BAT (mis à jour par n8n) =====
  bat_status TEXT CHECK (bat_status IN ('generating', 'ready', 'error')),
  bat_url TEXT,
  bat_generated_at TIMESTAMPTZ,
  bat_error TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_qualification_entreprise ON qualification(entreprise_id);
CREATE INDEX idx_qualification_statut ON qualification(statut);
CREATE INDEX idx_qualification_format ON qualification(format_encart);
CREATE INDEX idx_qualification_bc_status ON qualification(bc_status) WHERE bc_status IS NOT NULL;

-- Trigger auto-update
CREATE TRIGGER update_qualification_updated_at
  BEFORE UPDATE ON qualification
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Règles de Gestion** :
- `bc_status = 'generating'` → CRM affiche spinner
- `bc_status = 'ready'` → CRM affiche bouton "Voir BC"
- `bc_status = 'error'` → CRM affiche message erreur + bouton "Réessayer"

---

### **💡 Alternative Senior : Table `document` Normalisée**

**Contexte** : Le schéma actuel (3 groupes de colonnes `bc_*`, `facture_*`, `bat_*`) est acceptable pour MVP mais peut devenir verbeux si vous ajoutez plus de types de documents.

**Alternative scalable** (Phase 2 si besoin) :

```sql
CREATE TABLE document (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qualification_id UUID NOT NULL REFERENCES qualification(id) ON DELETE CASCADE,

  -- Type de document
  type TEXT NOT NULL CHECK (type IN ('bc', 'facture', 'bat', 'relance', 'devis')),

  -- État & données
  status TEXT CHECK (status IN ('generating', 'ready', 'error')),
  url TEXT,
  numero TEXT,  -- Numéro facture, BC, etc.
  error TEXT,

  -- Metadata
  generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Un seul document de chaque type par qualification
  UNIQUE(qualification_id, type)
);

CREATE INDEX idx_document_qualification ON document(qualification_id);
CREATE INDEX idx_document_type ON document(type);
```

**Avantages** :
- ✅ **Scalable** : Nouveau type de document = `INSERT`, pas `ALTER TABLE`
- ✅ **Queries propres** : `SELECT * FROM document WHERE qualification_id = ? AND type = 'bc'`
- ✅ **Moins de NULL** : Pas de colonnes vides dans `qualification`

**Inconvénients** :
- ⚠️ **JOIN supplémentaire** : Chaque query qualification nécessite un `LEFT JOIN document`
- ⚠️ **Complexité accrue** : Plus de tables à gérer

**Recommandation** :
- **MVP** : Garder colonnes `bc_*`, `facture_*`, `bat_*` dans `qualification` (simple, rapide)
- **Phase 2** : Migrer vers table `document` si vous ajoutez 4-5 types de documents supplémentaires

**Migration future** (si besoin) :
```sql
-- Migrer données existantes
INSERT INTO document (qualification_id, type, status, url, generated_at)
SELECT
  id,
  'bc',
  bc_status,
  bc_url,
  bc_generated_at
FROM qualification
WHERE bc_url IS NOT NULL;

-- Supprimer anciennes colonnes
ALTER TABLE qualification
  DROP COLUMN bc_status,
  DROP COLUMN bc_url,
  DROP COLUMN bc_generated_at,
  DROP COLUMN bc_error;
```

---

### **Table : interaction**

**Responsabilité** :
- **n8n** : INSERT automatique après envoi email
- **CRM** : INSERT manuel (appel téléphonique, note interne)

```sql
CREATE TABLE interaction (
  -- Identifiants
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entreprise_id UUID NOT NULL REFERENCES entreprise(id) ON DELETE CASCADE,
  qualification_id UUID REFERENCES qualification(id) ON DELETE SET NULL,

  -- Type interaction
  type TEXT NOT NULL CHECK (type IN (
    'email_sent',        -- Email envoyé via n8n
    'email_received',    -- Email reçu (Phase 2)
    'appel_sortant',     -- Appel téléphonique fait
    'appel_entrant',     -- Appel reçu
    'note',              -- Note interne
    'bc_generated',      -- BC généré (optionnel, pour timeline)
    'facture_generated', -- Facture générée
    'paiement_recu'      -- Paiement encaissé
  )),

  -- Données spécifiques emails
  subject TEXT,
  body TEXT,
  gmail_message_id TEXT, -- ID Gmail pour tracking

  -- Données spécifiques appels/notes
  notes TEXT,
  duree_appel INTEGER, -- Durée en secondes

  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_interaction_entreprise ON interaction(entreprise_id, created_at DESC);
CREATE INDEX idx_interaction_qualification ON interaction(qualification_id, created_at DESC);
CREATE INDEX idx_interaction_type ON interaction(type);
CREATE INDEX idx_interaction_created_at ON interaction(created_at DESC);
```

---

### **Fonctions & Triggers**

```sql
-- Fonction auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction génération numero facture auto
CREATE OR REPLACE FUNCTION generate_facture_numero()
RETURNS TEXT AS $$
DECLARE
  year TEXT;
  max_num INTEGER;
  new_num TEXT;
BEGIN
  year := TO_CHAR(NOW(), 'YYYY');

  SELECT COALESCE(MAX(CAST(SUBSTRING(facture_numero FROM '\d+$') AS INTEGER)), 0)
  INTO max_num
  FROM qualification
  WHERE facture_numero LIKE year || '-%';

  new_num := year || '-' || LPAD((max_num + 1)::TEXT, 4, '0');

  RETURN new_num;
END;
$$ LANGUAGE plpgsql;
```

---

### **Vues Utiles**

```sql
-- Vue résumé entreprise (pour dashboard)
CREATE VIEW entreprise_summary AS
SELECT
  e.id,
  e.nom,
  e.email,
  e.telephone,
  e.ville,
  COUNT(DISTINCT q.id) AS nb_qualifications,
  SUM(q.prix_total) AS ca_total,
  COUNT(DISTINCT q.id) FILTER (WHERE q.statut = 'Payé') AS nb_qualifications_payees,
  MAX(i.created_at) AS derniere_interaction_date,
  (
    SELECT type
    FROM interaction
    WHERE entreprise_id = e.id
    ORDER BY created_at DESC
    LIMIT 1
  ) AS derniere_interaction_type,
  COUNT(DISTINCT i.id) AS nb_interactions
FROM entreprise e
LEFT JOIN qualification q ON q.entreprise_id = e.id
LEFT JOIN interaction i ON i.entreprise_id = e.id
GROUP BY e.id;

-- Vue qualifications avec alertes
CREATE VIEW qualification_alerts AS
SELECT
  q.id,
  q.entreprise_id,
  e.nom AS entreprise_nom,
  q.statut,
  q.prix_total,
  q.bc_status,
  q.bc_generated_at,
  -- Alerte paiement retard
  CASE
    WHEN q.statut = 'BC envoyé'
      AND q.bc_generated_at < NOW() - INTERVAL '15 days'
    THEN 'paiement_retard'
    WHEN q.statut = 'Payé'
      AND q.bat_status IS NULL
    THEN 'visuel_manquant'
    ELSE NULL
  END AS alerte_type,
  -- Nombre jours depuis BC
  EXTRACT(DAY FROM NOW() - q.bc_generated_at)::INTEGER AS jours_depuis_bc
FROM qualification q
JOIN entreprise e ON e.id = q.entreprise_id
WHERE q.statut IN ('BC envoyé', 'Payé');
```

---

### **Row Level Security (RLS)**

```sql
-- Activer RLS sur toutes les tables
ALTER TABLE entreprise ENABLE ROW LEVEL SECURITY;
ALTER TABLE qualification ENABLE ROW LEVEL SECURITY;
ALTER TABLE interaction ENABLE ROW LEVEL SECURITY;

-- Policies MVP : Tous les users authentifiés voient tout
-- (Phase 2 : Permissions par rôle)

CREATE POLICY "Users authentifiés peuvent tout voir et modifier"
  ON entreprise
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users authentifiés peuvent tout voir et modifier"
  ON qualification
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users authentifiés peuvent voir et créer interactions"
  ON interaction
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy spéciale pour n8n (Service Role)
-- n8n utilise service_role key pour UPDATE sans RLS
```

---

## 🔌 CONTRATS API n8n (WEBHOOKS)

### **Conventions**

- **Base URL n8n** : `https://votre-n8n.app/webhook`
- **Authentification** : Header `X-N8N-API-KEY` (optionnel, configuré dans n8n)
- **Format** : JSON
- **Timeout** : 60 secondes max
- **Idempotence** : Tous webhooks idempotents (retry safe)

---

### **1. Webhook : `generate-bc`**

**Objectif** : Générer Bon de Commande PDF depuis template Google Docs

#### **Request**

```typescript
POST /webhook/generate-bc
Content-Type: application/json

{
  // Requis
  "qualification_id": "550e8400-e29b-41d4-a716-446655440000",

  // Données entreprise
  "entreprise": {
    "nom": "Boulangerie Martin",
    "adresse": "12 Rue du Pain",
    "ville": "Clermont-l'Hérault",
    "cp": "34800",
    "email": "contact@boulangerie-martin.fr"
  },

  // Données qualification
  "format": "6X4",          // "6X4" | "6X8" | "12X4" | "12PARUTIONS"
  "mois": "Mai",            // Ou "Janvier, Février, Mars"
  "prix": 350,              // Numeric

  // Metadata
  "date_emission": "2025-12-09T14:32:00Z"
}
```

#### **Response Succès (200)**

```json
{
  "status": "success",
  "bc_url": "https://drive.google.com/file/d/1a2b3c4d5e6f/view",
  "drive_file_id": "1a2b3c4d5e6f",
  "generated_at": "2025-12-09T14:32:45Z"
}
```

#### **Response Erreur (500)**

```json
{
  "status": "error",
  "error": "Template Google Docs introuvable",
  "details": "Document ID invalide: 1xyz..."
}
```

#### **Actions n8n**

1. Charge template Google Docs `BC_2026` (ID configuré dans n8n)
2. Replace placeholders :
   - `{{ENTREPRISE_NOM}}` → `entreprise.nom`
   - `{{ENTREPRISE_ADRESSE}}` → `entreprise.adresse`
   - `{{FORMAT}}` → `format`
   - `{{PRIX}}` → `prix`
   - `{{MOIS}}` → `mois`
   - `{{DATE}}` → `date_emission`
3. Export document → PDF
4. Upload Google Drive → folder `BC/2026`
5. Get shareable link
6. **UPDATE Supabase** :
   ```sql
   UPDATE qualification
   SET
     bc_url = 'https://drive.google.com/...',
     bc_status = 'ready',
     bc_generated_at = NOW(),
     bc_error = NULL
   WHERE id = '{{qualification_id}}'
   ```
7. Return response

---

### **2. Webhook : `email-draft`**

**Objectif** : Générer draft email avec IA contextuelle

💡 **Alternative rapide (Phase 1.5)** : Si vous voulez livrer MVP plus vite, utilisez des **templates statiques Markdown** :
```typescript
// lib/email-templates/relance-paiement.md
Bonjour {{entreprise.nom}},

Suite à notre échange concernant votre participation au Calendrier 2026 ({{format}} - {{prix}}€), nous n'avons pas encore reçu votre règlement.

Pourriez-vous nous confirmer la date de paiement ?

Cordialement,
Sapeurs-Pompiers de Clermont-l'Hérault
```
Puis remplacer placeholders côté CRM. L'IA peut être ajoutée Phase 2 sans changer l'API.

#### **Request**

```typescript
POST /webhook/email-draft
Content-Type: application/json

{
  // Contexte métier
  "context": {
    "entreprise": {
      "nom": "Boulangerie Martin",
      "email": "contact@boulangerie-martin.fr",
      "ville": "Clermont-l'Hérault"
    },
    "qualification": {
      "format_encart": "6X4",
      "mois_parution": "Mai",
      "prix_total": 350,
      "statut": "BC envoyé"
    },
    "historique": [
      {
        "date": "2025-11-15",
        "event": "BC généré et envoyé",
        "type": "bc_generated"
      },
      {
        "date": "2025-11-20",
        "event": "Email de suivi envoyé",
        "type": "email_sent"
      }
    ],
    "alertes": [
      "Paiement en retard de 5 jours"
    ]
  },

  // Type d'email souhaité
  "email_type": "relance_paiement",  // "relance_paiement" | "envoi_bc" | "demande_visuel" | "remerciement"

  // Ton souhaité
  "tone": "professionnel-amical"     // "professionnel-amical" | "formel" | "cordial"
}
```

#### **Response Succès (200)**

```json
{
  "draft": "Bonjour M. Martin,\n\nSuite à notre échange du 15 novembre concernant votre participation au Calendrier 2026 (format 6X4 - 350€), nous n'avons pas encore reçu votre règlement.\n\nPourriez-vous nous confirmer la date de paiement ?\n\nCordialement,\nSapeurs-Pompiers de Clermont-l'Hérault",

  "metadata": {
    "model": "claude-3-5-haiku-20241022",
    "tokens": 120,
    "generated_at": "2025-12-09T14:35:12Z",
    "prompt_version": "v1.2"
  }
}
```

#### **Response Erreur (500)**

```json
{
  "status": "error",
  "error": "API IA indisponible",
  "details": "Anthropic API timeout après 30s"
}
```

#### **Actions n8n**

1. **Enrichir contexte** (node Code JavaScript) :
   ```javascript
   const enrichedPrompt = `
   Tu es l'assistant email des Sapeurs-Pompiers de Clermont-l'Hérault.

   CONTEXTE ENTREPRISE:
   - Nom: ${context.entreprise.nom}
   - Email: ${context.entreprise.email}
   - Ville: ${context.entreprise.ville}

   QUALIFICATION:
   - Format: ${context.qualification.format_encart}
   - Mois: ${context.qualification.mois_parution}
   - Prix: ${context.qualification.prix_total}€
   - Statut: ${context.qualification.statut}

   HISTORIQUE:
   ${context.historique.map(h => `- ${h.date}: ${h.event}`).join('\n')}

   ALERTES:
   ${context.alertes.join('\n')}

   TÂCHE:
   Rédige un email de type "${email_type}" avec un ton "${tone}".

   CONTRAINTES:
   - Maximum 150 mots
   - Commence par "Bonjour M./Mme [nom]"
   - Termine par "Cordialement,\nSapeurs-Pompiers de Clermont-l'Hérault"
   - Professionnel mais humain
   - Inclure contexte pertinent (prix, format, date)
   `;
   ```

2. **Appel IA** (node Anthropic ou Google AI) :
   - Modèle : `claude-3-5-haiku-20241022` (rapide, cheap) ou `gemini-2.0-flash-exp`
   - Temperature : 0.7
   - Max tokens : 300

3. Return draft

---

### **3. Webhook : `email-send`**

**Objectif** : Envoyer email via Gmail + logger interaction

#### **Request**

```typescript
POST /webhook/email-send
Content-Type: application/json

{
  // IDs pour logging
  "qualification_id": "550e8400-e29b-41d4-a716-446655440000",
  "entreprise_id": "660e8400-e29b-41d4-a716-446655440111",

  // Données email
  "to": "contact@boulangerie-martin.fr",
  "subject": "Relance paiement Calendrier 2026",
  "body": "Bonjour M. Martin,\n\nSuite à notre échange...",

  // Optionnel : Pièces jointes
  "attachments": [
    {
      "filename": "BC_BoulangerieMartin_2026.pdf",
      "url": "https://drive.google.com/file/d/1a2b3c4/view",
      "drive_file_id": "1a2b3c4"
    }
  ]
}
```

#### **Response Succès (200)**

```json
{
  "status": "sent",
  "gmail_message_id": "18d2e3f4a5b6c7d8",
  "sent_at": "2025-12-09T14:36:28Z",
  "interaction_id": "770e8400-e29b-41d4-a716-446655440222"
}
```

#### **Response Erreur (500)**

```json
{
  "status": "error",
  "error": "Envoi Gmail échoué",
  "details": "Quota dépassé (2000 emails/jour)"
}
```

#### **Actions n8n**

1. **Télécharger attachments** (si présents) :
   - Fetch URLs Drive
   - Convert to base64

2. **Envoyer via Gmail** (node Gmail) :
   - From : `contact@sapeurs-pompiers-clermont.fr` (configuré OAuth)
   - To : `{{to}}`
   - Subject : `{{subject}}`
   - Body : `{{body}}`
   - Attachments : base64

3. **Logger dans Supabase** :
   ```sql
   INSERT INTO interaction (
     entreprise_id,
     qualification_id,
     type,
     subject,
     body,
     gmail_message_id,
     created_at
   ) VALUES (
     '{{entreprise_id}}',
     '{{qualification_id}}',
     'email_sent',
     '{{subject}}',
     '{{body}}',
     '{{gmail_message_id}}',
     NOW()
   )
   RETURNING id
   ```

4. Return response avec `interaction_id`

---

### **4. Webhook : `generate-facture`**

**Objectif** : Générer Facture PDF

#### **Request**

```typescript
POST /webhook/generate-facture
Content-Type: application/json

{
  // Requis
  "qualification_id": "550e8400-e29b-41d4-a716-446655440000",

  // Données entreprise
  "entreprise": {
    "nom": "Boulangerie Martin",
    "adresse": "12 Rue du Pain",
    "ville": "Clermont-l'Hérault",
    "cp": "34800",
    "email": "contact@boulangerie-martin.fr"
  },

  // Données facture
  "montant_total": 350,
  "paiement_echelonne": false,
  "echeances": [],  // Si échelonné : [{ date: "2026-01-15", montant: 175 }]

  // Auto-généré ou fourni
  "numero_facture": "2026-0042"  // Ou null → n8n génère
}
```

#### **Response**

Même format que `generate-bc` :

```json
{
  "status": "success",
  "facture_url": "https://drive.google.com/file/d/2b3c4d5e6f7g/view",
  "facture_numero": "2026-0042",
  "generated_at": "2025-12-09T14:40:00Z"
}
```

#### **Actions n8n**

1. Génère numero si non fourni (ou via function Supabase)
2. Load template `Facture_2026`
3. Replace placeholders
4. Export PDF
5. Upload Drive
6. **UPDATE Supabase** :
   ```sql
   UPDATE qualification
   SET
     facture_url = '...',
     facture_numero = '2026-0042',
     facture_status = 'ready',
     facture_generated_at = NOW()
   WHERE id = '{{qualification_id}}'
   ```

---

## 🏗️ STRUCTURE PROJET NEXT.JS

```
crm_aspch/
├── app/
│   ├── (auth)/                    # Group auth routes
│   │   ├── login/
│   │   │   └── page.tsx           # Page login
│   │   └── layout.tsx             # Layout auth
│   │
│   ├── (dashboard)/               # Group protected routes
│   │   ├── layout.tsx             # Layout avec sidebar
│   │   ├── page.tsx               # Dashboard /
│   │   │
│   │   ├── entreprises/
│   │   │   ├── page.tsx           # Liste entreprises
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx       # Détail entreprise
│   │   │   │   └── loading.tsx
│   │   │   └── nouvelle/
│   │   │       └── page.tsx       # Formulaire création
│   │   │
│   │   └── qualifications/
│   │       ├── page.tsx           # Vue Kanban
│   │       ├── [id]/
│   │       │   └── page.tsx       # Détail qualification
│   │       └── nouvelle/
│   │           └── page.tsx       # Formulaire création
│   │
│   ├── api/
│   │   ├── webhooks/              # Endpoints pour n8n
│   │   │   ├── generate-bc/
│   │   │   │   └── route.ts       # Trigger BC génération
│   │   │   ├── generate-facture/
│   │   │   │   └── route.ts
│   │   │   ├── email-draft/
│   │   │   │   └── route.ts
│   │   │   └── email-send/
│   │   │       └── route.ts
│   │   │
│   │   └── analytics/
│   │       └── route.ts           # KPIs dashboard
│   │
│   ├── layout.tsx                 # Root layout
│   └── globals.css
│
├── components/
│   ├── ui/                        # Shadcn components
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   └── ...
│   │
│   ├── entreprises/
│   │   ├── EntrepriseTable.tsx    # Table liste
│   │   ├── EntrepriseForm.tsx     # Formulaire CRUD
│   │   └── EntrepriseContextCard.tsx  # Résumé contexte
│   │
│   ├── qualifications/
│   │   ├── QualificationKanban.tsx
│   │   ├── QualificationForm.tsx
│   │   └── QualificationDetail.tsx
│   │
│   ├── emails/
│   │   ├── EmailComposerModal.tsx  # Modal rédaction
│   │   └── EmailTimeline.tsx       # Historique
│   │
│   └── dashboard/
│       ├── KPICards.tsx
│       ├── RevenueChart.tsx
│       └── AlertsList.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Client Supabase (browser)
│   │   ├── server.ts              # Client Supabase (server)
│   │   └── types.ts               # Types générés
│   │
│   ├── n8n/
│   │   ├── client.ts              # Helper appels webhooks
│   │   └── types.ts               # Types payloads
│   │
│   └── utils.ts                   # Helpers généraux
│
├── hooks/
│   ├── useSupabaseRealtime.ts     # Hook Realtime updates
│   ├── useEntreprise.ts
│   └── useQualification.ts
│
├── supabase/
│   ├── migrations/
│   │   ├── 20251209_schema.sql
│   │   └── 20251209_seed.sql
│   └── config.toml
│
├── .env.local
├── next.config.js
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

---

## 🔐 AUTHENTIFICATION SUPABASE

### **Setup**

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = async () => {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}
```

### **Middleware Protection**

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // Redirect non-authentifiés vers login
  if (!session && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

## 🔄 SUPABASE REALTIME

### **Setup Hook**

```typescript
// hooks/useSupabaseRealtime.ts
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useQualificationRealtime(
  qualification_id: string,
  onUpdate: (payload: any) => void
) {
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`qualification-${qualification_id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'qualification',
          filter: `id=eq.${qualification_id}`,
        },
        (payload) => {
          console.log('Qualification updated:', payload.new)
          onUpdate(payload.new)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [qualification_id, onUpdate])
}
```

### **Usage Composant**

```typescript
// components/qualifications/QualificationDetail.tsx
'use client'

import { useState } from 'react'
import { useQualificationRealtime } from '@/hooks/useSupabaseRealtime'

export function QualificationDetail({ initialData }) {
  const [qualification, setQualification] = useState(initialData)

  // Subscribe aux updates
  useQualificationRealtime(qualification.id, (updated) => {
    setQualification(updated)

    // Toast si BC prêt
    if (updated.bc_status === 'ready' && qualification.bc_status !== 'ready') {
      toast.success('✅ Bon de commande généré !')
    }
  })

  return (
    <div>
      {qualification.bc_status === 'generating' && (
        <div className="flex items-center gap-2">
          <Spinner />
          <span>Génération du BC en cours...</span>
        </div>
      )}

      {qualification.bc_status === 'ready' && (
        <div className="flex gap-2">
          <Button onClick={() => window.open(qualification.bc_url, '_blank')}>
            👁️ Voir BC
          </Button>
          <Button onClick={() => handleSendEmail()}>
            📤 Envoyer par email
          </Button>
        </div>
      )}
    </div>
  )
}
```

---

## 🔧 HELPER n8n CLIENT

```typescript
// lib/n8n/client.ts
const N8N_BASE_URL = process.env.N8N_WEBHOOK_BASE_URL!
const N8N_API_KEY = process.env.N8N_API_KEY // Optionnel

export class N8nClient {
  private async call<T>(endpoint: string, payload: any): Promise<T> {
    const response = await fetch(`${N8N_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(N8N_API_KEY && { 'X-N8N-API-KEY': N8N_API_KEY }),
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`n8n error: ${error.error}`)
    }

    return response.json()
  }

  async generateBC(data: GenerateBCPayload) {
    return this.call<GenerateBCResponse>('/generate-bc', data)
  }

  async generateEmailDraft(data: EmailDraftPayload) {
    return this.call<EmailDraftResponse>('/email-draft', data)
  }

  async sendEmail(data: SendEmailPayload) {
    return this.call<SendEmailResponse>('/email-send', data)
  }

  async generateFacture(data: GenerateFacturePayload) {
    return this.call<GenerateFactureResponse>('/generate-facture', data)
  }
}

export const n8n = new N8nClient()
```

### **Usage dans API Route (Pattern Fire & Forget)**

⚠️ **IMPORTANT** : Les webhooks n8n sont **asynchrones**. Ne pas `await` la réponse n8n !

```typescript
// app/api/webhooks/generate-bc/route.ts
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { qualification_id } = await request.json()

  // 1. Charger données
  const { data: qualification } = await supabase
    .from('qualification')
    .select('*, entreprise(*)')
    .eq('id', qualification_id)
    .single()

  if (!qualification) {
    return Response.json({ error: 'Qualification not found' }, { status: 404 })
  }

  // 2. Update statut "generating" IMMÉDIATEMENT
  await supabase
    .from('qualification')
    .update({ bc_status: 'generating' })
    .eq('id', qualification_id)

  // 3. Trigger n8n en FIRE & FORGET (pas d'await !)
  fetch(process.env.N8N_WEBHOOK_BASE_URL + '/generate-bc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      qualification_id: qualification.id,
      entreprise: {
        nom: qualification.entreprise.nom,
        adresse: qualification.entreprise.adresse,
        ville: qualification.entreprise.ville,
        cp: qualification.entreprise.cp,
        email: qualification.entreprise.email,
      },
      format: qualification.format_encart,
      mois: qualification.mois_parution,
      prix: qualification.prix_total,
      date_emission: new Date().toISOString(),
    })
  }).catch(err => {
    // Log l'erreur mais ne bloque pas la response
    console.error('n8n trigger failed:', err)

    // Optionnel : Mettre bc_status = 'error' en background
    supabase
      .from('qualification')
      .update({ bc_status: 'error', bc_error: 'Webhook n8n inaccessible' })
      .eq('id', qualification_id)
      .then()
  })

  // 4. Return IMMÉDIATEMENT (ne pas attendre n8n)
  // Frontend affiche spinner + écoute Realtime pour bc_status = 'ready'
  return Response.json({
    status: 'processing',
    message: 'Génération du BC lancée'
  })
}
```

**Pourquoi Fire & Forget ?**
- ✅ **Response rapide** : Frontend reçoit 200 en <100ms
- ✅ **UI réactive** : Spinner immédiat, Supabase Realtime notifie quand prêt
- ✅ **Pas de timeout** : n8n peut prendre 5-30s, pas de soucis
- ✅ **Scalable** : Si n8n est lent, ça ne bloque pas l'API

**Flow complet** :
1. User clique "Générer BC"
2. API return `{ status: 'processing' }` en 100ms
3. UI affiche spinner
4. n8n génère PDF (5-10s)
5. n8n UPDATE Supabase `bc_status = 'ready'`
6. Realtime notifie frontend → Spinner → "✅ BC prêt"

---

## 📊 ANALYTICS & MONITORING

### **Vercel Analytics**

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### **Sentry Error Tracking (Optionnel)**

⚠️ **MVP** : Sentry peut être **différé Phase 2**. Les logs Vercel suffisent pour débugger.

**Si besoin (production avec utilisateurs réels)** :

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
})
```

**Budget** : 5-10k events/mois gratuit, puis payant.

**Recommandation** : Démarrer sans Sentry, ajouter quand l'équipe utilise vraiment l'app.

---

## 🚀 DÉPLOIEMENT

### **Vercel (CRM)**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Variables environnement requises :
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# SUPABASE_SERVICE_ROLE_KEY (pour admin)
# N8N_WEBHOOK_BASE_URL
# N8N_API_KEY (optionnel)
```

### **Supabase**

```bash
# Link projet local
npx supabase link --project-ref <votre-ref>

# Push migrations
npx supabase db push

# Generate types
npx supabase gen types typescript --local > lib/supabase/types.ts
```

---

## ✅ CHECKLIST VALIDATION

Avant de démarrer le développement, valider :

- [ ] Schéma DB Supabase approuvé
- [ ] Contrats API n8n clairs (payloads Request/Response)
- [ ] URLs webhooks n8n configurées
- [ ] Projet Supabase créé (connexion OK)
- [ ] Templates Google Docs prêts (BC, Facture)
- [ ] Gmail OAuth configuré dans n8n
- [ ] Claude/Gemini API key obtenue

**Ce document est la référence technique pour développement MVP.**
