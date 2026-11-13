# Website Refactoring & File Separation Instructions

## 1. Project Overview

I have an existing wedding website project that currently contains multiple pages, components, and functionalities.

I want to refactor and reorganize the existing website by separating its pages into individual HTML files while maintaining the original design, layout, styling, and functionality.

**Important:** This is a code restructuring task, NOT a website redesign task.

You must study the existing project before making any changes.

## 2. Target File Structure

Reorganize the project into the following structure:

```text
template/
│
├── wedding.js
├── mainpage.html
│
└── admin/
    ├── dashboard.html
    ├── tag.html
    ├── add-guest.html
    └── table-setting.html
```

### File Responsibilities

**1. mainpage.html**
- Main wedding website / landing page.
- Contains the public-facing wedding website.
- Preserves all existing public-facing content and interactions.
- Uses wedding.js for shared JavaScript functionality where appropriate.

**2. wedding.js**
- Contains shared JavaScript logic used across the website.
- Handles reusable functions and common interactions.
- Avoid unnecessary duplication of JavaScript code.
- Keep page-specific logic organized and prevent errors when a function is not used on a particular page.
- Do not put all page-specific functionality into one unnecessarily large function.

**3. admin/dashboard.html**
- Admin dashboard page.
- Contains the existing dashboard UI and functionality.
- Preserves existing dashboard statistics, navigation, and interactions.

**4. admin/tag.html**
- Tag management page.
- Contains the existing tag-related UI and functionality.
- Preserves existing tag management operations.

**5. admin/add-guest.html**
- Add guest page.
- Contains the existing guest registration / guest creation interface.
- Preserves all existing guest-related forms, validation, and interactions.

**6. admin/table-setting.html**
- Table setting management page.
- Contains the existing table configuration interface.
- Preserves existing table management functionality.

## 3. Refactoring Requirements

### A. Analyze Before Modifying

Before making any changes:

1. Examine all existing HTML, CSS, and JavaScript files.
2. Understand the current website structure and how its pages interact.
3. Identify which sections belong to the main wedding website.
4. Identify which sections belong to the admin panel.
5. Identify shared components, functions, and dependencies.
6. Understand existing navigation and page transitions.

Do not immediately rewrite the entire project.

### B. Separate HTML Pages

Split the existing website into the target HTML files.

Requirements:
- Each page must have its own independent HTML structure.
- Remove unrelated page content from each HTML file.
- Maintain the original HTML elements and their relationships wherever possible.
- Ensure all navigation links point to the correct new file paths.
- Ensure relative paths work correctly from both the root directory and admin directory.

### C. JavaScript Management

Move reusable JavaScript functionality into `wedding.js`.

Requirements:
- Avoid duplicate functions.
- Preserve existing event listeners and event handling.
- Preserve form submission logic.
- Preserve validation logic.
- Preserve API requests and backend integrations.
- Preserve existing data handling and state management.
- Avoid introducing global variable conflicts.
- Ensure JavaScript executes only when the required DOM elements exist.
- Use DOMContentLoaded where appropriate.

Do not remove existing functionality simply because the code is being reorganized.

### D. CSS & UI Preservation

The original website design must remain visually consistent.

Preserve:
- Colors and themes.
- Typography and font sizes.
- Spacing and margins.
- Layout and positioning.
- Buttons and form styles.
- Tables and cards.
- Responsive design.
- Animations and transitions.
- Icons and images.

Do not introduce a new design system or change the visual appearance.

If CSS is currently embedded inside HTML, keep it unless separating it is necessary for the refactoring. Do not introduce unnecessary new files.

### E. Navigation & File Paths

Update all internal links according to the new structure.

For example:

- Main website: `mainpage.html`
- Dashboard: `admin/dashboard.html`
- Tag management: `admin/tag.html`
- Add guest: `admin/add-guest.html`
- Table setting: `admin/table-setting.html`

Pay special attention to:
- CSS file paths.
- JavaScript file paths.
- Image paths.
- API endpoints.
- Navigation links.
- Form actions.
- Redirect URLs.

Remember that files inside the `admin/` directory require different relative paths.

## 4. Important Restrictions

1. DO NOT redesign the existing website.
2. DO NOT remove existing features or functionalities.
3. DO NOT change the original business logic.
4. DO NOT replace existing APIs or backend integrations.
5. DO NOT introduce unnecessary dependencies or frameworks.
6. DO NOT duplicate existing JavaScript logic.
7. DO NOT modify unrelated project files.
8. DO NOT use placeholder content to replace existing content.
9. DO NOT simplify existing functionality just to make the refactoring easier.

If something is unclear, inspect the original implementation before deciding how to refactor it.

## 5. Testing & Verification

After completing the refactoring, verify the following:

- All HTML pages load correctly.
- All CSS styles are applied correctly.
- All JavaScript functions work correctly.
- All navigation links point to the correct pages.
- All images and assets load correctly.
- All forms work correctly.
- All existing API integrations remain functional.
- No missing files or broken resource paths.
- No JavaScript console errors.
- No duplicate IDs or conflicting event listeners.
- Responsive layouts remain functional.

Compare the new pages against the original website to ensure the visual appearance and functionality are preserved.

## 6. Final Deliverables

After completing the task:

1. Create the new folder structure exactly as specified.
2. Move and separate all relevant code into the correct files.
3. Ensure all internal references and paths are updated.
4. Remove obsolete files only when they are confirmed to be unnecessary.
5. Provide a summary of all files created or modified.
6. Explain which existing code was moved into each file.
7. Report any issues that could not be resolved.
8. Provide a testing checklist showing which functionalities have been verified.

## 7. Final Instruction

Prioritize code preservation, clean separation of responsibilities, maintainability, and functionality.

The objective is to transform the existing website from a combined structure into a properly organized multi-page website without changing its original appearance or behavior.

**Analyze first, refactor carefully, and verify everything afterward.**