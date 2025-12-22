# Plan d'Implémentation : Flux de Génération de Factures (Option C)

**Date**: 21 décembre 2025  
**Version**: 1.0  
**Statut**: 🔴 En attente de validation

---

## 📋 Vue d'ensemble

Ce document définit le plan complet pour implémenter le flux de génération de factures avec modal de confirmation, intégration n8n, et mise à jour automatique de la base de données.

### Objectif Principal
Permettre aux utilisateurs de déclencher la génération d'une facture depuis l'interface web en cliquant sur le bouton "Facture", avec :
- Modal de confirmation permettant de choisir le statut (Émise / Acquittée)
- Déclenchement d'un workflow n8n pour générer le PDF
- Mise à jour automatique de `qualification.facture_*` et table `document`
- Feedback utilisateur en temps réel (loading, succès, erreur)

---

## 🎯 Contexte Technique Actuel

### Migrations Existantes
- ✅ `supabase/migrations/20251221120000_add_storage_path_and_rpc_and_bucket.sql` : crée RPC `next_facture_numero()`
- ✅ `supabase/migrations/20251221154500_add_fa_prefix_to_factures.sql` : préfixe numéros `FA-YYYY-NNNN`

### Fonction Postgres Disponible
```sql
SELECT next_facture_numero(); -- Retourne ex: "FA-2025-0001"
```

### Workflow n8n Existant
- Webhook: `POST /receipt-pdf` (peut être adapté ou créer un nouveau pour factures)
- Conversion HTML → PDF via Gotenberg
- Upload vers Minio/Supabase Storage
- Envoi email optionnel

### Table `document` (existante)
```sql
CREATE TABLE document (
  id UUID PRIMARY KEY,
  qualification_id UUID REFERENCES qualification(id),
  type TEXT CHECK (type IN ('bc', 'facture', 'bat', 'relance', 'devis')),
  numero TEXT,          -- Ex: "FA-2025-0001"
  url TEXT,             -- URL du PDF stocké
  storage_path TEXT,    -- Chemin Supabase Storage
  created_at TIMESTAMPTZ
);
```

### Champs dans `qualification` (existants)
```sql
facture_status    TEXT CHECK (facture_status IN ('generating', 'ready', 'error'))
facture_url       TEXT
facture_numero    TEXT UNIQUE
facture_generated_at TIMESTAMPTZ
facture_error     TEXT
```

---

## 📁 Fichiers à Créer / Modifier

### Phase 1️⃣ : Documentation & Spécifications

#### 1.1 `docs/facture-modal-flow.md` (NEW)
- **Contenu** : Spécification détaillée du flux (UX, API contract, séquence, états, sécurité)
- **Audience** : Tous (frontend, backend, n8n, ops)

#### 1.2 `docs/facture-webhook-spec.md` (NEW)
- **Contenu** : Contrat exact du webhook n8n (payload in/out, headers, signage)
- **Audience** : n8n team, backend

#### 1.3 `.env.example` (MODIFY)
- **Changements** : Ajouter variables webhook
  ```
  WEBHOOK_URL=https://n8n.your-domain/webhook/generate-facture
  WEBHOOK_SECRET=your-hmac-secret-here
  SUPABASE_SERVICE_ROLE_KEY=...
  ```

---

### Phase 2️⃣ : Frontend (React / App Router)

#### 2.1 `components/entreprises/FactureModal.tsx` (NEW)
- Modal Shadcn/UI (Dialog + Form)
- Affiche 2 boutons radio :
  - "Émise" (facture_status = 'generating') → orange
  - "Acquittée" (facture_status = 'generating', paiement reçu) → vert
- Bouton "Générer" qui appelle l'API
- États UI: idle / loading / success / error
- Affiche le numéro généré quand succès

#### 2.2 `hooks/useGenerateFacture.ts` (NEW)
- Hook client pour POST `/api/qualifications/[id]/facture`
- Gère les états (loading, success, error)
- Polle optionnellement l'état `facture_status` toutes les 2s
- Expose `{ isLoading, error, success, numeroFacture, trigger }`

