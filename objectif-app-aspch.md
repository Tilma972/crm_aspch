# Objectif & Périmètre App ASPCH CRM

## 🎯 OBJECTIF PRINCIPAL

**Créer un CRM web moderne qui orchestre les workflows n8n pour gérer le cycle complet des partenariats publicitaires du Calendrier 2026 des Sapeurs-Pompiers de Clermont-l'Hérault.**

---

## 🏗️ ARCHITECTURE : SÉPARATION CRM vs n8n

### **Principe Fondamental**
> **CRM = Interface UI/UX + Maître des données (CRUD Supabase)**
> **n8n = Moteur de workflows (PDF, Emails, IA, Enrichissement données)**

```
┌─────────────────────────────────────────┐
│  CRM (Next.js + Supabase)               │
│  ─────────────────────────────────────  │
│  • Formulaires & Validation             │
│  • CRUD Entreprises/Qualifications      │
│  • Dashboard & Analytics                │
│  • Prévisualisation Emails              │
│  • Orchestration workflows n8n          │
└─────────────────────────────────────────┘
              ↓ Webhooks (payloads)
┌─────────────────────────────────────────┐
│  n8n (Workflows)                        │
│  ─────────────────────────────────────  │
│  • Génération BC/Factures/BAT (PDF)     │
│  • IA Email (Claude/Gemini)             │
│  • Envoi Emails (Gmail API)             │
│  • Update Supabase (résultats workflow) │
└─────────────────────────────────────────┘
```

---

## 🔍 PROBLÈME ACTUEL

### Ce qui ne va PAS avec le système Telegram/n8n actuel :

1. **Interface limitée** : Chat uniquement, impossible de voir tableaux/stats
2. **Pas de vue d'ensemble** : Difficile de suivre 50+ entreprises simultanément
3. **Lenteur** : 5-10s pour une action simple (recherche, génération document)
4. **Pas collaboratif** : Chaque personne dans son chat Telegram isolé
5. **Pas de reporting** : Impossible de voir CA, taux conversion, etc.
6. **Mobile only** : Inconfortable sur desktop pour travail de bureau

### Ce qui FONCTIONNE (à conserver et améliorer) :

1. ✅ Génération PDF (BC, Factures) via n8n → **garder et étendre**
2. ✅ Workflows n8n automatisés → **orchestrer via CRM**
3. ✅ Base de données Baserow structurée → **migrer vers Supabase**
4. ✅ Processus métier clairs → **reproduire dans UI moderne**

---

## 🎯 OBJECTIF DÉTAILLÉ DE L'APP

### Vision en 1 phrase :
**"Un CRM intuitif qui permet à l'équipe SPP de gérer clients, générer documents et envoyer emails en 3 clics au lieu de 30 secondes de saisie Telegram."**

### Utilisateurs Cibles :
1. **Admin SPP** (toi) : Vue globale, analytics, configuration, gestion des équipes
2. **Prospecteurs** (4-5 personnes) : Création qualifications, suivi clients
3. **Comptable** : Suivi paiements, relances, exports

---

## 📦 PÉRIMÈTRE FONCTIONNEL

### ✅ INCLUS (MVP - 6 semaines)

#### 1. Gestion Entreprises
**Pourquoi** : Cœur du CRM, besoin de voir liste complète + rechercher rapidement

**Features** :
- Liste entreprises avec recherche full-text
- Filtres rapides (commune, statut client, format encart)
- Fiche entreprise détaillée (coordonnées, historique, documents)
- Création/édition entreprise (formulaire simple)
- Export CSV/Excel

**Écrans** :
```
/entreprises
  └─ Liste tableau (tri, filtre, pagination)
  └─ /[id] - Détail entreprise
       ├─ Onglet Infos
       ├─ Onglet Qualifications
       ├─ Onglet Emails
       └─ Onglet Documents
```

---

#### 2. Gestion Qualifications 2026
**Pourquoi** : Processus commercial central, besoin de visualiser pipeline

**Features** :
- Formulaire qualification guidé :
    - Format encart (6x4, 6x8, 12x4, 12PARUTIONS)
    - Mois de parution
    - Paiement échelonné (Oui/Non + détails)
    - Mode de paiement (Chèque, Virement, CB)
- Statuts visuels (Nouveau → Qualifié → BC envoyé → Payé)
- Génération BC one-click (webhook n8n)
- Génération Facture one-click (webhook n8n)
- Suivi paiements avec alertes retards

