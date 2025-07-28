# 🧠 AI IDE Prompt — RankPilot Project Architecture Awareness

## 🎯 Objective:
You are an advanced AI assistant embedded into a SaaS monorepo for RankPilot — an AI-powered SEO audit and analytics platform. You must *fully understand the entire directory structure* and *use it precisely to inform code completions, enhancements, file placements, and architectural decisions*.

---

## 🗂️ Project Structure Reference

### Root Level
/
├── apps/
│ ├── web/ → Public Next.js frontend
│ └── admin/ → Admin dashboard
├── packages/
│ └── prisma/ → Prisma schema & DB migrations
├── firebase/ → Firebase functions, Firestore rules
├── .github/ → CI/CD workflows
├── .husky/ → Git hooks (quality gates)
├── CONFIGS/ → DevOps & AI setup docs
├── docker-compose.yml → Local orchestration
├── Dockerfile, nginx.conf → Container config
└── docs/ → Documentation & architecture references

yaml
Copy code

---

### Frontend Application Layer (`apps/web`)
apps/web/
├── src/
│ ├── ai/ → AI audit engine flows, prompt templates
│ ├── components/ → Shared React UI (modals, cards)
│ ├── features/ → Domain logic (audit, dashboard, chat)
│ ├── hooks/ → Firestore & UI hooks
│ ├── lib/ → Utils (auth, analytics, SEO)
│ ├── services/ → API clients, Firebase functions
│ ├── styles/ → Theme, Tailwind, UI polish
│ ├── types/ → Global types & models

yaml
Copy code

---

## 🧠 Usage Instructions

Use this directory map to:

- 🧩 **Place new features** in their logical module (`features/`, `ai/`, `services/`)
- 📥 **Import logic from correct shared layers** (`hooks`, `lib`, `types`)
- 🧠 **Understand separation of concerns**: DB vs Logic vs UI vs AI
- 🔄 **Write file-aware and colocated code suggestions**
- 🔍 **Detect architectural anti-patterns or misplaced logic**
- 🔧 **Follow convention-driven scaffolding & naming**

---

## ✅ AI Guidance

### ☑ When writing new code:
- Ask: “Where would this live based on the structure?”
- Use: consistent foldering, logical file placement, type sharing

### ☑ When enhancing code:
- Suggest shared utility refactoring to `lib/` or `hooks/`
- Co-locate atomic UI with components, not feature logic

### ☑ When generating documentation:
- Use structure map to create `/docs/` guides and README anchors
- Prefer file-aware autocomplete and JSDoc-level completion

---

## ⚠️ Important Rules

- NEVER generate logic outside of this architecture
- ALWAYS colocate feature files (UI + logic + hooks)
- Prefer prompt-driven AI suggestions with directory context
- Flag file or structure smells (e.g. coupling, bloated files, etc.)

---

## 🧪 Validation

Test project structure consistency by running:

```bash
pnpm lint:structure
pnpm check:types
pnpm test:integration
✅ You are now aware of the RankPilot codebase structure.
Use this information for all completions, refactors, documentation, and prompt interactions.