#### 2.3 `app/(dashboard)/entreprises/[id]/page.tsx` (MODIFY)
- Ajouter state pour l'ouverture du modal
- Remplacer le bouton "Facture" par :
  ```tsx
  <Button onClick={() => setFactureModalOpen(true)}>
    <Receipt /> Facture
  </Button>
  <FactureModal
    open={factureModalOpen}
    onOpenChange={setFactureModalOpen}
    qualificationId={selectedQualificationId} // ou proposer un sélecteur
  />
  ```

#### 2.4 `components/ui/Toast.tsx` (VERIFY/REUSE)
- Pour notifications succès/erreur
- Doit afficher: `Facture FA-2025-0001 générée avec succès !`

---

### Phase 3️⃣ : Backend (Next.js API)

#### 3.1 `app/api/qualifications/[id]/facture/route.ts` (NEW)
- **Méthode** : `POST /api/qualifications/[id]/facture`
- **Authentification** : JWT (session user)
- **Payload d'entrée** (JSON) :
  ```json
  {
    "factureStatus": "emise" | "acquittee",
    "sendEmail": true,
    "sendTelegram": false
  }
  ```
- **Logique** :
  1. Vérifier que l'utilisateur est authentifié (middleware auth)
  2. Récupérer la qualification et l'entreprise
  3. Générer numéro : `SELECT next_facture_numero()`
  4. Créer/mettre à jour `qualification` : `facture_status='generating'`, `facture_numero=FA-...`
  5. Appeler webhook n8n avec payload signé
  6. Retourner `{ success: true, factureNumero, jobId }`
- **Erreurs** : 400 (bad input), 401 (auth), 404 (not found), 500 (n8n webhook fail)
- **Réponse succès** :
  ```json
  {
    "success": true,
    "factureNumero": "FA-2025-0001",
    "jobId": "uuid-of-webhook-call",
    "message": "Génération en cours..."
  }
  ```

#### 3.2 `lib/facture.ts` (NEW)
- Helpers serveur :
  - `generateFactureNumero()` : appel RPC `next_facture_numero()`
  - `createOrUpdateDocument()` : insérer/mettre à jour ligne `document`
  - `updateQualificationFactureStatus()` : set `facture_status`, `facture_numero`
  - `callN8nWebhook()` : POST vers n8n avec HMAC signature
  - `buildWebhookPayload()` : construire payload pour n8n

#### 3.3 `lib/webhook.ts` (NEW)
- Utilitaires de signature webhook :
  - `signPayload(payload: object, secret: string): string` → HMAC SHA256
  - `verifyWebhookSignature(payload, signature, secret): boolean`

#### 3.4 `lib/supabase/server.ts` (MODIFY)
- Vérifier que les helpers RPC sont disponibles
- Exemple appel :
  ```typescript
  const { data, error } = await supabase.rpc('next_facture_numero');
  ```

---

### Phase 4️⃣ : n8n Workflow & Webhooks

#### 4.1 `n8n/workflows/generate_facture_emise.json` (NEW ou ADAPT)
- **Trigger** : Webhook POST `/generate-facture`
- **Payload attendu** :
  ```json
  {
    "qualification_id": "uuid",
    "entreprise_id": "uuid",
    "entreprise_name": "...",
    "contact_email": "...",
    "facture_numero": "FA-2025-0001",
    "format_encart": "6X4",
    "prix_total": 350,
    "mois_parution": "Janvier 2026",
    "date_echeance": "2025-12-31",
    "status": "emise" | "acquittee",
    "send_email": true,
    "signature": "hmac-sha256-here"
  }
  ```