**Écrans** :
```
/qualifications
  └─ Vue Kanban par statut
  └─ /nouvelle - Formulaire création
  └─ /[id] - Détail qualification
       ├─ Timeline événements
       ├─ Documents (BC, Facture)
       └─ Actions rapides (générer, envoyer)
```

---

#### 3. Assistant Email avec IA
**Pourquoi** : Rédiger emails contextuels rapidement, centraliser historique communications

**Features MVP** :
- ✅ Composer email avec génération IA (via n8n → Claude/Gemini)
- ✅ Prévisualisation draft éditable avant envoi
- ✅ Templates pré-définis (relance paiement, envoi BC, demande visuel, remerciement)
- ✅ Envoi direct via n8n (Gmail API)
- ✅ Logging automatique interactions dans Supabase
- ✅ Historique emails par entreprise (timeline)
- ❌ Pas d'inbox intégrée (Phase 2)

**Workflow Utilisateur** :
```
1. User clique "📧 Rédiger email" depuis fiche entreprise
2. Modal s'ouvre avec type d'email (dropdown)
   - Relance paiement
   - Envoi bon de commande
   - Demande visuel client
   - Remerciement paiement
3. Click "🤖 Générer avec IA"
   → CRM envoie contexte à n8n
   → n8n appelle Claude/Gemini
   → Draft généré en 1-2s
4. User édite draft si besoin
5. Click "✅ Envoyer"
   → n8n envoie via Gmail
   → n8n log interaction dans Supabase
6. Timeline entreprise update automatiquement
```

**Contexte IA Collecté** :
- Nom entreprise + contact email
- Qualification actuelle (format, prix, mois, statut)
- Historique interactions (5 dernières)
- Alertes actives (paiement retard, visuel manquant)
- Commentaires/notes spécifiques

**Exemple Génération IA** :
```
Contexte envoyé à n8n :
{
  entreprise: "Boulangerie Martin",
  email: "contact@boulangerie-martin.fr",
  qualification: { format: "6X4", prix: 350, statut: "BC envoyé" },
  alertes: ["Paiement en retard de 5 jours"],
  historique: [
    { date: "2025-11-15", event: "BC envoyé" },
    { date: "2025-11-20", event: "Email suivi envoyé" }
  ]
}

Draft généré :
"Bonjour M. Martin,

Suite à notre échange du 15 novembre concernant votre
participation au Calendrier 2026 (format 6X4 - 350€),
nous n'avons pas encore reçu votre règlement.

Pourriez-vous nous confirmer la date de paiement ?

Cordialement,
Sapeurs-Pompiers de Clermont-l'Hérault"
```

---

#### 4. Dashboard Analytics
**Pourquoi** : Vision globale activité, prise décisions, motivation équipe

**Features** :
- KPIs temps réel (CA total, nb qualifications, taux conversion)
- Graphiques évolution (CA mensuel, formats populaires)
- Alertes (paiements en retard, visuels manquants)
- Statistiques par prospecteur
- Export rapport mensuel PDF

**Écrans** :
```
/dashboard
  ├─ Cartes KPIs (CA, Qualifs, Taux conversion)
  ├─ Graphique CA mensuel
  ├─ Top 10 entreprises (CA)
  ├─ Alertes urgentes (paiements J+30)
  └─ Activité récente (timeline)
```

---

#### 5. Génération Documents (Orchestration n8n)
**Pourquoi** : Générer BC/Factures en 1 clic, accès direct Drive

**Features** :
- ✅ Génération BC via webhook n8n (async)
- ✅ Génération Facture via webhook n8n (async)
- ✅ Génération BAT (Bon à Tirer visuel) via n8n
- ✅ Liens directs Google Drive
- ✅ Suivi statut génération (en cours, prêt, erreur)
- ✅ Timeline documents par qualification
- ❌ Pas de prévisualisation PDF dans CRM (ouverture Drive directement)

**Responsabilités** :
- **CRM** : Crée qualification avec données métier → Trigger webhook n8n → Update statut `bc_status = 'generating'`
- **n8n** : Génère PDF → Upload Drive → Update Supabase `bc_url`, `bc_status = 'ready'`
- **CRM** : Affiche résultat (Supabase Realtime détecte update)

**Flow Génération BC** :
```
1. User clique "📄 Générer BC" depuis /qualifications/[id]
2. CRM exécute :
   - UPDATE qualification SET bc_status = 'generating'
   - POST webhook n8n avec payload
   - Toast "⏳ Génération en cours..."
3. UI affiche spinner sur bouton BC (3-5s)
4. n8n workflow :
   - Génère PDF depuis template Google Docs
   - Upload vers Drive folder "BC/2026"
   - UPDATE qualification SET bc_url = '...', bc_status = 'ready'
5. CRM détecte update (Realtime) :
   - Toast "✅ BC généré avec succès"
   - Bouton devient [👁️ Voir BC] [📤 Envoyer]
6. Click "Voir BC" → Ouvre URL Drive nouvel onglet
```

