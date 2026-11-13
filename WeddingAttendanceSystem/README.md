# Wedding Attendance System

React + TypeScript + Vite implementation of the latest standalone wedding template. The reference HTML/CSS/JavaScript in `template/` is retained unchanged.

## Run

From this directory:

```sh
npm install
npm run dev
```

On Windows PowerShell, use `npm.cmd` if execution policy blocks `npm.ps1`. Open the Vite Local URL printed in the terminal. This React module app needs Vite or a web server; double-click opening remains supported by the separate standalone template.

```sh
npm run build
npm run preview
```

Bootstrap CSS is loaded once through the existing CDN in `index.html`. Icons use the installed Font Awesome React packages. No Tailwind or CDN React/Babel is used.

## Structure

- `src/App.tsx`: declares application routes directly; page UI stays in page components.
- `src/main.tsx`: mounts one BrowserRouter and the shared auth/wedding providers.
- `src/router/`: authenticated/admin route guards; route definitions are in `App.tsx`.
- `src/layouts/`: shared header, content shell, and admin tab layout.
- `src/pages/MainPage/MainPage.tsx`: main attendance interface, search/filters, individual guest listing and modal orchestration.
- `src/pages/Admin/`: Dashboard, Tags, Guests and Tables route components.
- `src/component/navtag.tsx`: the admin navigation strip, using NavLink.
- `src/component/listing.tsx`: typed, reusable card/table presentation without storage or business logic.
- `src/component/`: reusable pagination, badges, tag selection, modal and feature form components.
- `src/hooks/`: context consumers and pagination. `useGuests` reads the single shared store.
- `src/providers/`: authentication, storage recovery, shared domain mutations and notifications.
- `src/api/`: typed localStorage-backed functions, migration/validation and serialized transactions. There is no HTTP backend.
- `src/types.ts`, `src/data.ts`: domain types and the original template/legacy seed graphs.
- `src/utils/`: pure formatting and selectors.
- `src/styles/wedding.css`, `src/index.css`: migrated original styles and React component presentation.

## Routes

| Route | Screen |
| --- | --- |
| `/` | Guest check-in |
| `/login` | Demo login |
| `/admin` | Redirect to dashboard |
| `/admin/dashboard` | Guest angpau amounts, totals, gift history and voiding |
| `/admin/tag` | Tags and JSON backup/import |
| `/admin/add-guest` | Create/edit guests, 20 per page |
| `/admin/table-setting` | Add/delete tables, 10 per page |

Direct reloads of nested routes require the production web host to serve `index.html` for application routes. Vite handles this during development/preview.

## Behavior

The check-in page lists guests individually; family check-in remains available from their guest cards. Family gifts are accessible from guest rows and counted once, without a separate family listing. Financial amounts in lists/history are admin-only; the existing gift amount entry form remains available for recording gifts.

Relationships use current tags, while editing retains existing legacy free-text values. Search precedes pagination. Deleting the last table on a page clamps the page; new table numbers increase without reuse. Referenced guest/family tables cannot be deleted.

Demo login preserves the existing convention: a name containing `admin` gives the admin role; other names give the staff role. Initial demo access is admin, matching the template. This is browser-local demo authentication, not a production security boundary.

## Saved data and migration

- Canonical domain data: `wedding-react-v2` (version 2).
- Login state: `wedding-react-auth-v2`.
- Original React keys (`wedding_guests`, `wedding_angpao`) and template keys (`wedding-template-v1:*`) are preserved.
- A fresh installation uses the current template's seed records, with IDs intact.
- Existing saved React/template data is validated and adapted before canonical storage is written. A conflict between both sources opens a source-selection screen rather than silently merging graphs.
- Related IDs, groups, reserved tables, guest activity/phone/notes, gift notes/void reasons, and the table sequence are retained.
- Tags deleted in the original app may still be referenced by old records; these references are preserved rather than erasing guest data.
- Mutations use a single atomic JSON snapshot and Web Locks where available; cross-tab changes update the UI without persistence loops. Environments without Web Locks fall back to synchronous localStorage transactions.
- Invalid saved/imported data is reported before replacement. JSON imports back up the previous canonical snapshot under `wedding-react-v2:backup:<timestamp>`.

Different origins, including `file://` and a Vite localhost origin, do not share browser storage. Use an explicit JSON transfer as described in [DATA-MIGRATION.md](DATA-MIGRATION.md). The admin Tags page provides JSON export/import.

No ZIP or deployment is part of this migration.

## Verification

`npm run build` passes. The migration's 19 browser checks and screenshots are recorded in `verification/`. The reusable regression script is `tests/react-migration.cjs`; see `tests/README.md` for its optional Playwright test tooling. No new runtime dependencies are required.