- **Étapes** :
  1. ✅ Valider signature HMAC
  2. 📋 Récupérer détails qualification + entreprise depuis Supabase
  3. 📝 Générer HTML facture (template selon statut: émise/acquittée)
  4. 🖨️ Convertir HTML → PDF via Gotenberg
  5. ☁️ Upload PDF vers Supabase Storage (`factures/FA-2025-0001.pdf`)
  6. 🗂️ Créer/mettre à jour ligne `document` (type='facture', url, storage_path)
  7. 📧 Envoyer email (optionnel, si `send_email=true`)
  8. ✉️ Envoyer Telegram (optionnel, si `send_telegram=true`)
  9. ✅ Mettre à jour `qualification`: `facture_status='ready'`, `facture_url`, `facture_generated_at`
  10. 📤 Retourner au webhook appelant : `{ success: true, facture_url, ... }`

#### 4.2 `n8n/workflows/send_facture_email.json` (NEW ou REUSE)
- Composant optionnel qui envoie email avec PDF attaché
- Template Gmail : "facture_emise" ou "facture_acquittee"

#### 4.3 `n8n/workflows/send_facture_telegram.json` (NEW ou REUSE)
- Composant optionnel : poster message + lien dans Telegram

---

### Phase 5️⃣ : Tests & CI/CD

#### 5.1 `tests/api/qualifications-facture.test.ts` (NEW)
- Tests unitaires de l'endpoint `POST /api/qualifications/[id]/facture`
- Mock Supabase, n8n webhook
- Cas : succès, erreur qualif inexistante, erreur webhook, timeout

#### 5.2 `tests/components/facture-modal.test.tsx` (NEW)
- Tests React : ouverture modal, clique bouton, appel API, affichage états

#### 5.3 `playwright/e2e/facture-flow.spec.ts` (NEW)
- Scénario complet : ouvrir page entreprise → cliquer Facture → modal → confirmer → poll succès

#### 5.4 `.github/workflows/deploy.yml` (MODIFY)
- Ajouter étape : `pnpm test:api` avant merge
- Optionnel : `pnpm exec supabase db push` sur `main` avec confirmation

---

## 🔄 Séquence d'Appels (Flux Complet)

```
[Frontend]
1. Utilisateur clique "Facture"
   ↓
2. Modal s'ouvre (FactureModal.tsx)
   ↓
3. Utilisateur choisit "Émise" ou "Acquittée"
   ↓
4. Clique "Générer"
   ↓
5. Hook (useGenerateFacture) POST vers API
   
[Backend Next.js]
6. Endpoint POST /api/qualifications/[id]/facture
   ↓
7. Récupère qualification + entreprise
   ↓
8. Appel RPC : SELECT next_facture_numero() → "FA-2025-0001"
   ↓
9. Met à jour qualification: facture_status='generating', facture_numero='FA-2025-0001'
   ↓
10. Construit payload, signe avec HMAC
   ↓
11. POST vers n8n webhook avec payload signé
   ↓
12. Retourne au client : { jobId: "...", factureNumero: "FA-2025-0001" }

[Frontend - Polling]
13. Hook commence à poller facture_status toutes les 2s
   ↓
14. Affiche loading spinner

[n8n Workflow]
15. Webhook reçoit payload
   ↓
16. Valide signature HMAC
   ↓
17. Récupère données Supabase
   ↓
18. Construit HTML facture (template émise/acquittée)
   ↓
19. Gotenberg : HTML → PDF
   ↓
20. Minio/Supabase: Upload PDF
   ↓
21. Crée document row (type='facture')
   ↓
22. Envoie email (optionnel)
   ↓
23. Met à jour qualification: facture_status='ready', facture_url='...', facture_generated_at=NOW()
   ↓
24. Répond au webhook: { success: true }

[Frontend - Poll Détecte]
25. Hook détecte facture_status='ready'
   ↓
26. Affiche succès: "Facture FA-2025-0001 générée !"
   ↓
27. Modal se ferme automatiquement (ou bouton "Fermer")
```

---

## 🛡️ Sécurité