**Payload n8n (voir architecture-technique.md)** :
```typescript
// POST /webhook/generate-bc
{
  qualification_id: "uuid",
  entreprise: { nom, adresse, ville, email },
  format: "6X4",
  mois: "Mai",
  prix: 350,
  date_emission: "2025-12-09T14:32:00Z"
}
```

---

---

## ⚙️ WORKFLOWS n8n REQUIS

### **Workflows Prioritaires MVP** (à créer/adapter)

#### 1. `generate-bc` - Génération Bon de Commande
- **Input** : qualification_id, entreprise, format, prix, mois
- **Actions** :
  1. Load template Google Docs "BC 2026"
  2. Replace placeholders (nom, adresse, format, prix)
  3. Export to PDF
  4. Upload Google Drive → folder "BC/2026"
  5. UPDATE Supabase : `bc_url`, `bc_status = 'ready'`, `bc_generated_at`
- **Output** : `{ status: 'success', bc_url }`

#### 2. `email-draft` - Génération Draft Email IA
- **Input** : context (entreprise, qualification, historique), email_type, tone
- **Actions** :
  1. Enrich context (format prompt optimisé)
  2. Call Claude Haiku ou Gemini Flash
  3. Return draft généré
- **Output** : `{ draft: "Bonjour M...", metadata: { model, tokens } }`

#### 3. `email-send` - Envoi Email + Logging
- **Input** : qualification_id, entreprise_id, to, subject, body, attachments
- **Actions** :
  1. Send via Gmail API
  2. INSERT Supabase interaction (email_sent)
- **Output** : `{ status: 'sent', gmail_message_id }`

#### 4. `generate-facture` - Génération Facture
- **Input** : qualification_id, entreprise, montant, paiement_echelonne, numero
- **Actions** :
  1. Load template "Facture 2026"
  2. Fill data + calculate échéances si échelonné
  3. Export PDF
  4. Upload Drive
  5. UPDATE Supabase : `facture_url`, `facture_numero`, `facture_status`
- **Output** : `{ status: 'success', facture_url }`

**Détails complets payloads** : Voir `architecture-technique.md`

---

### ❌ HORS PÉRIMÈTRE (MVP)

**Phase 2+ (après 6 semaines)** :

1. **Inbox Gmail Intégrée** : Lecture emails entrants (Phase 2)
2. **Gestion Calendrier/Publications** : Planification visuels, BAT, positions pages
3. **Facturation Avancée** : Échéanciers auto, relances programmées
4. **Multi-tenancy** : Vendre solution à autres pompiers/assos
5. **App Mobile Native** : PWA suffit pour MVP
6. **IA Agent Conversationnel** : Pas nécessaire avec UI claire
7. **Signature Électronique** : BC envoyé par email, signature manuelle OK
8. **Gestion Stock/Inventaire** : Hors scope calendrier
9. **Reçus Fiscaux** : Pas prioritaire pour MVP
10. **RBAC (Rôles & Équipes)** : Tout le monde voit tout pour l'instant

---

## 🎨 EXPÉRIENCE UTILISATEUR CIBLE

### User Story #1 : Prospecteur crée qualification
```
1. Ouvre /entreprises
2. Recherche "Boulangerie Martin"
3. Click fiche entreprise
4. Click "Nouvelle qualification"
5. Formulaire pré-rempli (nom, email)
6. Sélectionne format 6X4, mois Mars
7. Prix calculé auto : 90€
8. Click "Créer"
9. → Redirection vers qualification créée
10. Click "Générer BC"
11. Attente 5s
12. BC généré, bouton "Envoyer par email"
```
**Temps total : 2 minutes** (vs 5+ minutes Telegram)

---

### User Story #2 : Admin suit activité quotidienne
```
1. Ouvre /dashboard
2. Voit KPI : "3 nouveaux clients cette semaine"
3. Voit alerte : "5 paiements en retard"
4. Click alerte
5. → Liste qualifications concernées
6. Sélectionne toutes
7. Click "Action groupée" > "Envoyer relance"
8. IA génère 5 emails personnalisés
9. Preview/validation
10. Envoi groupé
```
**Temps total : 3 minutes** (vs 20+ minutes Telegram)

---

