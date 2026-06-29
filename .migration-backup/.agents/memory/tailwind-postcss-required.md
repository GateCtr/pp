---
name: Tailwind v4 PostCSS config required for Next.js + Turbopack
description: Next.js with Turbopack will not process @import "tailwindcss" without an explicit postcss.config.mjs file
---

# Tailwind v4 PostCSS config required

**Rule:** Any Next.js artifact using Tailwind v4 (`@import "tailwindcss"` in globals.css) must have a `postcss.config.mjs` file with `@tailwindcss/postcss` as a plugin.

**Why:** Without the postcss config, Next.js/Turbopack never runs the `@tailwindcss/postcss` processor, so no utility classes are generated. The app renders completely unstyled — buttons, flex layouts, colors all missing — even though `globals.css` has the correct import.

**How to apply:** When setting up or migrating a Next.js + Tailwind v4 project to Replit, always create `postcss.config.mjs`:

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

After adding this file, restart the workflow — the dev server caches CSS processing and won't pick up the new config otherwise.
