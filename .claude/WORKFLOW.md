# Workflow Coordination Guide
# Comment utiliser les 2 espaces efficacement

## 🎯 STRATÉGIE (Ce Chat Actuel)

### Types de sessions
1. **Planning stratégique** (1x/semaine, 30-45min)
   - Révision backlog priorité
   - Discussion business impact
   - Décisions architecture majeure
   - Exemple: "On fait comment pour supporter 1000 utilisateurs?"

2. **Retrospective/Lessons Learned** (1x/semaine, 15-30min)
   - Points d'amélioration dev
   - Dettes techniques identifiées
   - Feedback utilisateurs
   - Changements de direction

3. **Pivot/Re-prioritization** (Ad-hoc)
   - Changements business requirements
   - Feedback stakeholders
   - Découverte de contraintes tech
   - Exemple: "Les entreprises demandent export Excel"

### Prompts à utiliser ici
```
"Claude, on fait un point stratégie sur..."
"Pour les 3 prochains mois, je vois ces priorités..."
"J'envisage de..."
"Quel est ton avis sur..."
```

---

## 🚀 DÉVELOPPEMENT (Projet FlowChat MVP)

### Types de sessions
1. **Feature implementation** (Quotidien)
   - Code new features
   - Fix bugs spécifiques
   - Refactor sections
   - Add tests

2. **Technical debugging** (As-needed)
   - Production issues
   - Performance optimization
   - Error investigation
   - Database queries

3. **Configuration & setup** (Occasional)
   - New tools setup
   - Environment configuration
   - CI/CD adjustments
   - Database migrations

### Prompts à utiliser là-bas
```
"Implémente la page dashboard"
"Debug pourquoi le login échoue"
"Optimise cette requête DB"
"Crée un test pour..."
```

---

## 🔄 HANDOFF ENTRE LES DEUX ESPACES

### Du Dev au Stratégie
**Quand remonter au stratégie:**
- "J'ai implémenté X, mais ça ne scale pas pour Y"
- "Cette feature demanderait une refonte majeure"
- "J'ai découvert une contrainte tech"
- "Le scope s'élargit, besoin de rediscuter priorités"

**Exemple handoff:**
```
Dev: "J'ai testé les performances sur 1000 qualifications.
La requête DB prend 3 secondes. Besoin de repenser le modèle."

Stratégie: "OK, c'est un problème d'architecture. 
On peut faire une migration progressive vs refonte totale?
Impact timeline?"
```

### De la Stratégie au Dev
**Quand descendre au dev:**
- Décisions prises, besoin d'implémentation
- Nouvelles priorités clairement définies
- Architecture décidée, besoin de coding
- Tests à ajouter sur nouvelle feature

**Exemple handoff:**
```
Stratégie: "On a décidé que les exports PDF
seront générés en background via n8n."

Dev: "OK, je crée l'API route, le webhook, et les tests."
```

---

## 📊 MATRICE DÉCISIONS

| Question | Espace | Justification |
|----------|--------|---------------|
| "Comment déployer?" | Stratégie | Long-terme, business impact |
| "Pourquoi ce bug?" | Dev | Tactical, implementation |
| "On refonde l'auth?" | Stratégie | Impact architecture globale |
| "Comment fixer ce bug auth?" | Dev | Tactical, specific fix |
| "Inclure Telegram?" | Stratégie | Business feature, priorités |
| "Code Telegram webhook" | Dev | Implémentation, tests |
| "Quelle base de données?" | Stratégie | Architecture majeure |
| "Optimiser requête DB?" | Dev | Performance tactical |

---

## ✅ BEST PRACTICES

### Dans Stratégie
- ✅ Documente les décisions prises
- ✅ Réfère-toi à précédentes sessions
- ✅ Pense en termes de "value" et "effort"
- ❌ N'écris pas de code ici
- ❌ N'entre pas dans les détails implementation

### Dans Dev
- ✅ Réfère-toi aux décisions stratégie
- ✅ Signale les problèmes techniques
- ✅ Optimise pour clarté et maintenabilité
- ❌ Ne prends pas décisions architecturales majeures
- ❌ Pas de "pivots" sans discuter stratégie d'abord

---

## 🗂️ COMMENT DÉMARRER

### Initialisé le Dev Workspace
1. Ouvre Claude Code
2. Crée nouveau workspace "FlowChat MVP"
3. Configure git comme projet séparé (ou branche dev)
4. Charge le contexte technique (voir `.claude/context.md`)
5. C'est prêt!

### Utilise celui-ci pour Stratégie
- Continue les sessions planning ici
- Documente les décisions
- Valide les pivots
- Priorise le backlog

---

## 📝 SESSION TEMPLATE

### Stratégie (à faire en début de semaine)
```
## Status
- Qu'on a achevé cette semaine
- Blockers identifiés

## Priorités semaine prochaine
- Top 3 items

## Dettes tech à adresser
- Points techniques critiques

## Questions ouvertes
- Points qui nécessitent décision
```

### Dev (à faire régulièrement)
```
## Sprint actif
- Item en cours
- Blockers

## À faire
- Next tasks

## PR/Revues
- Code review status

## Issues découvertes
- Bugs, perf issues, tech debt
```