### User Story #3 : Envoi email avec contexte
```
1. Ouvre /emails/composer
2. Sélectionne entreprise "Restaurant Le Soleil"
3. App charge contexte auto :
   - Format : 6X8 (160€)
   - Statut : BC signé, attente paiement 15j
   - Dernier email : il y a 10j
4. Click "Suggérer email" > Type "Relance paiement"
5. IA génère :
   "Bonjour M. Dupont,
   
   Suite à notre échange du 20 novembre concernant votre 
   participation au Calendrier 2026 (format 6X8 - 160€),
   nous n'avons pas encore reçu votre règlement.
   
   Pourriez-vous nous confirmer la date de paiement ?
   
   Cordialement,
   Sapeurs-Pompiers Clermont"
   
6. User modifie ton légèrement
7. Attache facture depuis Drive (suggestion auto)
8. Envoie
```
**Temps total : 1 minute** (vs email Gmail + recherche facture)

---

## 🎯 CRITÈRES DE SUCCÈS MVP

### Quantitatifs
- [ ] **Adoption** : 100% équipe utilise app en 2 semaines
- [ ] **Vitesse** : Création qualification < 2 min (vs 5+ min)
- [ ] **Emails** : +50% emails envoyés/jour (meilleure productivité)
- [ ] **Documents** : Génération BC/Facture < 10s (vs recherche Drive)

### Qualitatifs  
- [ ] **Satisfaction** : Note > 4/5 après 1 mois usage
- [ ] **Autonomie** : 0 question "comment faire X ?" après formation
- [ ] **Fiabilité** : < 1 bug bloquant/semaine
- [ ] **Performance** : Temps chargement page < 2s

---

## 🚫 ANTI-OBJECTIFS (ce qu'on ne veut PAS)

1. ❌ **Usine à gaz** : Pas 50 features dont 40 inutilisées
2. ❌ **Remplacer n8n** : On garde workflows PDF qui marchent
3. ❌ **IA partout** : IA uniquement où valeur ajoutée claire (emails)
4. ❌ **Mobile-first** : Desktop prioritaire, mobile = bonus
5. ❌ **Sur-ingénierie** : Pas de microservices, architecture simple

---

## 📐 PRINCIPES DE DESIGN

### UX
1. **3-click max** : Toute action courante en 3 clicks maximum
2. **Feedback immédiat** : Loading states, toasts, confirmations
3. **Contexte conservé** : Retour arrière ne perd pas formulaire
4. **Raccourcis clavier** : Power users peuvent tout faire au clavier

### UI
1. **Cohérence** : Shadcn/UI + design system strict
2. **Accessible** : WCAG AA minimum
3. **Responsive** : Fonctionne tablette (pas juste desktop/mobile)
4. **Performance** : Lighthouse > 90

---

## 🎯 OBJECTIF REFORMULÉ (Version Finale)

**"Créer une PWA CRM qui permet à l'équipe des Sapeurs-Pompiers de Clermont-l'Hérault de :"**

1. **Visualiser** l'ensemble des entreprises partenaires et leur statut en un coup d'œil
2. **Créer** une qualification en 2 minutes (formulaire guidé + calcul auto)
3. **Générer** documents (BC, Factures) en 1 click via webhooks n8n
4. **Envoyer** emails contextuels avec assistance IA en 1 minute
5. **Suivre** l'activité commerciale via dashboard temps réel

**Le tout accessible depuis n'importe quel appareil (desktop/tablette/mobile) avec une expérience fluide et rapide.**

---

## 📊 COMPARAISON AVANT/APRÈS

| Tâche | Telegram + n8n (Avant) | PWA (Après) | Gain |
|-------|------------------------|-------------|------|
| Rechercher entreprise | 10s (saisie + IA parse) | 2s (search bar) | **5x** |
| Créer qualification | 5 min (messages multiples) | 2 min (formulaire) | **2.5x** |
| Générer BC | 10s (attente IA) | 5s (webhook) | **2x** |
| Envoyer email relance | 3 min (Gmail séparé) | 1 min (composer + IA) | **3x** |
| Voir CA mensuel | Impossible | 1s (dashboard) | **∞** |

**Productivité globale estimée : +300%**

---

## ❓ VALIDATION - Questions pour Toi

Avant de valider cet objectif, confirme-moi :

1. **Les 5 features MVP** (Entreprises, Qualifications, Emails, Dashboard, Documents) couvrent-elles 80% de ton usage quotidien ?

2. **Y a-t-il une fonctionnalité critique manquante** qui bloquerait l'adoption ?

3. **Les user stories** correspondent-elles à ton workflow réel ?

4. **Le périmètre "Hors MVP"** est-il OK pour Phase 2 (Calendrier/Publications, etc) ?

