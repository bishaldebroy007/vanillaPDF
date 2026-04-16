# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server:** `pnpm dev` (runs on http://localhost:3000)
- **Build:** `pnpm build`
- **Lint:** `pnpm lint` (ESLint with Next.js core-web-vitals config)
- **Start production:** `pnpm start` (requires prior build)

Package manager is **pnpm**.

## Architecture

VanillaPDF is a client-side PDF manipulation tool built with Next.js 16 App Router. All PDF operations run entirely in the browser — no server-side processing.

### Routing

- `app/layout.js` — Root layout with shared header/nav and footer. Uses Geist fonts via `next/font`.
- `app/page.js` — Landing page listing all tools as cards. This is a `"use client"` component using framer-motion.
- `app/tools/page.js` — Simply re-exports the Home component from `app/page.js`.
- `app/tools/[tool]/page.js` — Dynamic route for each tool (merge, split, pdf-to-image, compress). Contains all tool logic in a single file with tool-specific handlers.
- `app/about/page.js` — Static about page.

### PDF Processing

Two PDF libraries serve different purposes:
- **pdf-lib** — Used for merge, split, and compress operations. Handles PDF document creation, page copying, and saving.
- **pdfjs-dist** — Used for PDF-to-image conversion. Dynamically imported in the browser, renders pages to canvas at 2x scale, then exports as PNG. Worker loaded from unpkg CDN.

All tool handlers are in `app/tools/[tool]/page.js`: `handleMerge`, `handleSplit`, `handleCompress`, `handlePdfToImage`.

### Styling

- Tailwind CSS v4 with `@tailwindcss/postcss` plugin (not the legacy `tailwind.config.js` approach).
- Theme variables defined in `app/globals.css` using CSS custom properties and `@theme inline`.
- Custom manga-themed CSS classes: `.manga-card`, `.manga-button`, `.manga-title`, `.screentone`, `.screentone-red`, `.speed-lines`.
- Dark theme with red accent (`--accent: #ff0000`), heavy use of bold borders, box shadows, and uppercase text.

### Path Aliases

`@/*` maps to project root (configured in `jsconfig.json`). JavaScript project — no TypeScript.
