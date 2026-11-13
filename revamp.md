# Prompt: migrate the wedding template into the existing React + TypeScript app

## Status

Implemented after the user approved execution. The React build and 19 browser regression checks passed, including storage migration, conflict handling, roles, gifts, cross-tab edits, pagination and desktop/mobile layouts. See `WeddingAttendanceSystem/verification/react-migration.json` and the updated project README.

Do not generate a ZIP, publish the site, or modify the standalone `template/` reference as part of this migration.

## Objective

Revamp the latest wedding website in `WeddingAttendanceSystem/template/` into the existing React + TypeScript + Vite project in `WeddingAttendanceSystem/`.

Preserve the template's current design and functionality. This is a component and state-management migration, not a visual redesign. Use the installed React Router and Font Awesome packages. Keep Bootstrap 5 and external CSS; do not introduce Tailwind, Babel/CDN React, another frontend framework, or an unnecessary state-management package.

The workspace-level `README.md` describes the intended architecture: API/storage functions, hooks, reusable components, and page-level orchestration. Apply that separation to the wedding domain; its example feedback/search features are not wedding requirements.

## What is already in the repository

These findings are based on the actual source, not just the README:

- `src/main.tsx` already mounts React with `StrictMode` and one `BrowserRouter`.
- `src/App.tsx` currently manages the current user, the navigation shell, and routes to `SearchFlow`, `AdminPage`, and `LoginPage`.
- Existing reusable files live under `src/components/` (plural): `navbar.tsx`, `tagListing.tsx`, and `ui.tsx`.
- `src/pages/SearchFlow.tsx` and `src/pages/AdminPage.tsx` use separate local state and seed data. They do not yet represent the full current template.
- `src/api/client.ts` is a localStorage helper, not an HTTP client. `guestApi` and `angpaoApi` are asynchronous interfaces backed by localStorage, using `wedding_guests` and `wedding_angpao`.
- `src/hooks/useGuests.ts` exists, but each invocation owns its own state. Refactor it to consume shared application state rather than creating competing copies.
- React Router, Font Awesome's React component and icon packages, and i18next packages are installed. Do not reinstall them or add a translation system as an unrelated task.
- Bootstrap CSS/JS and Font Awesome CSS are currently referenced in the Vite `index.html`. Bootstrap is not currently declared as an npm dependency.
- Existing components mix Bootstrap classes with Tailwind-style classes, while the current template already has an external stylesheet that reproduces the intended design.
- `src/types.ts` uses lowercase domain values and different field names from the standalone template. Migrate those differences explicitly.

## Required structure

Paths in this tree are relative to the React project folder, `WeddingAttendanceSystem/`:

```text
WeddingAttendanceSystem/
├── index.html
├── package.json
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── types.ts
│   ├── data.ts
│   │
│   ├── router/
│   │   └── ProtectedRoute.tsx
│   │
│   ├── layouts/
│   │   ├── AppLayout.tsx
│   │   └── AdminLayout.tsx
│   │
│   ├── providers/
│   │   ├── AuthProvider.tsx
│   │   └── WeddingProvider.tsx
│   │
│   ├── api/
│   │   ├── client.ts
│   │   ├── guest.ts
│   │   ├── angpao.ts
│   │   ├── tags.ts
│   │   ├── tables.ts
│   │   ├── groups.ts
│   │   ├── migrations.ts
│   │   └── index.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useWedding.ts
│   │   ├── useGuests.ts
│   │   └── usePagination.ts
│   │
│   ├── component/                 # Singular, as explicitly requested
│   │   ├── navbar.tsx
│   │   ├── navtag.tsx
│   │   ├── listing.tsx
│   │   ├── pagination.tsx
│   │   ├── tagListing.tsx
│   │   ├── ui.tsx
│   │   ├── Modal.tsx
│   │   ├── GuestEditModal.tsx
│   │   ├── AngpaoModal.tsx
│   │   ├── AngpaoHistoryModal.tsx
│   │   ├── FamilyCheckInModal.tsx
│   │   └── VoidAngpaoModal.tsx
│   │
│   ├── pages/
│   │   ├── MainPage/
│   │   │   ├── MainPage.tsx
│   │   │   └── GuestCard.tsx
│   │   ├── Admin/
│   │   │   ├── Dashboard/
│   │   │   │   └── Dashboard.tsx
│   │   │   ├── Tags/
│   │   │   │   └── Tags.tsx
│   │   │   ├── Guests/
│   │   │   │   └── Guests.tsx
│   │   │   └── Tables/
│   │   │       └── Tables.tsx
│   │   └── LoginPage.tsx
│   │
│   ├── styles/
│   │   └── wedding.css
│   │
│   └── utils/
│       ├── format.ts
│       └── selectors.ts
│
└── template/                      # Existing standalone reference; keep intact
```