5. **Priorité absolue** si je devais choisir 1 seule feature à développer en premier : laquelle ? (Entreprises / Qualifications / Emails ?)

---

## 📅 ROADMAP MVP - 6 SEMAINES

### **Sprint 1-2 : Fondations & Migration** (Semaines 1-2)
- [ ] Setup Next.js 15 (App Router) + TypeScript
- [ ] Setup Supabase (projet, connexion, RLS)
- [ ] Setup Shadcn/UI + Tailwind
- [ ] Authentification Supabase (login/logout/session)
- [ ] Schéma DB complet (entreprise, qualification, interaction)
- [ ] Migration données Baserow → Supabase (script Python)
- [ ] Validation données migrées

**Livrable** : App déployée Vercel, données migrées, auth fonctionnelle

---

### **Sprint 3-4 : Gestion Entreprises & Qualifications** (Semaines 3-4)

**CRM** :
- [ ] Page `/entreprises` (liste, recherche, filtres)
- [ ] Page `/entreprises/[id]` (onglets Infos, Qualifications, Timeline, Documents)
- [ ] CRUD entreprise (formulaires création/édition)
- [ ] Page `/qualifications` (vue Kanban par statut)
- [ ] Formulaire création qualification (validation, calcul prix auto)
- [ ] Page `/qualifications/[id]` (détail + actions)

**n8n** :
- [ ] Workflow `generate-bc` (test avec 3 qualifications réelles)
- [ ] Workflow `generate-facture`

**Livrable** : CRUD complet fonctionnel, génération BC/Facture OK

---

### **Sprint 5 : Intégration n8n & Emails** (Semaine 5)

**CRM** :
- [ ] API routes Next.js (appels webhooks n8n)
- [ ] Composant `EmailComposerModal` (génération IA, preview, édition)
- [ ] Gestion états asynchrones (bc_status, facture_status)
- [ ] Supabase Realtime (updates UI auto)
- [ ] Actions rapides qualification (générer BC, email, facture)

**n8n** :
- [ ] Workflow `email-draft` (Claude Haiku ou Gemini Flash)
- [ ] Workflow `email-send` (Gmail API + logging Supabase)

**Livrable** : Génération documents + emails IA fonctionnels

---

### **Sprint 6 : Dashboard, Polish & Formation** (Semaine 6)

**CRM** :
- [ ] Page `/dashboard` (KPIs, graphiques, alertes)
- [ ] Composant `EntrepriseContextCard` (résumé IA)
- [ ] Timeline interactions (tous types)
- [ ] Export CSV entreprises
- [ ] Error handling + retry logic
- [ ] Loading states + toasts + confirmations
- [ ] Tests e2e Playwright (flows critiques)

**Documentation & Formation** :
- [ ] Guide utilisateur (PDF + vidéos)
- [ ] Session formation équipe (2h)
- [ ] Feedback et ajustements

**Livrable** : MVP production-ready, équipe formée

---

## 🎯 STRATÉGIE DE DÉVELOPPEMENT

### **Priorités**
1. **CRM = Maître données** : Toutes les opérations CRUD passent par le CRM (Supabase client)
2. **n8n = Enrichissement** : Workflows mettent à jour uniquement résultats (bc_url, interactions)
3. **Prévisualisation** : Emails uniquement (pas PDF)
4. **Realtime** : Supabase Realtime pour updates UI automatiques

### **Stack Technique**
- **Frontend** : Next.js 15 (App Router), React Server Components, Shadcn/UI, Tailwind
- **Backend** : Supabase (Postgres + Auth + Realtime + Storage)
- **Workflows** : n8n (génération PDF, IA, emails)
- **IA** : Claude 3.5 Haiku OU Gemini Flash 2.0
- **Hosting** : Vercel (CRM), n8n self-hosted/cloud
- **Monitoring** : Sentry, Vercel Analytics

---

## 📚 DOCUMENTATION TECHNIQUE

Pour détails complets architecture, schémas DB, payloads API :
👉 **Voir `architecture-technique.md`**

---

## ✅ VALIDATION FINALE

**Ce document définit** :
- ✅ Objectif clair : CRM orchestrant workflows n8n
- ✅ Architecture séparée : CRM (UI/CRUD) vs n8n (workflows)
- ✅ Périmètre MVP réaliste : 6 semaines
- ✅ Workflows n8n requis : 4 prioritaires
- ✅ UX simplifiée : Pas preview PDF, juste emails

**Prochaine étape** :
🚀 Créer `architecture-technique.md` avec schémas DB + contrats API détaillés