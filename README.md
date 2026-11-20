# Wedding Attendance System

A bilingual wedding reception app for managing guest arrivals, seating assignments, and angpau (cash wedding gifts). Reception staff can find guests and check them in, while administrators can prepare guest records, manage tables and tags, and review gift totals and history.

The React/TypeScript frontend now connects to the .NET 8 API under `WeddingSystem/`, using backend database password login and Bearer-authenticated requests. Configure the public frontend connection settings in `WeddingAttendanceSystem/.env`. The API uses Controller -> BLO -> DBO layers and EF Core PostgreSQL mappings; database credentials stay on the backend. The original browser-only demo remains available through `VITE_DATA_SOURCE=local`.

## Contents

- [Features](#features)
- [Getting started](#getting-started)
- [User manual](#user-manual)
- [Pages and access](#pages-and-access)
- [Project structure](#project-structure)
- [Architecture and technology](#architecture-and-technology)
- [Data storage and recovery](#data-storage-and-recovery)
- [Development and verification](#development-and-verification)
- [Build and hosting](#build-and-hosting)
- [Troubleshooting](#troubleshooting)
- [Further documentation](#further-documentation)

## Features

**Connected API mode (default):** Database email/password registration and login, server-controlled roles, guest creation/editing, party size, one relationship per guest, table numbers, attendance status changes, server pagination/search/filters, relationship management, and admin-only angpau totals. Family groups, multiple tags, table capacities, gift history/voiding, and JSON import/export remain available only in the local demo until the server schema is extended. Existing browser records are preserved, not imported or uploaded automatically.

The feature table and detailed reception manual below describe the original local demo. Connected mode presents only the supported server workflows; it never falls back to demo data on API failure.

| Area | Capabilities |
| --- | --- |
| Attendance | Individual check-in, undo check-in, family check-in, and an arrived/total summary |
| Guest search | Search by guest, family, or table; filter by wedding side, attendance, table, and tag |
| Guest management | Add and edit guests, relationships, wedding side, table, optional seat, and tags |
| Seating | Add tables with a capacity, view assigned counts, and delete unreferenced tables |
| Gift registration | Record individual or family angpau in Malaysian ringgit (RM), with optional notes |
| Financial review | Administrator gift totals, individual/family breakdowns, history, and voiding with a reason |
| Languages | English and Simplified Chinese, with a saved language preference |
| Data transfer | Validated JSON import/export, legacy data migration, and recovery when sources conflict |

The interface supports desktop and mobile layouts. Guest management shows 20 records per page; table management shows 10 tables per page.

## Getting started

### Requirements

- Node.js and npm installed and compatible with the versions in the application’s `package.json` and lockfile.
- A modern browser with JavaScript and browser storage enabled.
- Internet access to install dependencies. Bootstrap CSS is also loaded from a CDN at runtime.

### Start the application

For connected mode, fill in `WeddingAttendanceSystem/.env` (already created locally; `.env.example` is the committed template):

```dotenv
VITE_DATA_SOURCE=api
VITE_API_BASE_URL=http://localhost:5247/api
```

Never put a PostgreSQL password, connection string, service-role key, or user access token in a `VITE_` variable; these values are delivered to browsers. Restart Vite after editing `.env`. Configure database login and a private signing key using the [database login setup](WeddingSystem/WeddingSystem/Database/README.md). Keep `Authentication:AdminUserIds` and `ConnectionStrings:WeddingDb` on the backend; see [backend.md](backend.md).

Start the backend in one terminal, from the repository root:

```powershell
dotnet run --project WeddingSystem/WeddingSystem/WeddingSystem.csproj --launch-profile http
```

Start the frontend in another terminal, from the repository root:

```sh
cd WeddingAttendanceSystem
npm ci
npm run dev
```

Open the **Local** URL printed by Vite in the terminal. Keep the terminal running while using the development server; press `Ctrl+C` to stop it.

On Windows PowerShell, use `npm.cmd` in place of `npm` if execution policy blocks `npm.ps1`.

The React app must run through Vite or a web server. Opening its `index.html` directly from the filesystem does not start the application. A separate standalone HTML version is retained in `WeddingAttendanceSystem/template/`.

### First launch and demo accounts

**Connected mode:** register on the login page, then sign in with email/password. The backend verifies the hash in `User.Password` and issues an eight-hour token. The frontend stores it for the current tab and includes it in API requests. Existing Supabase accounts migrate their password on the first successful login. `/api/auth/me` supplies the role from backend authorization; account names never grant administrator access. New registrations do not send confirmation emails.

**Local demo only:** set `VITE_DATA_SOURCE=local` in `.env` and restart Vite to use the sample records and demo accounts described below. Local records and real API records are independent.

A fresh browser origin starts with sample records and a default administrator session. To try another role, select **Log out**, then sign in:

| Example account name | Role |
| --- | --- |
| `admin` or `wedding-admin` | Administrator |
| `reception` or `Alice` | Staff |

Any name containing `admin`, ignoring letter case, receives the administrator role. Other names receive the staff role. The password field accepts any password in demo mode; no server validates credentials.

**Demo access is not a production security boundary.** Roles and records are stored locally in the browser. Real access control, shared accounts, and a central database would require additional implementation.

## User manual

The instructions below use the English interface labels. Switch to English or Chinese using the language control in the header or login page.

### 1. Prepare the guest list

Sign in as an administrator and open **Admin settings**.

1. Open **Tags** and add relationship/category names such as `Relatives`, `Friends`, or `Colleagues`.
2. Open **Table Settings**, enter a positive whole-number capacity, and select **Add table**.
3. Open **Add / Edit Guests**. Enter a guest name, choose a relationship, select the groom or bride side, and assign a table.
4. Select **Add guest**. Repeat for the remaining guests.
5. Use **Edit** on a guest row to update their details, assign multiple tags, or enter an optional seat number, then select **Save changes**.

At least one tag and one table must exist before adding guests. New relationship choices come from current tag names; editing also preserves existing legacy relationship text.

Tables receive increasing numbers automatically. Deleting a table does not renumber the others or reuse its number. A table referenced by a guest or family reservation cannot be deleted.

Family check-in and family gifts use existing family/group associations in the dataset. The current guest form adds individual guests; it does not provide a family/group creation editor.

### 2. Find and check in a guest

1. Open **Check-in home**.
2. Search by guest name, family name, or table number.
3. Narrow the results using wedding side, attendance status, table, or tag filters.
4. Confirm the guest’s identity and seating information, then select **Check in** on their card.
5. The card changes to checked in and the attendance summary updates.

To correct an accidental check-in, select **Arrived (undo)** on that guest’s card. Only active guests appear on the check-in page.

### 3. Check in a family

For a guest with an existing family association, select **Check in family**. Review the family name and remaining member count, then confirm. This marks the family’s remaining active, pending guests as arrived; guests still appear as individual cards.

### 4. Register an angpau

1. Find the guest on the check-in page and select **Register angpau**.
2. If the guest belongs to a family, choose **Individual** or **Family** to identify who gave the gift.
3. Enter a positive amount in RM, with up to two decimal places.
4. Optionally add wishes or notes, then select **Save**.

Quick amount buttons **add** their displayed value to the current amount. For example, selecting `+100` twice enters RM 200.

Staff can record gifts, while viewing financial amounts and history is restricted to administrators. A family gift is recorded against the family and counted once in overall totals.

### 5. Review gifts and correct mistakes

As an administrator, open **Dashboard** to search guest records and review individual gifts, family gifts, and the overall angpau total. Open the relevant gift history to see recorded amounts and metadata.

For an incorrect or duplicate entry:

1. Open the gift’s history and select **Void**.
2. Enter the required reason and select **Confirm void**.
3. Register a replacement gift if needed.

Voided gifts remain in history for audit purposes and are excluded from valid gift totals. Financial records are not permanently deleted through this workflow.

### 6. Back up or move records

As an administrator, open **Tags**, then find **Data backup & import**.

- **Export JSON backup** downloads the current wedding dataset as `wedding-data.json`.
- **Import JSON** accepts a complete compatible dataset, validates it, and asks you to confirm the guest, table, and gift counts before replacing current records.

**Import replaces the dataset; it does not merge guest lists.** Before replacement, the app saves the previous canonical snapshot in browser storage. Export a separate JSON backup before moving devices or making major changes. Browser-local backups are lost if that browser’s site data is cleared.

To transfer records, export on the original browser/device and import on the destination. Keep exported files private because they contain guest and financial information. See [the migration guide](WeddingAttendanceSystem/DATA-MIGRATION.md) for transfers from the standalone template.

### 7. Change language or end a session

Use the language control to switch between English and Simplified Chinese. Chinese is the default. The selection survives refresh, navigation, and login/logout; names, saved tags, relationships, notes, and void reasons retain their original text. Currency stays in RM.

Select **Log out** when finished. Logging out ends the local session without deleting wedding records.

## Pages and access

| Route | Purpose | Access |
| --- | --- | --- |
| `/login` | Demo sign-in | Public |
| `/` | Guest search, check-in, editing, and gift entry | Signed-in staff and administrators |
| `/admin` | Redirect to the dashboard | Administrator |
| `/admin/dashboard` | Gift totals, history, and voiding | Administrator |
| `/admin/tag` | Tags and JSON backup/import | Administrator |
| `/admin/add-guest` | Add and edit guest records | Administrator |
| `/admin/table-setting` | Table capacity and assignment overview | Administrator |

In local mode these restrictions control only the demo interface. In API mode, authenticated reads and staff attendance updates are enforced by the backend, while guest/relationship management and all financial endpoints additionally require the server Admin policy. Admins set table capacities in Table Settings. Guest assignments use party size, and a table at capacity cannot accept another party. Admins can delete guest records from Add / Edit Guests.

## Project structure

The repository contains a nested application directory. Run npm commands inside `WeddingAttendanceSystem/`.

```text
WeddingAttendanceSystem/                 Repository root
|-- README.md                            Project overview and user manual
|-- revamp.md                            React migration specification
|-- i18n.md                              Internationalization specification
`-- WeddingAttendanceSystem/             Application root
    |-- package.json                     Dependencies and npm scripts
    |-- package-lock.json                Locked dependency versions
    |-- index.html                       Vite entry document; Bootstrap CDN
    |-- vite.config.ts                   Vite configuration
    |-- tsconfig*.json                   TypeScript configuration
    |-- public/                          Public static assets
    |-- src/
    |   |-- main.tsx                     React root, router, and shared providers
    |   |-- App.tsx                      Route definitions
    |   |-- types.ts                     Domain types
    |   |-- data.ts                      Template and legacy seed data
    |   |-- api/                         Browser storage, migrations, domain APIs
    |   |-- providers/                   Authentication and shared wedding state
    |   |-- hooks/                       Auth, wedding, guest, pagination hooks
    |   |-- router/                      Authentication and administrator guards
    |   |-- layouts/                     Shared application and admin layouts
    |   |-- pages/
    |   |   |-- LoginPage.tsx            Demo sign-in
    |   |   |-- MainPage/                Guest cards and check-in workflow
    |   |   `-- Admin/                   Dashboard, Tags, Guests, Tables
    |   |-- component/                   Shared UI, listings, dialogs, transfer
    |   |-- locales/                     CN.json and EN.json translations
    |   |-- i18n/                        Translation setup, typing, messages
    |   |-- styles/                      Wedding styling
    |   |-- index.css                    React component styling
    |   `-- utils/                       Pure selectors and formatting helpers
    |-- template/                        Standalone HTML/CSS/JavaScript version
    |-- template-reference/              Additional template reference files
    |-- tests/                           Browser regression scripts and guide
    |-- verification/                    Recorded reports and screenshots
    |-- DATA-MIGRATION.md                Record transfer and recovery guide
    |-- README.md                        Application implementation notes
    `-- dist/                            Generated production build
```

`node_modules/` is generated by dependency installation; `dist/` is generated by the build.

## Architecture and technology

| Technology | Purpose |
| --- | --- |
| React + TypeScript | Typed components, forms, and domain models |
| Vite | Development server and production bundling |
| React Router | Nested routes, layouts, and navigation |
| React Context + hooks | Shared authentication and wedding state |
| i18next + react-i18next | Bundled English/Chinese interface translations |
| Bootstrap CSS + custom CSS | Layout and visual styling |
| Font Awesome React packages | Interface icons |
| localStorage + Web Locks where available | Browser persistence and coordinated writes |
| Oxlint | Source linting |
| Playwright (optional tooling) | Browser regression verification |

Connected pages use `src/api/backend.ts` and `src/api/http.ts` for the .NET HTTP API and `src/api/supabase.ts` for authentication only. The HTTP client attaches Bearer tokens and retries once after session refresh on a 401. `src/pages/Backend/BackendPage.tsx` implements the server-supported workflows. Local demo pages retain their original hooks, state provider, persistence, and validation. Pure selectors and formatting utilities keep calculations separate from UI components.

The main domain records are guests, family groups, tags, tables, and angpau records. Guest and family references connect seating and gifts to their recipients.

## Data storage and recovery

This section describes the local demo dataset. In API mode, wedding records live in PostgreSQL and are refetched after mutations, on window focus, or through Refresh. There is no silent local-data fallback or automatic JSON migration. Tab session storage holds the backend access token; browser local storage holds the language preference; sign out on shared devices.

| Storage key | Contents |
| --- | --- |
| `wedding-react-v2` | Canonical version 2 wedding dataset |
| `wedding-react-auth-v2` | Local demo session |
| `wedding-language` | Interface language preference |
| `wedding-react-v2:backup:<timestamp>` | Previous canonical snapshot saved during import |

Compatible legacy React keys (`wedding_guests`, `wedding_angpao`) and standalone template keys (`wedding-template-v1:*`) are preserved during migration. When both legacy sources exist, the app asks which source to use instead of silently merging them. Invalid records produce a recovery/error screen before replacement.

Writes persist a single JSON snapshot. Web Locks coordinate transactions when supported; a synchronous localStorage fallback is used otherwise. Other tabs on the same browser origin receive storage updates.

**Storage belongs to a browser profile and origin.** Different devices, browsers, hostnames, protocols, and ports do not automatically share records. Serving the app on a network does not turn it into a shared reception database. Clearing site data or using temporary/private browsing can remove local records. There is no cloud synchronization or automatic remote backup.

## Development and verification

Run these commands from the application directory:

| Command | Purpose |
| --- | --- |
| `npm ci` | Install dependencies from the lockfile |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Run TypeScript build checks and generate `dist/` |
| `npm run lint` | Run Oxlint |
| `npm run preview` | Serve the production build locally |

Optional browser suites are available:

```sh
node tests/react-migration.cjs
node tests/i18n.cjs
```

They require a running development server, Playwright tooling, and Microsoft Edge. Follow [the test setup guide](WeddingAttendanceSystem/tests/README.md) before running them. Playwright is not an application dependency, and there is no `npm test` script.

The migration suite covers storage migration, conflicts, gift voiding, concurrent edits, role guards, pagination, JSON transfer, and layout checks. The language suite covers translation parity, saved preferences, validation, form preservation, and both interface languages. Recorded results live in `verification/`; they describe previous runs, not automatic validation of every future change.

For interface changes, add matching translation keys and interpolation parameters to both `src/locales/CN.json` and `src/locales/EN.json`. Use the translation helpers in components and keep stored guest content separate from interface translations.

## Build and hosting

```sh
cd WeddingAttendanceSystem
npm run build
npm run preview
```

Publish the generated `WeddingAttendanceSystem/dist/` directory to a static web host. Configure the host to serve `index.html` for application routes so direct visits or refreshes at `/admin/dashboard` and other nested paths work. `npm run preview` is intended for local build inspection.

The app uses `BrowserRouter`. Hosting under a subdirectory may require configuring Vite’s base path and the router basename. Bootstrap currently depends on its CDN; a fully self-contained offline distribution would need that stylesheet bundled locally.

Build connected mode with the production API/Supabase addresses supplied through the frontend environment and configure the backend's CORS origins for the deployed frontend. If using the local demo, saved wedding records remain in each browser; export/import them when changing origins.

## Troubleshooting

| Problem | What to check |
| --- | --- |
| npm cannot find `package.json` | Change into the nested `WeddingAttendanceSystem/` application directory. |
| PowerShell blocks `npm.ps1` | Use `npm.cmd`, for example `npm.cmd run dev`. |
| Admin settings are unavailable | Log out and sign in with a name containing `admin`. |
| Add guest is disabled | Create at least one tag and one table first. |
| A guest is missing from check-in | Clear search and filters; the main page only displays active guests. |
| A table cannot be deleted | Reassign guest references and family reservations first. |
| Records seem missing at another address | Return to the original browser/profile and origin, export JSON, then import at the destination. |
| Import fails | Use a complete compatible backup and check the reported schema/reference error; keep the original file. |
| A source-selection screen appears | Choose the intended legacy dataset or import a complete backup. Original source keys are retained. |
| Refreshing an admin URL returns a host 404 | Configure the static host’s application fallback to `index.html`. |
| Styling is incomplete | Check whether the Bootstrap CDN stylesheet can load. |

## Further documentation

- [Backend setup, configuration, and continuation prompt](backend.md)
- [Application implementation notes](WeddingAttendanceSystem/README.md)
- [Data transfer and migration guide](WeddingAttendanceSystem/DATA-MIGRATION.md)
- [Browser test setup and coverage](WeddingAttendanceSystem/tests/README.md)
- [React migration specification](revamp.md)
- [Internationalization specification](i18n.md)
