# Website Refactoring, Bootstrap Migration & ZIP Export

## 1. Project Overview

I have an existing wedding website project.

I want to restructure the existing website into multiple independent HTML pages and migrate its styling system from Tailwind CSS to a combination of Bootstrap 5 and External CSS.

The most important requirement is:

**Maintain 100% of the original website's visual design, layout, appearance, and functionality while improving the code structure and maintainability.**

This is NOT a website redesign task.

This is a website refactoring and CSS framework migration task.

You must analyze the existing project before modifying anything.

---

## 2. Target File Structure

Organize the final project into exactly this structure:

```text
template/
│
├── mainpage.html
├── wedding.js
│
├── css/
│   └── style.css
│
└── admin/
    ├── dashboard.html
    ├── tag.html
    ├── add-guest.html
    └── table-setting.html
```

### File Responsibilities

**mainpage.html**
- Main wedding website.
- Public-facing wedding interface.
- Contains the original wedding check-in functionality.
- References Bootstrap CSS and the external stylesheet.
- Loads wedding.js.

**wedding.js**
- Contains the React application and shared JavaScript logic.
- Organizes reusable functions and components.
- Handles existing application interactions and business logic.
- Keeps page-specific functionality properly organized.

**css/style.css**
- Contains all custom CSS.
- Stores custom colors, typography, spacing, shadows, borders, backgrounds, and component styling.
- Reproduces the original website's appearance.
- Contains styling that Bootstrap cannot provide directly.

**admin/dashboard.html**
- Admin dashboard interface.
- Preserves existing dashboard statistics and functionality.

**admin/tag.html**
- Tag management interface.
- Preserves existing tag management functionality.

**admin/add-guest.html**
- Guest registration and creation interface.
- Preserves existing guest forms and validation.

**admin/table-setting.html**
- Table management interface.
- Preserves existing table configuration functionality.

---

## 3. CRITICAL REQUIREMENT: Preserve Original UI Design

This is the highest-priority requirement.

You MUST NOT change the original website's visual design.

Before migrating the CSS, carefully inspect the original website and identify its design characteristics.

Preserve the following:

- Original color palette.
- Background colors.
- Text colors.
- Font families and typography.
- Font sizes and font weights.
- Element spacing.
- Padding and margins.
- Border radius.
- Border colors and thickness.
- Box shadows.
- Card layouts.
- Button appearance.
- Input and form appearance.
- Modal appearance.
- Table appearance.
- Icons and icon positioning.
- Navigation layout.
- Responsive behavior.
- Hover effects.
- Transitions and animations.

The objective is to reproduce the original website as closely as possible.

Do not introduce a new visual identity.

Do not use Bootstrap's default styling blindly if it changes the original appearance.

---

## 4. CSS Migration: Tailwind CSS to Bootstrap 5 + External CSS

Replace the existing Tailwind CSS styling system with Bootstrap 5 and custom external CSS.

### A. Bootstrap 5

Use Bootstrap 5 through its official CDN.

Include Bootstrap CSS in every HTML page.

Use Bootstrap's existing utilities and components wherever appropriate.

Examples:

- Container and grid system.
- Flexbox utilities.
- Spacing utilities.
- Display utilities.
- Responsive utilities.
- Buttons.
- Forms.
- Tables.
- Cards.
- Modal structures.
- Navigation components.

Use Bootstrap to provide the foundation of the layout and components.

### B. External CSS

Create:

`css/style.css`

Move custom styling into this external stylesheet.

Use custom CSS whenever Bootstrap's default utilities cannot reproduce the original design accurately.

Examples:

- Custom wedding color palette.
- Custom amber and gold colors.
- Original background colors.
- Custom card appearance.
- Custom shadows.
- Custom border radius.
- Custom typography.
- Original button colors and hover effects.
- Special positioning.
- Custom animations.
- Wedding-themed visual elements.

Define reusable CSS variables where appropriate.

For example:

```css
:root {
    --wedding-bg: #FDFBF7;
    --wedding-text: #2C2A29;
    --wedding-primary: #B45309;
    --wedding-border: #E8E2D5;
    --wedding-card-bg: #FFFFFF;
}
```

These are examples based on the original design. Verify the actual existing values before implementing them.

### C. Tailwind CSS Removal

Remove the Tailwind CDN and migrate its styling completely.

Do not leave the following in the final project:

- Tailwind CDN.
- Tailwind configuration.
- Tailwind utility classes.
- Tailwind-specific dependencies.

Replace Tailwind classes with appropriate Bootstrap classes and custom CSS classes.

For example:

Original Tailwind:

```jsx
<div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E8E2D5]">
```

New implementation:

```jsx
<div className="card wedding-card p-4">
```

External CSS:

```css
.wedding-card {
    background-color: #FFFFFF;
    border: 1px solid #E8E2D5;
    border-radius: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
```

The example demonstrates the migration approach. Adjust the actual CSS values according to the original website.

### D. CSS Priority

Use the following priority:

1. Bootstrap 5 for standard layout and components.
2. External CSS for original custom styling.
3. Minimal inline styling only when dynamically required by JavaScript.

Avoid excessive inline styles.

Do not duplicate Bootstrap styles unnecessarily.

---

## 5. HTML & JavaScript Separation

Separate the existing application into individual HTML pages.

Requirements:

- Each HTML page must have its own independent page structure.
- Shared JavaScript should be managed through wedding.js.
- Preserve all existing React components and functionality.
- Preserve existing state management.
- Preserve existing event handlers.
- Preserve existing form validation.
- Preserve existing modals.
- Preserve existing filtering and search functions.
- Preserve existing data handling.