Move and adapt reusable code from `src/components/` to the requested `src/component/` directory, updating every import. Do not maintain two copies of the same components. Remove obsolete `SearchFlow.tsx` and `AdminPage.tsx` only after their functionality has been migrated and their imports replaced.

## Component arrangement and coding method

### 1. Declare routes directly in App.tsx

`App.tsx` declares the nested React Router routes directly. Do not create an `AppRouter` wrapper component. Do not place main-page markup, guest forms, lists, filter controls, statistics, storage operations, or business handlers in it; those remain in the page components and shared providers.

Expected shape:

```tsx
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./router/ProtectedRoute";
import { AppLayout } from "./layouts/AppLayout";
import { AdminLayout } from "./layouts/AdminLayout";
import { MainPage } from "./pages/MainPage/MainPage";
import { Dashboard } from "./pages/Admin/Dashboard/Dashboard";
import { Tags } from "./pages/Admin/Tags/Tags";
import { Guests } from "./pages/Admin/Guests/Guests";
import { Tables } from "./pages/Admin/Tables/Tables";
import { LoginPage } from "./pages/LoginPage";
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<MainPage />} />
          <Route element={<ProtectedRoute admin />}>
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="tag" element={<Tags />} />
              <Route path="add-guest" element={<Guests />} />
              <Route path="table-setting" element={<Tables />} />
            </Route>
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
```

`main.tsx` mounts the application with the existing `BrowserRouter`, `AuthProvider`, and `WeddingProvider`. Keep exactly one `BrowserRouter`. Provider initialization must be safe under `StrictMode` and must not create duplicate guests, gifts, or table numbers.

### 2. Main page belongs to MainPage/MainPage.tsx

- Use the exact path `src/pages/MainPage/MainPage.tsx`.
- Convert the current `template/mainpage.html` interface and its relevant `template/wedding.js` behavior into this page.
- Put the main page's attendance summary, search, filters, guest-list arrangement, and modal orchestration here. Keep shared header markup in `AppLayout`/`Navbar`.
- Render individual guests directly, using `GuestCard` and the shared `Listing`; do not restore grouped family-card listings.
- Preserve individual check-in/reversal, family check-in from guest actions, guest editing, gift registration/history/voiding, and existing validation and notifications.
- Keep the main page's current privacy behavior: show gift-registration status rather than adding a financial amount listing. Preserve the existing amount entry form for recording gifts.
- React owns the DOM. Convert HTML `class` to `className`, labels to `htmlFor`, and event handlers to typed React callbacks. Do not load `wedding.js` into React, clone HTML templates, or port the application with `innerHTML`/`dangerouslySetInnerHTML`.

### 3. Admin top navigation: component/navtag.tsx

- Use the exact path `src/component/navtag.tsx` and export a component named `NavTag`.
- This is the admin navigation tab strip, not the guest-tag selector.
- Tabs: Dashboard, Tags, Add/Edit Guests, Table Settings, with the current Chinese labels and appropriate Font Awesome icons.
- Use React Router `NavLink` for the active tab. Do not use manual page reloads or independent tab state that can disagree with the URL.
- Render `<NavTag />` once in `AdminLayout`, above the routed admin page's `<Outlet />`.
- Preserve the amber active indicator, spacing, borders, and mobile horizontal scrolling.
- Keep tag selection separately in `TagListingSelector`, adapted from the existing `tagListing.tsx`.

### 4. Reusable listing: component/listing.tsx

- Export a typed reusable component named `Listing`.
- Support the current guest-card view and admin table views through typed render props or a discriminated props union. Keep it small rather than adding a general-purpose data-grid framework.
- Accept already-selected records, stable record keys, presentation/column definitions or `renderItem`, and empty-state content.
- For table mode, use semantic table headers and a responsive horizontal-scroll wrapper. For card mode, render the provided guest cards directly.
- Do not fetch data, read localStorage, calculate financial totals, or own domain mutations inside `Listing`.
- Use page-level column definitions and callback props for Edit, Details, and Delete actions. Never use array indices as record keys.
- Keep pagination in the separate `Pagination` component and `usePagination` hook. Search/filter the complete dataset before applying the page slice.

### 5. Route map

