---
name: DIGIPARC Next.js monorepo quirks
description: Turbopack CSS import resolution quirks and workspace structure for the DIGIPARC Next.js app in the pnpm monorepo.
---

# DIGIPARC Next.js monorepo quirks

## Rule
When a CSS package (e.g. `tw-animate-css`) is installed only in `artifacts/lopango/node_modules/` and NOT in the workspace root `node_modules/`, Turbopack cannot resolve it via `@import "package-name"` or `@import "package-name/path"` in CSS files.

**Fix:** Use a relative path in `globals.css`:
```css
@import "../../node_modules/tw-animate-css/dist/tw-animate.css";
```

**Why:** Turbopack resolves CSS package imports from the workspace root node_modules, not from the artifact-local node_modules. Packages that are only installed at the artifact level must be referenced by relative path.

**How to apply:** Any time a CSS `@import "package"` fails in the Next.js app with "Module not found", check whether the package is in the root `node_modules/` or only in `artifacts/lopango/node_modules/`. If only in the artifact, switch to a relative path import.

## Workflow name
The lopango workflow is named `artifacts/lopango: web` — use this exact string with `restartWorkflow()`.
