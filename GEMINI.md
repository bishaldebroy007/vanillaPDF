# Gemini Context: VanillaPDF

This project is a modern Next.js application built with React 19 and Tailwind CSS v4. It serves as a starting point for the VanillaPDF project.

## Project Overview

- **Core Framework:** [Next.js 16.1.6](https://nextjs.org/) (App Router)
- **UI Library:** [React 19.2.3](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Linting:** [ESLint v9](https://eslint.org/)
- **Package Manager:** `pnpm` (inferred from `pnpm-lock.yaml`)
- **Fonts:** [Geist](https://vercel.com/font) (Sans and Mono)

### Architecture

- **App Router:** Uses the `app/` directory for routing and layouts.
- **Path Aliases:** `@/*` maps to the project root (configured in `jsconfig.json`).
- **Global Styles:** Tailwind CSS is imported and configured in `app/globals.css`.

## Building and Running

The project includes standard Next.js scripts for development, building, and production:

| Task | Command | Description |
| :--- | :--- | :--- |
| **Development** | `pnpm dev` | Starts the development server at `http://localhost:3000` |
| **Build** | `pnpm build` | Compiles the application for production |
| **Start** | `pnpm start` | Runs the production server (requires a prior build) |
| **Lint** | `pnpm lint` | Runs ESLint to check for code quality and style issues |

## Development Conventions

- **Component Structure:** Components should be placed according to Next.js App Router conventions.
- **Styling:** Prefer Tailwind CSS utility classes. Custom theme variables are defined in `app/globals.css`.
- **Pathing:** Use the `@/` alias for absolute imports from the root (e.g., `import MyComponent from "@/components/MyComponent"`).
- **Configuration:**
  - `next.config.mjs`: Next.js specific configuration.
  - `eslint.config.mjs`: ESLint configuration.
  - `postcss.config.mjs`: PostCSS configuration for Tailwind CSS.
  - `jsconfig.json`: JavaScript compiler options and path aliases.
