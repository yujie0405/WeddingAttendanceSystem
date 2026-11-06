# WeddingAttendanceSystem
src/
├── main.tsx                 ← Entry point: imports Bootstrap CSS/JS, mounts <App/>
├── App.tsx                  ← Shell: top nav, page switching
├── config.ts                ← API base URL + env-driven config
├── data.ts                  ← Static reference data (enums, label maps, dropdowns)
├── types.ts                 ← Shared domain types (forms, records, status keys)
│
├── api/                     ← Server boundary — pure functions, no React
│   ├── client.ts            ← fetch wrapper: base URL, headers, error normalization
│   ├── types.ts             ← Request/response DTOs
│   ├── feedback.ts          ← Domain-grouped endpoints (submit, upload, verify…)
│   ├── search.ts            ← Domain-grouped endpoints (searchFeedbacks…)
│   └── index.ts             ← Barrel re-exports for clean imports
│
├── hooks/                   ← Server-state hooks — wrap api/* for React
│   ├── core.ts              ← useMutation + useCachedQuery primitives (no library)
│   ├── useFeedback.ts
│   ├── useSearch.ts
│   ├── useUtil.ts
│   └── index.ts             ← Barrel re-exports
│
├── components/              ← Reusable UI primitives — no business logic
│   ├── ui.tsx               ← Design system bundle: Button, Field, Input, Card,
│   │                          SectionHead, Stepper, EmptyState, Hero, StatusBadge,
│   │                          Logo + icon set
│   ├── DropZone.tsx         ← File picker with drag/drop
│   ├── OtpInput.tsx         ← N-digit verification code grid
│   └── Tab.tsx              ← Pill button, variant: "filter" | "nav"
│
├── pages/                   ← Feature/route-level code — orchestration only
│   ├── submit/
│   │   ├── SubmitFlow.tsx   ← Page root: state machine, mutation pipeline
│   │   ├── StepHeader.tsx   ← Stepper config for this flow
│   │   ├── StepDetails.tsx  ← Step 1 form
│   │   ├── StepComplaint.tsx← Step 2 form
│   │   ├── StepVerify.tsx   ← Step 3 (uses <OtpInput>)
│   │   ├── StepDone.tsx     ← Step 4 confirmation
│   │   ├── ReimbursementBlock.tsx  ← Conditional sub-form (uses <DropZone>)
│   │   └── helpers.ts       ← Page-local utils (mask, format)
│   │
│   └── search/
│       └── SearchFlow.tsx   ← Page root: search form + results panel
│
└── images/                  ← Static asset imports