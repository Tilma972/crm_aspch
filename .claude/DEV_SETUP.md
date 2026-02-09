# 🚀 FlowChat MVP - Setup Dev Workspace

Cette configuration est pour **Claude Code - Workspace de développement**.

## 🎯 Objectif

Espace dédié pour:
- ✅ Implémentation daily
- ✅ Bug fixing & debugging
- ✅ Refactoring & performance
- ✅ Testing & validation

## 📋 Steps to Setup (Dans Claude Code)

### 1. Create New Workspace
```
File → New Workspace → "FlowChat MVP Dev"
```

### 2. Load Project
```
Open Folder → c:\Users\calen\crm_aspch
```

### 3. Configure Git (Optional but Recommended)
```bash
# Create dev branch if not exists
git checkout -b dev

# Or work on current branch
# Either way, dev happens in Claude Code
```

### 4. Install Dependencies (if needed)
```bash
npm install
```

### 5. Start Dev Server
```bash
npm run dev
```

Server runs on `http://localhost:3000`

### 6. Load Context
```
In Claude Code chat:
"Load .claude/CONTEXT.md for project context"
```

---

## 📝 Development Guidelines

### Code Style
- TypeScript strict mode enabled
- ESLint configured
- Prettier for formatting
- Component-based architecture

### Database
- Use `createClient()` from `/lib/supabase/server` for server
- Use `createClient()` from `/lib/supabase/client` for browser
- Use `createAdminClient()` for privileged operations
- Always consider RLS policies

### Error Handling
```typescript
// ✅ Good
if (response.error) {
  console.error('Specific error:', response.error);
  return { error: response.error.message };
}

// ❌ Avoid
if (!response) {
  return { error: 'Something went wrong' };
}
```

### Testing
- Write tests for critical flows (auth, billing)
- Use React Query for data fetching
- Test RLS policies separately

### Commits
```bash
git commit -m "feat: Add export to Excel"
git commit -m "fix: Handle null date_paiement"
git commit -m "refactor: Improve query performance"
```

---

## 🔧 Common Tasks

### Add a New Page
```typescript
// app/(dashboard)/new-page/page.tsx
import { createClient } from "@/lib/supabase/server";

export default async function NewPage() {
  const supabase = await createClient();
  // Implementation
}
```

### Add an API Route
```typescript
// app/api/new-route/route.ts
import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const adminSupabase = await createAdminClient();
  // Implementation
}
```

### Run Database Migration
```bash
npx supabase db push
# Or pull changes from remote
SUPABASE_ACCESS_TOKEN=[token] npx supabase db pull
```

### Debug Supabase
```typescript
// Add to any server component
const { data, error } = await supabase.from('table').select();
console.log('Supabase response:', { data, error });
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Module not found | Run `npm install` |
| Port 3000 in use | `npm run dev -- -p 3001` |
| Auth failing | Check `.env.local` is loaded |
| DB query 404 | Check RLS policies + use admin client |
| Build error | Run `npx tsc --noEmit` to see types |

---

## 📊 Typical Dev Day

```
Morning (2h)
├── Check overnight issues
├── Pull latest from main
└── Start on feature

Afternoon (2h)
├── Implement feature/fix
├── Test locally
├── Create PR or commit
└── Log issues for next day
```

---

## 🎓 Learning Resources

- **Next.js Docs:** https://nextjs.org/docs
- **Supabase Docs:** https://supabase.com/docs
- **React Query:** https://tanstack.com/query/latest
- **Tailwind:** https://tailwindcss.com/docs

---

## ✨ Remember

- Every commit to `main` should be production-ready
- Test in mobile view before committing
- RLS policies are your friend, not the enemy
- When in doubt, ask Strategy (this chat) first!

Good luck! 🚀

