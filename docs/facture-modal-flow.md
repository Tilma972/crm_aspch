# Spécification Détaillée : Flux Modal de Génération de Factures

**Date**: 21 décembre 2025  
**Version**: 1.0  
**État**: 📋 Spécification détaillée

---

## 1️⃣ Vue d'ensemble UX

### Scénario Utilisateur
1. Utilisateur consulte la fiche d'une entreprise (`/entreprises/[id]`)
2. Clique sur le bouton **"Facture"** dans le footer sticky
3. Une **modal de confirmation** s'ouvre
4. Utilisateur choisit le **statut de paiement** (Émise ou Acquittée)
5. Clique **"Générer la facture"**
6. La modal affiche un **spinner** ("En cours de génération...")
7. Après 2-5s, **succès** : affiche numéro généré (`FA-2025-0001`)
8. Modal se ferme automatiquement ou utilisateur clique "Fermer"

### États de la Modal

```
┌─────────────────────────────────────────┐
│        Générer la Facture               │
├─────────────────────────────────────────┤
│                                         │
│  Sélectionnez le statut de paiement     │
│  actuel pour initialiser le workflow.   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🟠 Émise                        │   │
│  │    EN ATTENTE DE PAIEMENT       │   │
│  │                              → │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ ✅ Acquittée                    │   │
│  │    PAIEMENT REÇU                │   │
│  │                              → │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────┐  ┌──────────────┐    │
│  │  Annuler    │  │  Générer     │    │
│  └─────────────┘  └──────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

#### État 1 : Initial (Idle)
- Deux boutons radio : "Émise" (défaut) / "Acquittée"
- Boutons CTA : "Annuler" (close) / "Générer" (enabled)
- Message descriptif visible

#### État 2 : Loading
```
┌─────────────────────────────────────────┐
│        Génération en cours...           │
├─────────────────────────────────────────┤
│                                         │
│            ⏳ Spinner rotatif            │
│                                         │
│  Veuillez patienter...                  │
│  Génération du PDF en cours.            │
│                                         │
│  (Boutons désactivés)                   │
│                                         │
└─────────────────────────────────────────┘
```

#### État 3 : Success
```
┌─────────────────────────────────────────┐
│        ✅ Facture générée !             │
├─────────────────────────────────────────┤
│                                         │
│  Numéro : FA-2025-0001                  │
│  Statut : READY                         │
│  Généré : 21 déc 2025 à 14:30           │
│                                         │
│  ✅ PDF disponible dans Supabase        │
│  ✅ Entrée DB créée                     │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ Fermer & Voir la Facture         │  │
│  └──────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

#### État 4 : Error
```
┌─────────────────────────────────────────┐
│        ❌ Erreur lors de la génération  │
├─────────────────────────────────────────┤
│                                         │
│  Code d'erreur : WEBHOOK_TIMEOUT       │
│                                         │
│  Message :                              │
│  "Le serveur n'a pas répondu à temps.   │
│   Veuillez réessayer dans quelques      │
│   minutes."                             │
│                                         │
│  ┌────────────┐  ┌────────────────┐   │
│  │ Retour     │  │ Réessayer      │   │
│  └────────────┘  └────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

## 2️⃣ Composant React (`FactureModal.tsx`)

### Props Interface
```typescript
interface FactureModalProps {
  open: boolean;                    // Contrôle ouverture/fermeture
  onOpenChange: (open: boolean) => void;  // Callback fermeture
  qualificationId: string;          // UUID de la qualification
  entrepriseId: string;             // UUID de l'entreprise (optionnel, peut venir de qual)
  onSuccess?: (facture: FactureResult) => void;  // Callback après succès
}

interface FactureResult {
  factureNumero: string;            // Ex: "FA-2025-0001"
  factureUrl: string;               // URL du PDF
  generatedAt: string;              // ISO timestamp
  status: 'emise' | 'acquittee';
}
```

### États Internes
```typescript
type ModalState = 'idle' | 'loading' | 'success' | 'error';

interface ModalData {
  state: ModalState;
  selectedStatus: 'emise' | 'acquittee';   // Défaut: 'emise'
  facture?: FactureResult;
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
}
```

### Comportements

#### Ouverture
- Modal s'ouvre avec état `idle`
- "Émise" pré-sélectionné
- Focus sur le bouton "Générer"

#### Clic "Générer"
1. Valider que `qualificationId` existe
2. Appeler `useGenerateFacture(qualificationId, { status: selectedStatus })`
3. Passer à l'état `loading`
4. Hook commence le polling

#### Polling (depuis le hook)
- Toutes les 2s : GET `/api/qualifications/[id]/status`
- Récupère `qualification.facture_status` depuis Supabase
- Si `facture_status === 'ready'` → état `success`
- Si `facture_status === 'error'` → état `error`
- Timeout après 60s → état `error` avec message "Génération trop longue"

#### Succès
- Affiche numéro généré
- Affiche timestamp
- Bouton "Fermer & Voir la Facture" → ferme modal + appelle `onSuccess` callback

#### Erreur
- Affiche code erreur (ex: `WEBHOOK_TIMEOUT`, `QUALIFICATION_NOT_FOUND`)
- Affiche message utilisateur (en français, court et clair)
- Bouton "Réessayer" → revient à état `idle` (peut relancer)
- Bouton "Retour" → ferme modal

#### Clic "Annuler"
- Ferme modal immédiatement
- N'annule pas la génération côté serveur (elle continue en arrière-plan si déjà lancée)
- Utilisateur peut revérifier plus tard

---

## 3️⃣ Hook Client (`useGenerateFacture.ts`)

### Interface
```typescript
interface UseGenerateFactureOptions {
  onSuccess?: (result: FactureResult) => void;
  onError?: (error: FactureError) => void;
  pollInterval?: number;  // Default: 2000ms
  pollTimeout?: number;   // Default: 60000ms (60s)
}

