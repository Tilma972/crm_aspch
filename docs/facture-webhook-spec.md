# Spécification Webhook n8n : Génération de Factures

**Date**: 21 décembre 2025  
**Version**: 1.0  
**État**: 📋 Spécification détaillée

---

## 🎯 Vue d'ensemble

Ce document définit le **contrat exact** du webhook n8n qui génère les factures.

- **Endpoint** : `POST /webhook/generate-facture` (n8n)
- **Appelé par** : Backend Next.js (`lib/facture.ts`)
- **Sécurité** : HMAC-SHA256 signature (optionnel mais recommandé)
- **Timeout** : 30s par défaut (n8n peut être plus lent)

---

## 📨 Format de la Requête

### Headers
```http
POST /webhook/generate-facture HTTP/1.1
Content-Type: application/json
X-Webhook-Signature: hmac-sha256=<signature>
X-Webhook-Timestamp: 1703162400000
User-Agent: crm-aspch/1.0
```

### Corps (Payload)

```json
{
  "event": "facture.generate",
  "timestamp": "2025-12-21T14:30:00.000Z",
  
  "qualification": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "statut": "Nouveau",
    "format_encart": "6X4",
    "prix_total": 350.00,
    "mois_parution": "Janvier 2026",
    "paiement_echelonne": false,
    "mode_paiement": "Chèque",
    "date_contact": "2025-12-10",
    "commentaires": "Client important - relancer si non réponse"
  },

  "entreprise": {
    "id": "abc12345-f89b-12d3-a456-426614174111",
    "nom": "Entreprise XYZ SARL",
    "email": "contact@entreprise-xyz.com",
    "telephone": "04 67 88 22 33",
    "adresse": "123 Rue de la République",
    "ville": "Clermont-l'Hérault",
    "cp": "34800"
  },

  "facture": {
    "numero": "FA-2025-0001",
    "status": "emise" | "acquittee",
    "date_emission": "2025-12-21",
    "date_echeance": "2026-01-31",
    "generated_by_user": "user-uuid-here"
  },

  "options": {
    "send_email": true,
    "send_telegram": false,
    "email_template": "facture_emise" | "facture_acquittee",
    "telegram_chat_id": "12345678"  // Optionnel
  },

  "storage": {
    "bucket": "documents",
    "path": "factures/FA-2025-0001.pdf",
    "visibility": "private"
  }
}
```

### Détail des Champs

| Champ | Type | Requis | Notes |
|-------|------|--------|-------|
| `event` | string | ✅ | Toujours `"facture.generate"` |
| `timestamp` | string (ISO8601) | ✅ | Temps d'appel pour anti-replay |
| `qualification.id` | UUID | ✅ | Clé pour audit trail |
| `qualification.statut` | string | ✅ | État courant (Nouveau, Qualifié, etc.) |
| `qualification.format_encart` | enum | ✅ | "6X4", "6X8", "12X4", "12PARUTIONS" |
| `qualification.prix_total` | decimal | ✅ | Ex: 350.00 |
| `qualification.mois_parution` | string | ✅ | Ex: "Janvier 2026" |
| `qualification.paiement_echelonne` | boolean | ✅ | Sinon champ `echeances` |
| `qualification.mode_paiement` | enum | ✅ | "Chèque", "Virement", "CB", "Espèces" |
| `qualification.date_contact` | date | ✅ | Pour historique |
| `qualification.commentaires` | string | ❌ | Notes libres |
| `entreprise.id` | UUID | ✅ | Clé |
| `entreprise.nom` | string | ✅ | Nom complet |
| `entreprise.email` | email | ✅ | Pour envoi facture |
| `entreprise.telephone` | string | ❌ | Optionnel |
| `entreprise.adresse` | string | ✅ | Ligne 1 |
| `entreprise.ville` | string | ✅ | Ville |
| `entreprise.cp` | string | ✅ | Code postal |
| `facture.numero` | string | ✅ | Ex: "FA-2025-0001" (déjà généré) |
| `facture.status` | enum | ✅ | "emise" ou "acquittee" (déduit du champ payment) |
| `facture.date_emission` | date | ✅ | Aujourd'hui généralement |
| `facture.date_echeance` | date | ✅ | Ex: +30 jours si non payée |
| `facture.generated_by_user` | UUID | ✅ | Qui a déclenché |
| `options.send_email` | boolean | ✅ | Envoyer mail après génération |
| `options.send_telegram` | boolean | ✅ | Envoyer vers Telegram |
| `options.email_template` | string | ✅ | "facture_emise" ou "facture_acquittee" |
| `options.telegram_chat_id` | string | ❌ | ID du chat Telegram (si applicable) |
| `storage.bucket` | string | ✅ | Nom du bucket Supabase |
| `storage.path` | string | ✅ | Chemin du PDF dans le bucket |
| `storage.visibility` | enum | ✅ | "private" ou "public" |

