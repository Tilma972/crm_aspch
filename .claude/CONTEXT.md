# ASPCH CRM - Contexte Partagé

## 📋 Infos Projet

**Nom:** ASPCH CRM - Gestion Qualifications
**Client:** Amicale des Sapeurs-Pompiers de Clermont-l'Hérault
**Status:** Production - Phase 4 complète
**Équipe:** Solo dev (Caleb)
**Repo:** https://github.com/Tilma972/crm_aspch

---

## 🏗️ Architecture

### Tech Stack
- **Frontend:** Next.js 15 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS + Shadcn/ui components
- **Database:** Supabase (PostgreSQL) avec RLS
- **Authentication:** Supabase Auth (Email/Password)
- **Storage:** Supabase Storage (PDFs)
- **Workflows:** n8n (externe, hébergé)
- **Data Fetching:** React Query + TanStack Query
- **State Management:** React Context + Query Client

### Folder Structure
```
app/
├── (auth)/          # Authentication routes
├── (dashboard)/     # Protected routes
├── api/            # Backend API
components/
├── layout/         # Shared components
├── ui/            # Shadcn components
└── entreprises/   # Domain-specific
hooks/
├── use-client-fetch.ts
├── use-client-mutation.ts
└── useGenerateFacture.ts
lib/
├── auth-context.tsx
├── supabase/
└── schemas/
supabase/
├── migrations/     # Database migrations
├── server.ts       # Server-side client
└── client.ts       # Client-side client
```

---

## 📚 Phases Achevées

### Phase 1-3: Infrastructure (✅ Complète)
- ✅ Auth system (signup/login)
- ✅ Database schema
- ✅ Enterprise management
- ✅ Qualifications CRUD
- ✅ Mobile responsive design

### Phase 4: n8n Integration (✅ Complète)
- ✅ Invoice generation workflow
- ✅ PDF conversion (Gotenberg)
- ✅ Email integration
- ✅ Telegram notifications
- ✅ Document storage

---

## 🎯 Features Principales

### 1. Gestion Entreprises
- CRUD entreprises
- Timeline historique
- Contact info

### 2. Qualifications
- Format encarts (6x4, 6x8, 12x4, 12 parutions)
- Prix automatique
- Statut workflow (Nouveau → Payé → Terminé)
- Remise pompiers (-70%)

### 3. Facturation
- Génération factures (Émises & Acquittées)
- PDF generation via n8n + Gotenberg
- Numérotation auto (FA-2026-0001)
- Email + Telegram envoi
- Storage Supabase

### 4. Dashboard
- Stats revenu total
- Qualifications par statut
- Timeline interactions
- Mobile first

---

## 🔐 Sécurité

### Authentication
- Supabase Auth (JWT tokens)
- Session management via middleware
- Automatic refresh via cookies

### Authorization
- RLS (Row Level Security) policies
- Admin client (`createAdminClient`) for privileged operations
- User context validation in API routes

### Secrets
- `.env.local` (local only, in .gitignore)
- `.claude/secrets/` (never committed)
- `SUPABASE_SERVICE_ROLE_KEY` (admin operations only)

---

## 🐛 Known Issues & Tech Debt

### Resolved
- ✅ 404 on facture generation (fixed via RLS + admin client)
- ✅ Email confirmation (configured properly)
- ✅ Missing DB migrations (applied via CLI)

### Current Tech Debt
- Database indexes could be optimized for large datasets
- Mobile responsiveness could be improved (bottom nav)
- Error handling is sometimes generic
- Some type safety gaps in API responses

---

## 🚀 Current Blockers / Discussions

1. **Performance at scale** - How to handle 1000+ qualifications?
2. **Mobile UX** - Bottom nav vs sidebar trade-offs
3. **Workflow automation** - When to use n8n vs API routes?
4. **User permissions** - Multi-user vs admin-only?

---

## 📊 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://wetwofwmfpvnvplytldh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[JWT token]
SUPABASE_SERVICE_ROLE_KEY=[service role key]

# n8n Webhooks
N8N_WEBHOOK_URL=https://n8n.dsolution-ia.fr/webhook/generate-facture-emise
N8N_WEBHOOK_SECRET=[secret]

# Third party (deprecated)
BASEROW_API_TOKEN=[old integration]
```

---

## 🔗 Important Links

- **Dashboard:** https://wetwofwmfpvnvplytldh.supabase.co/
- **n8n:** https://n8n.dsolution-ia.fr/
- **GitHub:** https://github.com/Tilma972/crm_aspch
- **Docs:** See `docs/` folder for flow diagrams

---

## ⚡ Quick Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run lint            # Run eslint

# Database
npx supabase link --project-ref wetwofwmfpvnvplytldh
npx supabase db push    # Apply migrations
npx supabase migration list

# Database Admin
SUPABASE_ACCESS_TOKEN=[token] npx supabase db pull

# Type checking
npx tsc --noEmit
```

---

## 👤 Key Contacts

- **Caleb** (Solo dev) - This is you!
- **n8n Admin** - For workflow issues
- **Supabase** - For DB/Auth issues

---

## 📅 Last Updated

- Last reviewed: January 26, 2026
- Last deploy: TBD
- Phase status: Phase 4 ✅ Complete