interface UseGenerateFactureReturn {
  isLoading: boolean;
  error: FactureError | null;
  success: boolean;
  factureNumero: string | null;
  trigger: (status: 'emise' | 'acquittee', options?: {
    sendEmail?: boolean;
    sendTelegram?: boolean;
  }) => Promise<FactureResult>;
}

interface FactureError {
  code: string;           // Ex: 'WEBHOOK_TIMEOUT', 'VALIDATION_ERROR'
  message: string;        // Message pour l'utilisateur
  statusCode?: number;    // HTTP status
  retryable: boolean;
}
```

### Logique

```typescript
export function useGenerateFacture(
  qualificationId: string,
  options: UseGenerateFactureOptions = {}
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<FactureError | null>(null);
  const [success, setSuccess] = useState(false);
  const [factureNumero, setFactureNumero] = useState<string | null>(null);

  const trigger = useCallback(async (status: 'emise' | 'acquittee', opts = {}) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. POST vers endpoint
      const response = await fetch(
        `/api/qualifications/${qualificationId}/facture`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            factureStatus: status,
            sendEmail: opts.sendEmail ?? false,
            sendTelegram: opts.sendTelegram ?? false
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new FactureError(
          errorData.code || 'HTTP_ERROR',
          errorData.message || 'Erreur serveur',
          response.status,
          response.status >= 500 || response.status === 429
        );
      }

      const data = await response.json();
      const jobId = data.jobId || qualificationId;

      // 2. Commencer le polling
      const result = await pollUntilReady(
        qualificationId,
        options.pollInterval ?? 2000,
        options.pollTimeout ?? 60000
      );

      setFactureNumero(result.factureNumero);
      setSuccess(true);
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const facError = err instanceof FactureError 
        ? err 
        : new FactureError('UNKNOWN_ERROR', 'Une erreur inattendue est survenue', 500, true);
      
      setError(facError);
      options.onError?.(facError);
      throw facError;
    } finally {
      setIsLoading(false);
    }
  }, [qualificationId, options]);

  return { isLoading, error, success, factureNumero, trigger };
}

// Fonction helper pour le polling
async function pollUntilReady(
  qualificationId: string,
  interval: number,
  timeout: number
): Promise<FactureResult> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const response = await fetch(`/api/qualifications/${qualificationId}/facture/status`);
    
    if (!response.ok) {
      throw new FactureError('STATUS_CHECK_FAILED', 'Impossible de vérifier le statut', 500, true);
    }

    const { facture_status, facture_numero, facture_url, facture_generated_at, facture_error } 
      = await response.json();

    if (facture_status === 'ready') {
      return {
        factureNumero: facture_numero,
        factureUrl: facture_url,
        generatedAt: facture_generated_at,
        status: 'emise' // ou déduire du champ
      };
    }

    if (facture_status === 'error') {
      throw new FactureError('GENERATION_FAILED', facture_error || 'Erreur de génération', 500, true);
    }

    await new Promise(resolve => setTimeout(resolve, interval));
  }

  throw new FactureError('POLL_TIMEOUT', 'La génération a pris trop longtemps', 504, true);
}
```

---

## 4️⃣ Endpoint API

### Route : `POST /api/qualifications/[id]/facture`

#### Authentification
- Nécessite JWT valide (session utilisateur)
- Middleware : vérifier `user.id` du token

#### Requête
```http
POST /api/qualifications/123e4567-e89b-12d3-a456-426614174000/facture HTTP/1.1
Content-Type: application/json
Authorization: Bearer <jwt-token>