Do not rewrite the entire application unnecessarily.

If React is currently implemented through CDN and Babel, preserve the existing React architecture unless there is a strong technical reason to change it.

Do not introduce a new frontend framework.

### Important: Cross-Page Data Consistency

Since the application will be separated into multiple HTML pages:

- Ensure data remains consistent when navigating between pages.
- Do not allow page navigation to accidentally reset important application data.
- If the existing application uses temporary React state, carefully evaluate how shared data should persist across pages.
- Use an appropriate existing storage mechanism or a compatible persistence solution only when necessary.
- Do not silently change the existing business logic.

---

## 6. HTML Resource Paths

Ensure every HTML page references the correct resources.

For root-level pages:

```html
<link rel="stylesheet" href="css/style.css">
<script src="wedding.js"></script>
```

For admin pages:

```html
<link rel="stylesheet" href="../css/style.css">
<script src="../wedding.js"></script>
```

Adjust paths according to the actual implementation.

Include Bootstrap 5 CSS and JavaScript Bundle where required.

Preserve existing Font Awesome icons and other required dependencies.

Verify that all resources load correctly from every page.

---

## 7. Navigation & Page Separation

Update all navigation links to the new file structure.

Expected pages:

- Main page: `mainpage.html`
- Dashboard: `admin/dashboard.html`
- Tag management: `admin/tag.html`
- Add guest: `admin/add-guest.html`
- Table setting: `admin/table-setting.html`

Ensure:

- Navigation works between all pages.
- Admin pages can return to the main page.
- Buttons navigate to the correct destinations.
- No broken relative paths.
- No unnecessary page reloads or lost data.

---

## 8. JavaScript & Business Logic Preservation

Do not change the original business logic.

Preserve:

- Guest check-in.
- Family check-in.
- Guest management.
- Guest editing.
- Guest search.
- Guest filtering.
- Tag management.
- Table management.
- Angpao / wedding gift registration.
- Angpao history.
- Void transaction functionality.
- Dashboard statistics.
- Existing data structures.
- Existing calculations.
- Existing validation.

Do not remove functionality just because it is difficult to migrate.

Do not replace existing data with placeholder data.

Do not introduce unnecessary dependencies.

---

## 9. Testing & Visual Verification

After completing the migration, perform a full verification.

### Functional Testing

Check that:

- All HTML pages load.
- React renders correctly.
- JavaScript executes without errors.
- All buttons work.
- All forms work.
- All modals work.
- All filters work.
- All navigation links work.
- Guest check-in works.
- Family check-in works.
- Gift registration works.
- Tag management works.
- Table management works.
- Data remains consistent between pages.
- All assets load correctly.

### Visual Testing

Compare the migrated website against the original website.

Check:

- Desktop layout.
- Mobile layout.
- Card dimensions.
- Button dimensions.
- Font sizes.
- Colors.
- Spacing.
- Modal positioning.
- Form appearance.
- Navigation appearance.

Fix any visual differences introduced by the migration.

Do not consider the task complete if the website looks noticeably different from the original.

---

## 10. ZIP EXPORT - MANDATORY

This is a mandatory final step.

After ALL HTML, JavaScript, and CSS files have been generated and verified:

1. Ensure the final project follows the specified folder structure.
2. Ensure all required files are included.
3. Ensure all internal file references work.
4. Remove unnecessary temporary files and obsolete Tailwind-related files.
5. Package the complete `template` folder into a ZIP archive.

The ZIP file must be named:

`wedding-template.zip`

Expected ZIP structure:

```text
wedding-template.zip
│
└── template/
    ├── mainpage.html
    ├── wedding.js
    ├── css/
    │   └── style.css
    └── admin/
        ├── dashboard.html
        ├── tag.html
        ├── add-guest.html
        └── table-setting.html
```

Do not place unrelated project files inside the ZIP.

Do not ZIP an incomplete project.

Do not provide a ZIP containing only source snippets or partial files.

After generating the ZIP:

- Verify that the ZIP file exists.
- Verify that the archive can be opened.
- Verify that all expected files are included.
- Provide the ZIP file as a downloadable attachment or link.

The final response MUST include the download link to:

`wedding-template.zip`

---

## 11. Final Deliverables

Provide:

1. Complete refactored HTML files.
2. Complete wedding.js.
3. External CSS stylesheet.
4. Bootstrap 5 integration.
5. Fully working navigation.
6. Preserved original UI design.
7. Preserved original functionality.
8. Successfully generated ZIP archive.

Also provide a short summary containing:

- Files created.
- Files modified.
- CSS migration summary.
- Functionality verification results.
- Any remaining issues.

---

## 12. FINAL EXECUTION INSTRUCTION

Follow this workflow in order:

**PHASE 1:** Analyze the existing project.

**PHASE 2:** Identify and map the original website's design and functionality.

**PHASE 3:** Separate the existing pages into the target file structure.

**PHASE 4:** Migrate Tailwind CSS to Bootstrap 5 + External CSS.

**PHASE 5:** Preserve and verify the original UI design.

**PHASE 6:** Verify JavaScript functionality and cross-page data consistency.

**PHASE 7:** Fix any errors or visual inconsistencies.

**PHASE 8:** Generate and validate `wedding-template.zip`.

**PHASE 9:** Provide the final ZIP download link.

IMPORTANT:

Do not stop after creating the HTML files.

Do not stop after migrating the CSS.

Do not stop after generating the JavaScript.

You MUST complete the ZIP export and provide the downloadable ZIP archive.

**The final result must be a complete, working, properly structured website that looks like the original website but uses Bootstrap 5 combined with external CSS.**