| Route | Component / behavior |
| --- | --- |
| `/` | `MainPage` inside `AppLayout` |
| `/login` | Existing `LoginPage`, adapted to shared auth |
| `/admin` | Redirect to `/admin/dashboard` |
| `/admin/dashboard` | `Dashboard` inside `AdminLayout` |
| `/admin/tag` | `Tags` inside `AdminLayout` |
| `/admin/add-guest` | `Guests` inside `AdminLayout` |
| `/admin/table-setting` | `Tables` inside `AdminLayout` |

Use nested routes and `Outlet`. `AppLayout` owns the shared header and content container; `AdminLayout` owns the admin tab strip and shared admin panel. Avoid duplicate headers or duplicated page padding.

Preserve login/logout and admin/staff behavior. Protect admin routes with `ProtectedRoute`, including direct URL access. Preserve the current demo authentication contract; do not invent a production login API. Client-side route guards do not replace server authorization if a real backend is added later.

## Preserve the latest admin behavior

### Dashboard

- Guest rows show names, side, table, attendance, valid individual angpau amounts, and history actions.
- Do not restore the separate family listing. Keep family gifts accessible through the relevant guest-row action.
- Do not attribute an entire family gift to each family member. Individual and family totals must each count a record once, and exclude voided records.
- Show `未登记` when no valid individual gift exists. Format RM amounts with two decimal places.
- Preserve searching and admin-only financial display, including the existing history/void-reason flow.

### Add/edit guests

- Keep the add-guest form and searchable guest list on the same page.
- Relationship options come from the current shared tags, not the existing static `RELATIONSHIP_OPTIONS` array.
- Preserve old free-text relationships as an existing-value option when editing; do not silently overwrite them with the first available tag.
- Keep multi-tag selection separate from the relationship field.
- Maximum **20 guests per page**, with Previous/Next controls and an accurate page/range count.
- Search resets to page 1. Handle zero results, disabled boundary controls, and clamping when the result count shrinks.
- Adding a guest refreshes the list immediately. Editing preserves the guest ID, family associations, attendance state, and gift references.

### Table settings

- Maximum **10 tables per page**, with Previous/Next controls.
- Add tables using a positive-integer capacity, default 10, and an automatically increasing table number.
- Keep at least two digits for display and allow values above 99. Do not renumber existing tables or reuse deleted numbers.
- Persist the numbering counter; initialize it safely above the highest existing table number.
- Show capacity and assigned-active-guest counts. Preserve tags and other existing table metadata.
- Confirm deletion and block it when any guest record or family reservation still references the table. Enforce the check in the mutation as well as the UI.
- Adding a table opens its page; deleting the last item on a page clamps to a valid page.
- Table options in guest forms and filters update through shared state immediately.

### Tags

- Preserve tag creation/deletion, colors, and existing tag selection.
- Newly added tags immediately become relationship dropdown options on the guest page.
- Do not delete guests or erase their saved relationships when a tag is deleted.

## State, storage, types, and migration

### One shared source of truth

- `WeddingProvider` owns the shared guest, group, tag, table, gift, and next-table-number state above all routes.
- `AuthProvider` owns the current user and login/logout behavior.
- Pages use `useWedding`, the refactored `useGuests`, and `useAuth`; they do not initialize their own copies of domain seed data.
- Expose typed actions for guest creation/editing/check-in, family check-in, tags, tables, gift registration, and voiding.
- Keep search terms, active modal state, drafts, and pagination local to the relevant page.
- API/storage modules contain pure typed storage functions; hooks/providers connect them to React. Retain the existing asynchronous `getAll`/`saveAll` interfaces where compatible. Do not claim that a backend exists or add fake HTTP requests.
- Load and validate saved state before persisting defaults. Do not overwrite existing records during the initial render or on route changes. Preserve supported cross-tab updates without storage-event write loops.

### Explicit type mapping

Prefer the existing React domain naming convention, extending it where needed:

| Standalone template | React domain |
| --- | --- |
| `GROOM` / `BRIDE` | `groom` / `bride` |
| `PENDING` / `ARRIVED` | `pending` / `arrived` |
| `ADMIN` / `STAFF` | `admin` / `staff` |
| Guest `tableNumber`, `seatNumber`, `tags` | Guest `tableNo`, `seatNo`, `tagIds` |
| Gift `recipientType`, `recipientId`, `recipientName` | Gift `targetType`, `targetId`, `targetName` |
| Gift `recordedAt` | Gift `timestamp` |
| Table `number`, `tags` | Table `tableNo`, `tagIds` |