{
  "factureStatus": "emise" | "acquittee",
  "sendEmail": true,
  "sendTelegram": false
}
```

#### Réponse - Succès (200)
```json
{
  "success": true,
  "factureNumero": "FA-2025-0001",
  "jobId": "webhook-call-uuid-here",
  "message": "Génération en cours... (environ 5-15s)"
}
```

#### Réponse - Erreurs

**400 Bad Request**
```json
{
  "success": false,
  "code": "INVALID_INPUT",
  "message": "Le paramètre 'factureStatus' doit être 'emise' ou 'acquittee'",
  "retryable": false
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "code": "AUTH_REQUIRED",
  "message": "Vous devez être connecté pour générer une facture",
  "retryable": false
}
```

**404 Not Found**
```json
{
  "success": false,
  "code": "QUALIFICATION_NOT_FOUND",
  "message": "Qualification introuvable",
  "retryable": false
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "code": "WEBHOOK_FAILED",
  "message": "Le serveur n'a pas pu déclencher la génération. Veuillez réessayer.",
  "retryable": true
}
```

**504 Gateway Timeout**
```json
{
  "success": false,
  "code": "WEBHOOK_TIMEOUT",
  "message": "Le serveur prend trop longtemps à répondre. Veuillez vérifier plus tard.",
  "retryable": true
}
```

### Route : `GET /api/qualifications/[id]/facture/status`

#### Authentification
- Nécessite JWT valide

#### Requête
```http
GET /api/qualifications/123e4567-e89b-12d3-a456-426614174000/facture/status HTTP/1.1
Authorization: Bearer <jwt-token>
```

#### Réponse
```json
{
  "facture_status": "generating" | "ready" | "error",
  "facture_numero": "FA-2025-0001",
  "facture_url": "https://supabase-storage.../factures/FA-2025-0001.pdf",
  "facture_generated_at": "2025-12-21T14:30:00Z",
  "facture_error": null
}
```

---

## 5️⃣ Messages d'Erreur (UX)

### Mapping Code → Message Utilisateur

| Code | Message | Retryable | Action |
|------|---------|-----------|--------|
| `VALIDATION_ERROR` | "Données invalides. Veuillez réessayer." | Non | Fermer |
| `AUTH_REQUIRED` | "Vous devez être connecté." | Non | Redirection login |
| `QUALIFICATION_NOT_FOUND` | "Qualification introuvable." | Non | Retour / Rafraîchir |
| `WEBHOOK_FAILED` | "Erreur de communication. Réessayez." | Oui | Réessayer |
| `WEBHOOK_TIMEOUT` | "Le serveur met trop de temps. Réessayez dans quelques minutes." | Oui | Réessayer |
| `GENERATION_FAILED` | "Erreur lors de la génération du PDF." | Oui | Réessayer |
| `POLL_TIMEOUT` | "Génération trop longue. Veuillez vérifier plus tard." | Oui | Fermer (voir plus tard) |
| `UNKNOWN_ERROR` | "Une erreur inattendue est survenue." | Oui | Réessayer |

---

## 6️⃣ Intégration dans `page.tsx`

### Code Exemple

```tsx
// app/(dashboard)/entreprises/[id]/page.tsx

import { FactureModal } from '@/components/entreprises/FactureModal';

export default async function CompanyDetailPage({ params }) {
  const { id } = await params;
  
  // ... existing code ...
  const { data: qualifications } = await supabase
    .from('qualification')
    .select('*')
    .eq('entreprise_id', id);

  const [factureModalOpen, setFactureModalOpen] = useState(false);
  const [selectedQualificationId, setSelectedQualificationId] = useState<string | null>(null);

  return (
    <main className="...">
      {/* ... existing header & content ... */}

      {/* Sticky Footer Actions */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 p-4 bg-surface-card border-t border-border-subtle z-40">
        <div className="max-w-md mx-auto flex flex-col gap-3">
          <Button asChild className="...">
            <Link href={`/entreprises/${id}/qualifications/new`}>
              <Plus /> Créer une qualification
            </Link>
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" className="...">
              <FileText /> Bon de commande
            </Button>
            <Button 
              variant="secondary" 
              className="..."
              onClick={() => {
                setSelectedQualificationId(qualifications?.[0]?.id); // Ou proposer un sélecteur
                setFactureModalOpen(true);
              }}
            >
              <Receipt /> Facture
            </Button>
          </div>
        </div>
      </div>

      {/* Modal Facture */}
      {selectedQualificationId && (
        <FactureModal
          open={factureModalOpen}
          onOpenChange={setFactureModalOpen}
          qualificationId={selectedQualificationId}
          entrepriseId={id}
          onSuccess={(result) => {
            // Afficher toast succès
            toast.success(`Facture ${result.factureNumero} générée !`);
            // Optionnel : Rafraîchir les données
            // router.refresh();
          }}
        />
      )}
    </main>
  );
}
```

---

## 7️⃣ Accessibilité (A11y)

- ✅ Modal avec `role="dialog"` et `aria-modal="true"`
- ✅ Boutons radio accessibles (clavier + lecteur d'écran)
- ✅ Texte d'erreur avec `role="alert"` pour annonce immédiate
- ✅ Focus management : focus trap dans modal, restore après fermeture
- ✅ Contraste suffisant (WCAG AA)
- ✅ Spinner avec `aria-live="polite"` pour les mises à jour

---

## 8️⃣ Performance & Optimisations

- ✅ Modal lazy-loaded (code splitting)
- ✅ Polling avec backoff exponentiel optionnel
- ✅ Requête `/status` cachée (Cache-Control: private, max-age=0)
- ✅ Spinner SVG ou CSS (pas de GIF)

---

## 9️⃣ Notes de Sécurité

- ✅ CSRF token si besoin (Next.js gère automatiquement si form)
- ✅ Validation serveur stricte du `factureStatus`
- ✅ Rate limiting côté API (1 req/user/sec recommandé)
- ✅ Logs des erreurs (audit trail pour support)

