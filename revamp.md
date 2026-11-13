# Project UI/UX Revamp Instructions

## 1. Project Objective

I have an existing React project called `WeddingAttendanceSystem` and a reference HTML template called `template.html`.

Your task is to completely revamp the existing React application's UI/UX design by using `template.html` as the primary design reference.

The goal is to make the existing application visually consistent with the reference template while maintaining all existing functionality, business logic, and project architecture.

**This is a UI/UX redesign task, NOT a complete application rewrite.**

---

## 2. Reference Files

- `template.html`: The primary source of truth for the new UI design.
- `src/`: The existing React application source code.

Before making any changes, carefully inspect both the reference template and the existing project.

Analyze the following aspects of `template.html`:

- Overall layout and page structure
- Color palette and theme
- Typography and font styles
- Navigation bar and sidebar
- Header and footer
- Cards, tables, buttons, and forms
- Spacing, padding, and margins
- Border radius, shadows, and visual effects
- Icons and image assets
- Responsive layout and mobile design
- Animations and interactive elements

Use the reference template as the design guideline throughout the entire revamp.

---

## 3. Important Rules

### Preserve Existing Functionality

- Do NOT remove existing features.
- Do NOT remove existing business logic.
- Do NOT break existing API integrations.
- Do NOT modify existing data structures unless absolutely necessary.
- Preserve existing React hooks and state management.
- Preserve existing routing and navigation logic.
- Maintain existing TypeScript types and interfaces.
- Ensure all existing buttons and interactive elements continue working.

### Maintain Project Architecture

Follow the existing project structure:

- `src/api/`: API integrations and requests.
- `src/assets/`: Images, icons, and static assets.
- `src/components/`: Reusable UI components.
- `src/hooks/`: Custom React hooks.
- `src/pages/`: Application pages.
- `src/App.tsx`: Main application structure.
- `src/types.ts`: TypeScript definitions.
- `src/data.ts`: Existing application data.

Do not unnecessarily restructure the entire project.

### React Development Standards

- Use React with TypeScript (TSX).
- Use reusable and maintainable components.
- Avoid unnecessary code duplication.
- Follow existing coding conventions.
- Use proper TypeScript types instead of `any`.
- Avoid introducing unnecessary dependencies.
- Ensure components are properly organized.

---

## 4. Design Implementation

Recreate the visual design of `template.html` within the existing React application.

Pay particular attention to:

1. Layout consistency.
2. Accurate color matching.
3. Typography and font hierarchy.
4. Component styling.
5. Spacing and alignment.
6. Navigation and page transitions.
7. Interactive states (hover, active, focus, disabled).
8. Responsive behavior.

Do not simply copy the HTML structure into a React component.

Instead, translate the template into reusable React components that fit the existing application architecture.

If the template contains multiple sections or pages, identify how they correspond to the existing React pages.

If a template feature does not have an equivalent in the existing application, only implement it when it improves the existing user experience without introducing unnecessary functionality.

---

## 5. Implementation Workflow

Follow these steps in order.

### Phase 1: Project Analysis

1. Inspect the entire existing React project.
2. Read `package.json` to understand installed dependencies.
3. Inspect all existing pages and components.
4. Understand existing application functionality and data flow.
5. Analyze `template.html` thoroughly.
6. Identify which existing components need redesigning.
7. Identify reusable components that can be extracted.

Do not modify any files during this phase.

### Phase 2: Design Mapping

Create a mapping between the reference template and the existing application.

Identify:

- Which template sections correspond to existing pages.
- Which existing components need to be redesigned.
- Which new reusable components are required.
- Which CSS files need modification.
- Which existing features need special attention.

### Phase 3: UI Implementation

Start implementing the redesign.

- Update existing React components.
- Update CSS stylesheets.
- Create reusable components where appropriate.
- Apply the template's design system consistently.
- Adapt the template layout to React and TypeScript.
- Ensure all pages share a consistent visual language.

### Phase 4: Functionality Verification

After implementation:

1. Check for TypeScript errors.
2. Check for missing imports.
3. Check for broken components.
4. Verify navigation and routing.
5. Verify buttons and forms.
6. Verify API integrations remain intact.
7. Verify existing data is displayed correctly.
8. Check responsive layouts.
9. Run the project and resolve any errors.

---

## 6. Design Quality Requirements

The final application should:

- Closely follow the visual style of `template.html`.
- Have a consistent and professional appearance.
- Use clean and modern UI components.
- Maintain good spacing and visual hierarchy.
- Be responsive on desktop, tablet, and mobile.
- Avoid unnecessary visual elements.
- Avoid inconsistent colors, fonts, and component styles.
- Provide a polished user experience.

Do not create a completely different design based on your own preferences.

The reference template should remain the primary design authority.

---

## 7. Restrictions

- Do not delete existing project files without a valid reason.
- Do not replace the entire application with static HTML.
- Do not hardcode data that should come from existing APIs or application state.
- Do not break existing functionality to achieve visual similarity.
- Do not install additional dependencies unless necessary.
- Do not make unrelated changes.
- Do not stop after redesigning only the landing page if other existing pages also require redesign.

If something is unclear, inspect the existing implementation before making assumptions.

---

## 8. Final Deliverables

After completing the revamp, provide:

1. Summary of the new design.
2. List of modified files.
3. List of newly created components.
4. Explanation of how the template design was adapted.
5. Any existing functionality that required modification.
6. Any remaining issues or limitations.

**Final Goal: Transform the existing WeddingAttendanceSystem into a polished React application that closely matches the visual design of `template.html`, while preserving its existing functionality, architecture, and data flow.**