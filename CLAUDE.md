# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server:** `pnpm dev` (runs on http://localhost:3000)
- **Build:** `pnpm build`
- **Lint:** `pnpm lint` (ESLint with Next.js core-web-vitals config)
- **Unit tests:** `pnpm test:run` (Vitest)
- **E2E tests:** `pnpm test:e2e` (Playwright)
- **Start production:** `pnpm start` (requires prior build)

Package manager is **pnpm**.

## Architecture

VanillaPDF is a client-side PDF manipulation tool built with Next.js 16 App Router. All PDF operations run entirely in the browser — no server-side processing.

### Routing

- `app/layout.js` — Server root layout with metadata, shared header/nav, and footer. Uses Geist fonts via `next/font`.
- `app/components/SiteHeader.js` — Client header, desktop nav, and mobile menu.
- `app/page.js` — Landing page listing all tools as cards. This is a `"use client"` component using framer-motion.
- `app/tools/page.js` — Simply re-exports the Home component from `app/page.js`.
- `app/tools/[tool]/page.js` — Server route with `generateStaticParams`. Renders `page.client.js`.
- `app/tools/[tool]/page.client.js` — Tool UI and orchestration.
- `lib/tools.js` — Shared tool metadata.
- `lib/pdf/` — PDF validation, page ranges, merge/split/compress, and download helpers.
- `app/about/page.js` — Static about page.

### PDF Processing

Two PDF libraries serve different purposes:
- **pdf-lib** — Used for merge, split, and compress operations. Handles PDF document creation, page copying, and saving.
- **pdfjs-dist** — Used for PDF-to-image conversion. Dynamically imported in the browser, renders pages to canvas, then exports as PNG or JPEG. Worker loaded from `/pdf.worker.min.mjs` (pinned with pdfjs-dist).

Handlers live in `lib/pdf/` (`merge.js`, `split.js`, `compress.js`) and are orchestrated from `app/tools/[tool]/page.client.js`.

### Styling

- Tailwind CSS v4 with `@tailwindcss/postcss` plugin (not the legacy `tailwind.config.js` approach).
- Theme variables defined in `app/globals.css` using CSS custom properties and `@theme inline`.
- Custom manga-themed CSS classes: `.manga-card`, `.manga-button`, `.manga-title`, `.screentone`, `.screentone-red`, `.speed-lines`.
- Dark theme with red accent (`--accent: #ff0000`), heavy use of bold borders, box shadows, and uppercase text.

### Path Aliases

`@/*` maps to project root (configured in `jsconfig.json`). JavaScript project — no TypeScript.
