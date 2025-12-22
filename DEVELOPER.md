# Developer notes — Supabase CLI & migrations

Ce fichier explique comment exécuter les migrations Supabase et vérifier le résultat
en local sous Windows PowerShell. Les commandes utilisent la CLI `supabase` locale
via `pnpm exec` (reproductible pour tout agent ou développeur).

IMPORTANT
- Ne commitez jamais de clés (`SUPABASE_SERVICE_ROLE_KEY`, `BASEROW_API_TOKEN`, etc.).
- Utilisez une clé `service_role` uniquement pour les opérations admin (migrations, modifications de `storage.buckets`).

Pré-requis
- Node.js (18+ recommandé)
- pnpm (recommandé, repo contient `pnpm-lock.yaml`)
- Supabase CLI installé (optionnel si vous utilisez `pnpm exec supabase`)

1) Installer dépendances
```powershell
pnpm install
```

2) Lier le projet Supabase (optionnel si vous utilisez déjà `supabase link`)
```powershell
# Lancer l'assistant link (ou renseigner via env vars)
pnpm exec supabase link
```

3) Variables d'environnement nécessaires (PowerShell)
```powershell
# $env:NEXT_PUBLIC_SUPABASE_URL = 'https://<project>.supabase.co'
# $env:NEXT_PUBLIC_SUPABASE_ANON_KEY = '<anon-key>'
# $env:SUPABASE_SERVICE_ROLE_KEY = '<service-role-key>'
```
Ne laissez pas ces lignes commitées ; utilisez votre gestionnaire de secrets (Vercel / GitHub Actions / Azure DevOps).

4) Appliquer toutes les migrations locales vers le projet Supabase (commande recommandée)
```powershell
# Utilise la version locale du CLI (reproductible pour tous les agents)
pnpm exec supabase db push
```

5) Exécuter uniquement la migration SQL que nous venons d'ajouter (fichier)
```powershell
# Envoie le SQL du fichier au projet Supabase (nécessite service_role key)
$env:SUPABASE_SERVICE_ROLE_KEY = '<service-role-key>'
pnpm exec supabase sql query --file supabase\migrations\20251221120000_add_storage_path_and_rpc_and_bucket.sql
```

6) Vérifications post-migration (SQL examples)
```sql
-- Vérifier colonne storage_path
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'document' AND column_name = 'storage_path';

-- Vérifier l'existence de la fonction RPC
SELECT proname, prosrc
FROM pg_proc
WHERE proname = 'next_facture_numero';

-- Vérifier le bucket 'documents' (supabase internal table)
SELECT id, name, public
FROM storage.buckets
WHERE id = 'documents';
```

7) Bonnes pratiques pour les agents / CI
- Toujours exécuter `pnpm install` avant d'utiliser `pnpm exec`.
- Préférer `pnpm exec supabase -- <cmd>` ou `pnpm run supabase -- <cmd>` (script `supabase` exposé dans `package.json`).
- Stocker les clés en tant que secrets CI et les injecter au runtime.

8) Rollback / sauvegarde
- Exporter snapshot SQL avant migration si nécessaire :
  - via Supabase Studio ou `pg_dump` avec les credentials admin.

Si tu veux, j'ajoute des snippets pour GitHub Actions/CI afin d'exécuter `db push` automatiquement (avec secrets). 

---
Fait par automation — modifie selon ton environnement.