- Add an explicit family/group type and preserve its ID and reserved table numbers.
- Extend existing types to preserve guest activity, notes, phone data where present, stable table IDs, gift notes, void flags/reasons, and sequence metadata. Do not drop fields merely because the current React types omit them.
- Keep stored identifiers and foreign-key references stable. Lowercase the gift type values through a typed adapter, not unchecked assertions.
- Use `import type` under `verbatimModuleSyntax`. Avoid `any`, unnecessary casts, and unused imports; respect the actual TypeScript compiler settings.

### Existing data must survive

- The template uses `wedding-template-v1:*`; the existing React app uses `wedding_guests` and `wedding_angpao`. Their seeds have different IDs and reference graphs.
- Implement a versioned, idempotent migration in `api/migrations.ts`. Keep existing source keys intact until migration is validated; never clear localStorage as a migration strategy.
- Prefer an already valid canonical React dataset. When importing template data, transform related guests, tags, families, tables, and gifts together so references remain consistent.
- If both sources contain saved but incompatible datasets, retain both sources and report the conflict before importing; do not concatenate mismatched IDs or silently substitute one dataset for the other.
- Use seed data only when there is no applicable saved dataset. Treat the latest template dataset as the reference for a fresh template-based migration, rather than silently substituting the older React demo records.
- Browser storage cannot automatically move between different origins, such as `file://` and a Vite localhost URL. Do not promise otherwise. If those records must be transferred, provide an explicit validated JSON export/import path; never copy sensitive records into URLs.
- A Vite React application runs through its dev server/build preview. The standalone template's double-click `file://` execution method does not apply to the React module application.

## Styling and icons

- Port the applicable styles from `template/css/style.css` to `src/styles/wedding.css`. Import global styles once through the entry point, after Bootstrap CSS.
- Preserve the ivory background, amber buttons, original typography, dimensions, cards, forms, modals, badges, responsiveness, and hover/focus behavior.
- Keep the existing Bootstrap CDN setup unless there is a concrete need to change it; do not assume an npm Bootstrap package is installed.
- Use the already installed `FontAwesomeIcon` component with explicitly imported icons. Remove the Font Awesome CDN only after all affected icons are migrated and verified.
- Replace unsupported Tailwind-style classes in the existing React components with Bootstrap utilities or the migrated external CSS. Map persisted tag colors explicitly so legacy class strings do not lose their appearance.
- Do not introduce duplicate Bootstrap imports, duplicate icon systems, or unneeded Bootstrap JS modal control alongside React-controlled modals.
- `Modal` handles accessibility, focus restoration/trapping, Escape, and scrolling. Feature forms supply typed values and callbacks; do not manipulate React-owned DOM through imperative template cloning.

## Execution order when approved

1. Recheck the README, source, latest template, dependencies, and any newer user changes.
2. Define the domain adapters, storage migration, and shared providers without resetting data.
3. Arrange the router, layouts, and singular `component/` directory; keep route declarations in `App.tsx`.
4. Implement `MainPage/MainPage.tsx` from the current main template and extract shared listings/modals.
5. Implement the four admin routes with `NavTag`, shared `Listing`, and the current pagination rules.
6. Adapt existing navigation, tag selector, badges, icons, and external styling. Remove obsolete implementations only after replacements work.
7. Verify behavior, migration, permissions, and desktop/mobile appearance. Fix observed problems and update project documentation to the final structure.

## Acceptance checks

- `App.tsx` declares routes directly without an `AppRouter` wrapper, and the requested exact `MainPage` and `navtag.tsx` paths exist.
- `Listing`, `NavTag`, pagination, and modals are reusable and typed; no duplicated route-level domain stores exist.
- Check-in/reversal, family check-in, all search/filter controls, guest creation/editing, tags, gifts/history/voiding, and login/logout work across routes.
- Guest relationships reflect current tags and preserve legacy values.
- Test at least 41 guests and 21 tables: page sizes 20/10, last-page boundaries, search reset, deletion clamping, refresh, and increasing table numbers all work.
- Family gifts remain accessible without a separate family listing or duplicated totals. Admin routes and financial amounts are restricted according to the existing role behavior.
- Migration preserves record IDs, references, optional fields, sequence counters, and source data; no initial-load seed overwrite occurs.
- Run `npm run build` and appropriate focused behavior checks. Check direct navigation/reload for every route and compare desktop/mobile views with the latest template.
- Do not generate a ZIP or deploy the result. Finish with the implemented structure, validation results, and any actual unresolved limitations.
