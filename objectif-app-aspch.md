# Objectif & Périmètre App ASPCH CRM

## 🎯 OBJECTIF PRINCIPAL

**Créer un CRM web moderne pour gérer le cycle complet des partenariats publicitaires du Calendrier 2026 des Sapeurs-Pompiers de Clermont-l'Hérault.**

---

## 🔍 PROBLÈME ACTUEL

### Ce qui ne va PAS avec le système Telegram/n8n actuel :

1. **Interface limitée** : Chat uniquement, impossible de voir tableaux/stats
2. **Pas de vue d'ensemble** : Difficile de suivre 50+ entreprises simultanément  
3. **Lenteur** : 5-10s pour une action simple (recherche, génération document)
4. **Pas collaboratif** : Chaque personne dans son chat Telegram isolé
5. **Pas de reporting** : Impossible de voir CA, taux conversion, etc.
6. **Mobile only** : Inconfortable sur desktop pour travail de bureau

### Ce qui FONCTIONNE (à conserver) :

1. ✅ Génération PDF (BC, Factures) via n8n → **garder**
2. ✅ Envoi emails automatisés → **améliorer avec interface**
3. ✅ Base de données Baserow structurée → **migrer vers Supabase**
4. ✅ Processus métier clairs → **reproduire dans UI**

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

### ✅ INCLUS (MVP - 8 semaines)

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

#### 3. Système Emails Intégré
**Pourquoi** : Centraliser communications, éviter Gmail séparé, contexte métier

**Features** :
- Inbox emails liés aux entreprises (via Gmail API)
- Composer email avec suggestions IA contextuelles (Ton: Professionnel vs Amical)
- Templates pré-remplis (relance, envoi BC, etc)
- Historique conversations par entreprise
- Pièces jointes automatiques (BC, Facture depuis Drive)

**Assistant IA Email** :
```
User : Click "Nouveau email" depuis fiche entreprise
App  : Charge contexte (nom, qualification, statut paiement)
User : Click "Suggérer avec IA" > Choix "Relance paiement"
App  : Génère email personnalisé en 2s
User : Modifie si besoin > Envoie
```

**Écrans** :
```
/emails
  └─ Inbox (threads groupés par entreprise)
  └─ /composer - Nouveau message
       ├─ Destinataire (autocomplete entreprises)
       ├─ Assistant IA (suggestions contextuelles)
       ├─ Templates rapides
       └─ Pièces jointes (picker Drive)
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

#### 5. Gestion Documents
**Pourquoi** : Accès rapide BC/Factures sans naviguer Google Drive

**Features** :
- Génération BC via webhook n8n (async)
- Génération Facture via webhook n8n (async)
- Aperçu PDF dans app (iframe)
- Téléchargement direct
- Historique versions documents

**Flow Génération** :
```
User : Click "Générer BC" depuis qualification
App  : Appel webhook n8n POST /generate-bc
n8n  : Return job_id immédiat
App  : Polling status toutes les 2s
n8n  : Upload PDF → Drive, return URL
App  : Affiche "✅ BC généré" + bouton aperçu
```

---

### ❌ HORS PÉRIMÈTRE (MVP)

**Phase 2+ (après 8 semaines)** :

1. **Gestion Calendrier/Publications** : Planification visuels, BAT, positions pages
2. **Facturation Avancée** : Échéanciers, relances auto, intégration comptable
3. **Multi-tenancy** : Vendre solution à autres pompiers/assos
4. **App Mobile Native** : PWA suffit pour MVP
5. **IA Agent Conversationnel** : Pas nécessaire avec UI claire
6. **Signature Électronique** : BC envoyé par email, signature manuelle OK
7. **Gestion Stock/Inventaire** : Hors scope calendrier
8. **Reçus Fiscaux** : Pas prioritaire pour MVP
9. **RBAC (Rôles & Équipes)** : Tout le monde voit tout pour l'instant

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

## 🚀 PROCHAINE ÉTAPE

Une fois objectif validé → **Architecture technique détaillée** :
- Schéma base de données Supabase
- Structure pages Next.js
- Endpoints API
- Webhooks n8n

**On valide cet objectif ou il manque quelque chose ?**