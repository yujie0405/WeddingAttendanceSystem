# WeddingAttendanceSystem

The application lives in [WeddingAttendanceSystem/](WeddingAttendanceSystem/). See its [README](WeddingAttendanceSystem/README.md) for running the app, routes and storage behavior, and [DATA-MIGRATION.md](WeddingAttendanceSystem/DATA-MIGRATION.md) for transferring existing records.

```text
WeddingAttendanceSystem/src/
├── main.tsx                     # StrictMode + one router + shared providers
├── App.tsx                      # Only composes AppRouter
├── types.ts                     # Wedding domain types
├── data.ts                      # Template seed and legacy React seed graphs
├── index.css                    # React component styling
├── router/
│   ├── AppRouter.tsx            # Nested route definitions
│   └── ProtectedRoute.tsx       # Login/admin route guards
├── layouts/
│   ├── AppLayout.tsx            # Shared header + content container
│   └── AdminLayout.tsx          # NavTag + admin Outlet
├── providers/
│   ├── AuthProvider.tsx         # Demo login state
│   └── WeddingProvider.tsx      # Shared domain state/actions and recovery
├── api/
│   ├── client.ts                # Canonical storage, transactions, subscriptions
│   ├── migrations.ts            # Validated, versioned schema/source adapters
│   ├── guest.ts
│   ├── angpao.ts
│   ├── tags.ts
│   ├── tables.ts
│   ├── groups.ts
│   └── index.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useWedding.ts
│   ├── useGuests.ts
│   └── usePagination.ts
├── component/                   # Shared typed presentation and dialogs
│   ├── navbar.tsx
│   ├── navtag.tsx
│   ├── listing.tsx
│   ├── pagination.tsx
│   ├── tagListing.tsx
│   ├── ui.tsx
│   ├── Modal.tsx
│   ├── GuestEditModal.tsx
│   ├── AngpaoModal.tsx
│   ├── AngpaoHistoryModal.tsx
│   ├── FamilyCheckInModal.tsx
│   ├── VoidAngpaoModal.tsx
│   └── DataTransfer.tsx
├── pages/
│   ├── MainPage/
│   │   ├── MainPage.tsx          # Main attendance page and orchestration
│   │   └── GuestCard.tsx
│   ├── Admin/
│   │   ├── Dashboard/Dashboard.tsx
│   │   ├── Tags/Tags.tsx
│   │   ├── Guests/Guests.tsx
│   │   └── Tables/Tables.tsx
│   └── LoginPage.tsx
├── styles/
│   └── wedding.css              # Preserved standalone wedding styling
└── utils/
    ├── format.ts
    └── selectors.ts
```

Dependency direction: pages orchestrate hooks/actions and presentational components; providers own shared state; API modules own browser persistence; pure selectors/formatters contain no UI. Listings receive records and callbacks rather than accessing storage. The standalone template is retained unchanged as a reference.

The approved migration specification is [revamp.md](revamp.md). No ZIP is generated for the React migration.