### Exemple Complet

```json
{
  "event": "facture.generate",
  "timestamp": "2025-12-21T14:30:00.000Z",
  
  "qualification": {
    "id": "qual-123456",
    "statut": "Nouveau",
    "format_encart": "6X4",
    "prix_total": 350.00,
    "mois_parution": "Janvier 2026",
    "paiement_echelonne": false,
    "mode_paiement": "Chèque",
    "date_contact": "2025-12-10",
    "commentaires": "VIP - suivi particulier"
  },

  "entreprise": {
    "id": "ent-123456",
    "nom": "Pompiers Volontaires Clermont",
    "email": "tresorier@pompiers.local",
    "telephone": "04 67 88 22 33",
    "adresse": "Centre de Secours, Route de Lodève",
    "ville": "Clermont-l'Hérault",
    "cp": "34800"
  },

  "facture": {
    "numero": "FA-2025-0001",
    "status": "emise",
    "date_emission": "2025-12-21",
    "date_echeance": "2026-01-31",
    "generated_by_user": "admin-user-uuid"
  },

  "options": {
    "send_email": true,
    "send_telegram": false,
    "email_template": "facture_emise",
    "telegram_chat_id": null
  },

  "storage": {
    "bucket": "documents",
    "path": "factures/FA-2025-0001.pdf",
    "visibility": "private"
  }
}
```

---

## 🔐 Signature HMAC

### Algorithme
- **Type** : HMAC-SHA256
- **Secret** : Variable d'env `WEBHOOK_SECRET` (côté Next.js et n8n)
- **Message** : Body JSON sérialisé (déterministe)

### Calcul (Côté Next.js)

```typescript
import crypto from 'crypto';

function signPayload(payload: object, secret: string): string {
  const jsonString = JSON.stringify(payload); // Déterministe !
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(jsonString);
  return hmac.digest('hex');
}

// Usage
const payload = { /* ... */ };
const signature = signPayload(payload, process.env.WEBHOOK_SECRET!);

// Dans les headers
headers['X-Webhook-Signature'] = `sha256=${signature}`;
```

### Vérification (Côté n8n)

```javascript
// Nœud Function n8n
const payload = $input.all()[0].json.body; // Récupère le body
const signature = $input.headers['x-webhook-signature'];

const crypto = require('crypto');
const secret = process.env.WEBHOOK_SECRET;

function verifySignature(body, signature, secret) {
  const jsonString = JSON.stringify(body); // DOIT être identique au calcul
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(jsonString);
  const computed = `sha256=${hmac.digest('hex')}`;
  
  // Comparison en temps constant
  return crypto.timingSafeEqual(
    Buffer.from(computed),
    Buffer.from(signature)
  );
}

if (!verifySignature(payload, signature, secret)) {
  throw new Error('Signature invalide - webhook rejeté');
}

return { verified: true };
```

---

## 📤 Format de la Réponse

### Succès (200)

