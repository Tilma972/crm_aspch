# Phase 4: N8N Workflow - Implémentation du Workflow de Génération de Facture

## Objectif
Créer un workflow n8n qui reçoit un payload de l'API `/api/qualifications/[id]/facture` (POST), génère un PDF, l'upload à Supabase Storage, met à jour la base de données, et envoie des notifications optionnelles.

## Configuration n8n

### Étape 1: Webhook HTTP (Déclencheur)
- **Type**: HTTP Request (Webhook)
- **URL Relative**: `/webhook/generate-facture-emise`
- **Méthode**: POST
- **Authentication**: Header-based (n8n Internal)
  - L'en-tête `Authorization` contient le token défini dans `N8N_WEBHOOK_AUTH`

### Étape 2: Récupérer les variables d'environnement
- **Type**: Set (ou Function si besoin)
- **Variables**:
  - `SUPABASE_URL` (depuis env)
  - `SUPABASE_SERVICE_KEY` (depuis env)
  - `GOTENBERG_URL` (depuis env ou config)

### Étape 3: Récupérer les données de qualification (optionnel - déjà dans payload)
- **Type**: Supabase Query
- Peut être omis si le payload complet est envoyé depuis l'API

### Étape 4: Construire le HTML du modèle de facture
- **Type**: Function Node ou Template String
- **Inputs**:
  - `qualification.format_encart`
  - `qualification.statut`
  - `qualification.prix_total`
  - `qualification.mois_parution`
  - `entreprise.nom`
  - `entreprise.adresse`
  - `entreprise.ville`
  - `entreprise.cp`
  - `entreprise.email`
  - `facture.numero`
  - `facture.status` (Émise/Acquittée)
  - `facture.date_emission`
  - `facture.date_echeance`

