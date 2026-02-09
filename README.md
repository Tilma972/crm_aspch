# CRM ASPCH - Gestion des Partenariats Publicitaires

[![Built with Next.js](https://img.shields.io/badge/Next.js-15.1.6-black?style=flat-square)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat-square)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

## 🎯 À propos

**CRM ASPCH** est une plateforme web moderne conçue pour orchestrer et gérer le cycle complet des partenariats publicitaires du Calendrier 2026 des Sapeurs-Pompiers de Clermont-l'Hérault.

### Problématique résolue
- ✅ Interface utilisateur limitée à Telegram uniquement → **Dashboard web complet**
- ✅ Pas de vue d'ensemble → **Tableaux de bord & analytics**
- ✅ Lenteur des actions → **Next.js optimisé + Supabase Realtime**
- ✅ Pas de reporting → **Statistiques et suivi en temps réel**
- ✅ Limitation mobile → **Responsive design (Desktop, Tablet, Mobile)**

## 🏗️ Architecture

### Séparation des responsabilités

```
┌─────────────────────────────────────────┐
│  CRM (Next.js + Supabase)               │
│  • Interface utilisateur                 │
│  • CRUD Entreprises/Qualifications      │
│  • Dashboard & Analytics                │
│  • Orchestration workflows n8n          │
└─────────────────────────────────────────┘
              ↓ Webhooks
┌─────────────────────────────────────────┐
│  n8n (Workflows)                        │
│  • Génération BC/Factures/BAT (PDF)     │
│  • IA Email (Claude/Gemini)             │
│  • Envoi Emails (Gmail API)             │
│  • Update Supabase (résultats)          │
└─────────────────────────────────────────┘
```

## 🚀 Démarrage rapide

### Prérequis
- **Node.js** 18+ (recommandé 20 LTS)
- **pnpm** (package manager)
- **Supabase CLI** (optionnel)

### Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/Tilma972/crm_aspch.git
cd crm_aspch

# 2. Installer les dépendances
pnpm install

# 3. Configuration des variables d'environnement
# Créer un fichier .env.local avec:
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

### Développement

```bash
# Lancer le serveur de développement
pnpm dev

# Ouvrir http://localhost:3000
```

### Build & Production

```bash
# Compiler l'application
pnpm build

# Démarrer le serveur de production
pnpm start
```

## 📋 Stack technique

### Frontend
- **Next.js 15.1.6** - React framework avec App Router
- **React 19** - Bibliothèque UI
- **TypeScript 5** - Typage statique
- **Tailwind CSS 3.4** - Framework CSS utilitaire
- **shadcn/ui** - Composants accessibles pré-stylisés
- **React Hook Form** - Gestion des formulaires
- **Zod** - Validation de schémas TypeScript
- **TanStack Query 5** - Gestion du state asynchrone
- **next-themes** - Gestion du thème (light/dark)

### Backend
- **Supabase** - PostgreSQL + Auth + Realtime
- **Supabase SSR** - Authentification côté serveur
- **Webhooks** - Communication avec n8n

### Intégrations
- **n8n** - Orchestration de workflows
- **Gmail API** - Envoi d'emails
- **Google Drive** - Stockage de documents
- **Claude/Gemini** - IA pour génération de contenu

## 📁 Structure du projet

```
crm_aspch/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Pages d'authentification
│   │   ├── login/
│   │   ├── register/
│   │   └── error/
│   ├── (dashboard)/              # Pages protégées
│   │   ├── entreprises/          # Gestion des entreprises
│   │   └── qualifications/       # Gestion des qualifications
│   ├── api/
│   │   ├── webhooks/             # Réception des webhooks n8n
│   │   └── qualifications/       # API pour qualifications
│   └── layout.tsx
├── components/                   # Composants React réutilisables
│   ├── entreprises/              # Composants métier
│   ├── layout/                   # Composants layout (nav, sidebar)
│   └── ui/                       # Composants UI génériques
├── lib/
│   ├── auth-context.tsx          # Contexte d'authentification
│   ├── supabase/                 # Clients Supabase
│   ├── schemas/                  # Schémas Zod
│   └── utils.ts                  # Utilitaires
├── hooks/                        # Custom React hooks
├── supabase/
│   └── migrations/               # Migrations Supabase
├── docs/                         # Documentation technique
└── scripts/                      # Scripts utilitaires
```

## 🔐 Authentification

- **Supabase Auth** avec JWT
- Support OAuth (Google, GitHub)
- Middleware de protection des routes
- Gestion des sessions côté serveur

## 💾 Base de données

**Tables principales:**
- `enterprises` - Entreprises partenaires
- `qualifications` - Qualifications commerciales
- `invoices` - Factures générées
- `orders` - Bons de commande
- `audit_logs` - Historique des actions

## 📊 Fonctionnalités principales

### 1. **Gestion des Entreprises**
- ✅ Créer, lire, modifier, supprimer (CRUD)
- ✅ Tableau avec filtrage & tri
- ✅ Timeline des interactions
- ✅ Import/export de données

### 2. **Gestion des Qualifications**
- ✅ Attribution de qualifications aux entreprises
- ✅ Historique des changements
- ✅ Validation des critères

### 3. **Génération de Documents**
- ✅ Bons de commande (PDF)
- ✅ Factures (PDF)
- ✅ Bons à tirer (PDF)
- ✅ Intégration avec Google Drive

### 4. **Emails intelligents**
- ✅ Génération d'emails avec IA (Claude)
- ✅ Prévisualisation avant envoi
- ✅ Envoi via Gmail API
- ✅ Templates personnalisables

### 5. **Dashboard & Reporting**
- ✅ Statistiques en temps réel
- ✅ Graphiques et tableaux
- ✅ Exports de données

## 🔗 Webhooks n8n

L'application communique avec les workflows n8n via des webhooks HTTP:

```
POST /api/webhooks/generate-invoice
POST /api/webhooks/send-email
POST /api/webhooks/generate-document
```

## 🛠️ Scripts disponibles

```bash
pnpm dev              # Développement avec hot reload
pnpm build            # Build pour production
pnpm start            # Démarrer serveur production
pnpm lint             # Linter le code
pnpm supabase         # CLI Supabase

# Migrations Supabase (Windows PowerShell)
pnpm exec supabase db push        # Appliquer toutes les migrations
pnpm exec supabase db status      # Vérifier le statut
```

## 📚 Documentation

- [Architecture Technique](architecture-technique.md) - Schéma détaillé de l'infrastructure
- [Objectifs & Périmètre](objectif-app-aspch.md) - Vision et scope du projet
- [Guide Développeur](DEVELOPER.md) - Instructions pour développeurs
- [Design System](ASPCH_DESIGN_SYSTEM.md) - Conventions UI/UX

## 🚨 Variables d'environnement

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# n8n
N8N_WEBHOOK_URL=https://n8n.example.com/webhook/

# APIs externes
GMAIL_API_KEY=<key>
GEMINI_API_KEY=<key>
```

## 🤝 Contribution

Les contributions sont bienvenues ! Veuillez :
1. Fork le dépôt
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👥 Contact & Support

- **Organisation** : Sapeurs-Pompiers de Clermont-l'Hérault
- **Repository** : https://github.com/Tilma972/crm_aspch
- **Issues** : [GitHub Issues](https://github.com/Tilma972/crm_aspch/issues)

## 📈 Roadmap

- [ ] Phase 4 - Intégration complète n8n
- [ ] Dashboard d'analytics avancées
- [ ] Intégration Salesforce/HubSpot
- [ ] Mobile app native
- [ ] API GraphQL

---

**Dernière mise à jour:** Février 2026