```json
{
  "success": true,
  "event": "facture.generate",
  "facture_numero": "FA-2025-0001",
  "pdf_url": "https://storage.supabase.co/storage/v1/object/public/documents/factures/FA-2025-0001.pdf",
  "pdf_storage_path": "factures/FA-2025-0001.pdf",
  "facture_status": "ready",
  "generated_at": "2025-12-21T14:30:15.000Z",
  "document_id": "doc-uuid-here",
  "email_sent": true,
  "email_sent_at": "2025-12-21T14:30:16.000Z",
  "telegram_sent": false,
  "message": "Facture générée et stockée avec succès"
}
```

### Erreur (4xx/5xx)

```json
{
  "success": false,
  "event": "facture.generate",
  "error": {
    "code": "GOTENBERG_TIMEOUT",
    "message": "Conversion HTML→PDF n'a pas abouti en 30s",
    "details": "Service Gotenberg non disponible"
  },
  "facture_numero": "FA-2025-0001",
  "timestamp": "2025-12-21T14:30:35.000Z"
}
```

### Codes d'Erreur Attendus

| Code | HTTP | Signification | Action Recommandée |
|------|------|---------------|--------------------|
| `SIGNATURE_INVALID` | 403 | HMAC signature invalide | Vérifier le secret |
| `PAYLOAD_INVALID` | 400 | Champs manquants/invalides | Logs (vérifier structure) |
| `GOTENBERG_TIMEOUT` | 504 | PDF conversion trop lente | Retry (Gotenberg peut être down) |
| `STORAGE_UPLOAD_FAILED` | 500 | Upload Supabase échoué | Retry |
| `DB_UPDATE_FAILED` | 500 | Mise à jour `qualification` échouée | Retry / Rollback |
| `EMAIL_SEND_FAILED` | 500 | Envoi email échoué (non-critique) | Log, continue |
| `TELEGRAM_SEND_FAILED` | 500 | Envoi Telegram échoué (non-critique) | Log, continue |

---

## 🔄 Workflow n8n Attendu

### Étapes Typiques

```
1. Webhook Trigger (POST)
   ↓
2. Valider Signature HMAC
   ↓
3. Récupérer Données Supabase (optionnel, si dénormalisé)
   ↓
4. Générer HTML Facture (template Émise ou Acquittée)
   ↓
5. Gotenberg : HTML → PDF
   ↓
6. Upload PDF → Supabase Storage
   ↓
7. Créer/Mettre à jour `document` row
   ↓
8. [Optionnel] Envoyer Email
   ↓
9. [Optionnel] Envoyer Telegram
   ↓
10. Mettre à jour `qualification`:
    - facture_status = 'ready'
    - facture_url = <pdf_url>
    - facture_generated_at = NOW()
   ↓
11. Respond to Webhook (JSON succès/erreur)
```

### Conditions de Sortie Prévues

- ✅ **Succès** : Fichier créé, document enregistré, qualification mise à jour
- ⚠️ **Succès Partiel** : PDF généré et stocké, mais email échoué (continuer quand même)
- ❌ **Erreur Critique** : HMAC invalide, payload mal formée → rejeter
- ❌ **Erreur Retryable** : Timeout Gotenberg → accepter retry automatique (n8n le fera)

---

## ⏱️ Timing & Timeouts

| Opération | Timeout | Notes |
|-----------|---------|-------|
| Gotenberg (HTML→PDF) | 30s | Peut être lent si PDF complexe |
| Supabase (DB query) | 10s | Normal |
| Supabase (Storage upload) | 20s | Dépend de la taille PDF |
| n8n Total Workflow | 60s | N8n auto-timeout à 60s par défaut |
| Next.js Polling | 60s | Client-side, abandon après 60s |

**Recommandation** : Configurer n8n avec `webhook.timeout = 60000` (ms).

---

## 🔍 Logs & Debugging

### Logs à Implémenter (n8n)