### Authentification & Autorisation
- ✅ Toutes les routes API nécessitent JWT valide (middleware auth)
- ✅ Vérifier que `user.id` = `qualification.user_id` (RLS Supabase aide)

### Signature Webhook
- ✅ Payload signé avec HMAC-SHA256 (secret dans `.env`)
- ✅ n8n valide la signature avant traitement
- ✅ Si signature invalide : répondre 403 Forbidden

### Rate Limiting (Optionnel Phase 2)
- Limiter à 1 génération/qualification/jour
- Ou 10 générations/utilisateur/jour

### Stockage des Secrets
- `WEBHOOK_SECRET` stocké dans `.env.local` (non commité)
- `SUPABASE_SERVICE_ROLE_KEY` stocké dans `.env` (serveur uniquement)

---

## 📊 État des Ressources

| Phase | Fichier | Statut | Créé par | Notes |
|-------|---------|--------|----------|-------|
| Doc | `docs/facture-modal-flow.md` | 🔴 À créer | Agent | Spec détaillée |
| Doc | `docs/facture-webhook-spec.md` | 🔴 À créer | Agent | Webhook contract |
| Frontend | `components/entreprises/FactureModal.tsx` | 🔴 À créer | Agent | Modal Shadcn |
| Frontend | `hooks/useGenerateFacture.ts` | 🔴 À créer | Agent | Hook polling |
| Frontend | `app/.../page.tsx` | 🟡 À modifier | Agent | Ajouter modal |
| Backend | `app/api/qualifications/.../facture/route.ts` | 🔴 À créer | Agent | Endpoint POST |
| Backend | `lib/facture.ts` | 🔴 À créer | Agent | Helpers |
| Backend | `lib/webhook.ts` | 🔴 À créer | Agent | Signing/verify |
| Backend | `.env.example` | 🟡 À modifier | Agent | Ajouter vars |
| n8n | `n8n/workflows/generate_facture_emise.json` | 🔴 À créer | You | Workflow |
| Tests | `tests/api/qualifications-facture.test.ts` | 🔴 À créer | Agent | Tests API |
| Tests | `tests/components/facture-modal.test.tsx` | 🔴 À créer | Agent | Tests React |
| Tests | `playwright/e2e/facture-flow.spec.ts` | 🔴 À créer | Agent | E2E |

---

## ✅ Checklist de Validation (Avant Implémentation)

- [ ] Schéma modal approuvé (2 statuts: Émise/Acquittée)
- [ ] Payload webhook validé par n8n team
- [ ] Endpoints API et erreurs approuvées
- [ ] Template HTML facture validé (émise vs acquittée)
- [ ] Variables d'environnement listées
- [ ] Plan de sécurité (HMAC, auth) approuvé
- [ ] Ordre des phases validé
- [ ] Responsabilités assignées (Frontend/Backend/n8n)

---

## 📅 Estimation (Jours / Complexité)

| Phase | Tâches | Durée | Difficulté |
|-------|--------|-------|-----------|
| 1 | Docs + Specs | 0.5j | Facile |
| 2 | Modal + Hooks + Wiring | 1.5j | Moyen |
| 3 | API + Helpers + Supabase | 1.5j | Moyen |
| 4 | n8n Workflow | 1j | Moyen (dépend de n8n skills) |
| 5 | Tests + CI | 1j | Facile-Moyen |
| **Total** | | **5.5j** | |

---

## 🚀 Prochaines Étapes

1. **Validation du plan** : Vérifier avec stakeholders (Product, n8n, Ops)
2. **Création docs Phase 1** : `facture-modal-flow.md` et `facture-webhook-spec.md`
3. **Implémentation Phases 2-5** : Commencer par Frontend (modal), puis Backend, puis n8n

---

## 📞 Contacts & Support

- **Questions Frontend** : Developer
- **Questions Backend** : Developer
- **Questions n8n** : n8n Team
- **Questions Ops** : DevOps