**Template HTML à générer**:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .company-info { margin-bottom: 20px; }
    .invoice-details { margin: 20px 0; border: 1px solid #ddd; padding: 10px; }
    .status-badge { 
      display: inline-block; 
      padding: 5px 10px; 
      border-radius: 3px;
      font-weight: bold;
    }
    .status-emise { background-color: #e3f2fd; color: #1976d2; }
    .status-acquittee { background-color: #e8f5e9; color: #388e3c; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
    th { background-color: #f5f5f5; }
    .total { font-weight: bold; font-size: 1.2em; }
  </style>
</head>
<body>
  <div class="header">
    <h1>FACTURE</h1>
    <p>Numéro: <strong>{{facture.numero}}</strong></p>
    <span class="status-badge status-{{facture.status}}">{{facture.status_label}}</span>
  </div>

  <div class="company-info">
    <h3>{{entreprise.nom}}</h3>
    <p>{{entreprise.adresse}}<br/>{{entreprise.cp}} {{entreprise.ville}}</p>
    <p>Email: {{entreprise.email}}</p>
  </div>

  <div class="invoice-details">
    <p><strong>Date d'émission:</strong> {{facture.date_emission}}</p>
    <p><strong>Date d'échéance:</strong> {{facture.date_echeance}}</p>
  </div>

  <table>
    <tr>
      <th>Description</th>
      <th>Montant</th>
    </tr>
    <tr>
      <td>{{qualification.format_encart}} - {{qualification.mois_parution}}</td>
      <td>{{qualification.prix_total}} €</td>
    </tr>
    <tr class="total">
      <td>TOTAL</td>
      <td>{{qualification.prix_total}} €</td>
    </tr>
  </table>
</body>
</html>
```

### Étape 5: Convertir HTML en PDF via Gotenberg
- **Type**: HTTP Request
- **URL**: `{{$env.GOTENBERG_URL}}/forms/chromium/convert/html`
- **Méthode**: POST
- **Body (multipart/form-data)**:
  - `files`: HTML template (comme fichier)
  - `paperFormat`: A4
  - `marginTop`: 10
  - `marginBottom`: 10
  - `marginLeft`: 10
  - `marginRight`: 10

**Réponse**: Binary PDF

### Étape 6: Upload PDF à Supabase Storage
- **Type**: Supabase (Upload to Storage)
- **Configuration**:
  - **Bucket**: `factures` (créer si n'existe pas)
  - **Path**: `{{$now.getFullYear()}}/{{qualification.entreprise_id}}/FA-{{facture.numero}}.pdf`
  - **File**: Binary PDF from step 5
  - **Access Level**: Private (RLS)

**Réponse**: URL du fichier

### Étape 7: Mettre à jour la qualification en BD (Supabase)
- **Type**: Supabase Query
- **Requête**: UPDATE qualification
  - `facture_status = 'ready'`
  - `facture_numero = {{facture.numero}}`
  - `facture_url = {{step6.output.publicUrl}}`
  - `facture_generated_at = NOW()`
  - `facture_error = NULL`
- **WHERE**: `id = {{qualification.id}}`

### Étape 8: Créer un enregistrement dans la table `document`
- **Type**: Supabase Query
- **Requête**: INSERT INTO document
  - `type = 'facture'`
  - `qualification_id = {{qualification.id}}`
  - `entreprise_id = {{qualification.entreprise_id}}`
  - `numero = {{facture.numero}}`
  - `url = {{step6.output.publicUrl}}`
  - `status = {{facture.status}}`
  - `created_by = {{qualification.generated_by_user}}`

### Étape 9: Envoyer email (conditionnel)
- **Type**: Email ou SMTP
- **Condition**: `{{qualification.send_email === true}}`
- **À**: `{{entreprise.email}}`
- **Sujet**: `Facture {{facture.numero}} - {{facture.status_label}}`
- **Corps**:
  ```
  Bonjour {{entreprise.nom}},

  Votre facture {{facture.numero}} a été générée et est en pièce jointe.

  Montant: {{qualification.prix_total}} €
  Date: {{facture.date_emission}}
  Statut: {{facture.status_label}}

  Cordialement,
  ASPCH
  ```
- **Attachments**: PDF from step 5

### Étape 10: Envoyer notification Telegram (conditionnel)
- **Type**: Telegram Message
- **Condition**: `{{qualification.send_telegram === true}}`
- **Chat ID**: Depuis config n8n
- **Message**:
  ```
  📄 Facture générée
  Numéro: {{facture.numero}}
  Entreprise: {{entreprise.nom}}
  Montant: {{qualification.prix_total}} €
  Statut: {{facture.status_label}}
  ```

### Étape 11: Répondre au webhook
- **Type**: HTTP Response
- **Status Code**: 200
- **Body**:
  ```json
  {
    "success": true,
    "message": "Facture générée avec succès",
    "facture_numero": "{{facture.numero}}",
    "facture_url": "{{step6.output.publicUrl}}",
    "timestamp": "{{$now.toISOString()}}"
  }
  ```

## Gestion des erreurs

### Try-Catch Global
- Si une étape échoue:
  1. Mettre à jour `facture_status = 'error'`
  2. Enregistrer le message d'erreur dans `facture_error`
  3. Retourner HTTP 500 avec le message d'erreur

### Erreurs spécifiques à gérer:
- **Authentification webhook**: 401
- **Payload invalide**: 400
- **Qualification introuvable**: 404
- **Erreur Gotenberg**: 503 (retry)
- **Erreur Supabase**: 503
- **Erreur Email/Telegram**: Log mais ne pas bloquer

## Payload attendu du webhook

```json
{
  "qualification_id": "uuid",
  "facture": {
    "numero": "FA-2025-0001",
    "status": "emise|acquittee",
    "date_emission": "2025-12-21",
    "date_echeance": "2026-01-20"
  },
  "qualification": {
    "id": "uuid",
    "entreprise_id": "uuid",
    "format_encart": "1/4 de page",
    "statut": "Payé",
    "prix_total": 450.00,
    "mois_parution": "Janvier 2025",
    "paiement_echelonne": false,
    "mode_paiement": "Virement",
    "date_contact": "2025-12-01",
    "commentaires": "...",
    "generated_by_user": "user-uuid",
    "send_email": false,
    "send_telegram": false
  },
  "entreprise": {
    "id": "uuid",
    "nom": "Nom de l'entreprise",
    "adresse": "123 rue exemple",
    "ville": "Paris",
    "cp": "75001",
    "email": "contact@entreprise.fr",
    "telephone": "+33..."
  }
}
```

## Variables d'environnement n8n à configurer

```
N8N_WEBHOOK_AUTH=Bearer <token-secret>
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=<service-key>
GOTENBERG_URL=http://localhost:3000
SMTP_HOST=smtp.provider.com
SMTP_PORT=587
SMTP_USER=email@example.com
SMTP_PASSWORD=password
TELEGRAM_BOT_TOKEN=xxx
TELEGRAM_CHAT_ID=yyy
```

## Tests

1. **Test du webhook**: 
   ```bash
   curl -X POST http://localhost:5678/webhook/generate-facture-emise \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d @payload.json
   ```

2. **Vérifier**: 
   - PDF généré dans Supabase Storage
   - `qualification.facture_status = 'ready'`
   - `qualification.facture_numero` défini
   - Enregistrement créé dans `document`

## Dépendances
- Gotenberg (pour conversion HTML→PDF)
- Supabase SDK n8n
- SMTP ou SendGrid (pour email)
- Telegram Bot API (optionnel)