```
[INFO] Webhook reçu: facture.generate for qual-123456
[INFO] Signature validée ✓
[INFO] HTML généré (2.1 KB)
[INFO] PDF créé par Gotenberg (150 KB)
[INFO] PDF uploadé → factures/FA-2025-0001.pdf
[INFO] Ligne document créée → doc-uuid
[INFO] qualification.facture_status = 'ready'
[INFO] Email envoyé à contact@entreprise-xyz.com
[INFO] Webhook répondu en 12.3s ✓
```

### Logs à Implémenter (Next.js)

```
[INFO] POST /api/qualifications/qual-123456/facture
[INFO] Utilisateur authentifié: user-uuid
[INFO] RPC next_facture_numero() → FA-2025-0001
[INFO] Qualification mise à jour: facture_status=generating
[INFO] Webhook appelé: https://n8n.../webhook/generate-facture
[INFO] Webhook répondé: { success: true, ... }
[INFO] Réponse clients: jobId=..., message=...
```

---

## 🧪 Cas de Test

### Test 1 : Succès Complet (Émise)
- ✅ Appel webhook avec status="emise"
- ✅ Vérifier PDF généré et stocké
- ✅ Vérifier `qualification.facture_status = 'ready'`
- ✅ Vérifier email envoyé

### Test 2 : Succès Complet (Acquittée)
- ✅ Appel webhook avec status="acquittee"
- ✅ Vérifier template "facture_acquittee" utilisé
- ✅ Vérifier "ACQUITTÉE" visible dans PDF

### Test 3 : Signature Invalide
- ✅ Appel webhook avec mauvaise signature
- ✅ Vérifier rejet 403

### Test 4 : Payload Manquante
- ✅ Appel webhook sans champ `entreprise.email`
- ✅ Vérifier rejet 400

### Test 5 : Gotenberg Timeout
- ✅ Simuler timeout Gotenberg
- ✅ Vérifier réponse erreur 504
- ✅ Vérifier `qualification.facture_status = 'error'`

### Test 6 : Email Fail (Non-Critique)
- ✅ Simuler erreur envoi email
- ✅ Vérifier PDF quand même créé
- ✅ Vérifier `email_sent = false` en réponse

---

## 🔗 Intégration avec d'Autres Services

### Supabase
- **Table `qualification`** : Update `facture_*` fields
- **Table `document`** : Insert/Update rows type='facture'
- **Storage** : Upload PDF dans bucket "documents"
- **RLS** : n8n doit utiliser `service_role` key (accès total)

### Gotenberg
- **Endpoint** : `POST /forms/chromium/convert/html`
- **Auth** : HTTP Basic si configuré
- **Input** : Fichier HTML en multipart-form
- **Output** : PDF binary

### Gmail (Optionnel)
- **Template** : n8n Gmail node avec template
- **To** : `entreprise.email`
- **Subject** : "Facture {numero} - Calendrier Pompiers 2026"
- **Attachments** : PDF généré

### Telegram (Optionnel)
- **Bot Token** : Variable d'env
- **Chat ID** : Du payload ou hardcodé
- **Message** : "Facture {numero} générée - {link}"

---

## 📝 Checklist Implémentation n8n

- [ ] Créer nœud Webhook Trigger POST `/webhook/generate-facture`
- [ ] Ajouter nœud Function pour valider signature HMAC
- [ ] Ajouter nœud Supabase pour récupérer données (optionnel)
- [ ] Ajouter nœud Code/HTTP pour appel Gotenberg
- [ ] Ajouter nœud Supabase pour upload Storage
- [ ] Ajouter nœud Supabase pour créer `document` row
- [ ] Ajouter nœud Gmail (optionnel) pour email
- [ ] Ajouter nœud Telegram (optionnel)
- [ ] Ajouter nœud Supabase pour update `qualification`
- [ ] Ajouter nœud Response pour webhook
- [ ] Tester E2E avec signature
- [ ] Tester timeout scenarios
- [ ] Tester error cases (mail fail, etc)
- [ ] Déployer et activer webhook

