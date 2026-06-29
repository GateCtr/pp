---
name: tw-animate-css import quirk with Turbopack
description: Turbopack cannot resolve bare package-name CSS imports from artifact-local node_modules; must use a relative path
---

# tw-animate-css import path workaround

**Rule:** In `globals.css` for Next.js artifacts inside a pnpm workspace, CSS `@import "tw-animate-css/..."` fails. Use a relative path to the workspace root's node_modules instead.

**Why:** Turbopack resolves CSS `@import` differently from JS imports. If `tw-animate-css` is not hoisted to the workspace root node_modules, Turbopack cannot find it via a bare package name. The workspace root's `node_modules` is always resolvable via relative path from `src/app/globals.css`.

**How to apply:**

```css
/* WRONG — Turbopack can't find it if only in artifact-local node_modules */
@import "tw-animate-css";

/* CORRECT — use relative path to workspace root node_modules */
@import "../../node_modules/tw-animate-css/dist/tw-animate.css";
```

The `../../` goes from `src/app/` up to the artifact root, then another level up to the workspace root where `node_modules/` lives.
