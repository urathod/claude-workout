# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## IMPORTANT: Documentation First

## Code Generation Guidelines
**IMPORTANT: Before generating any code, Claude Code MUST first check the `/docs` directory for relevant documentation.** Always read applicable docs files before writing or modifying code to ensure alignment with project conventions, design decisions, and specifications defined there:

- /docs/ui.md
- /docs/data-fetching.md
- /docs/data-mutations.md
- /docs/auth.md


## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

This is a Next.js 16 project using the **App Router** with TypeScript and Tailwind CSS 4.

- Source lives in `src/app/` following the App Router convention
- **App Router**: Located at 'src/app/' with 'layout.tsx' and 'page.tsx' files
- Path alias `@/*` maps to `src/*`
- Styling uses Tailwind CSS via PostCSS (`globals.css` imports Tailwind and defines CSS custom properties for theming)
- Fonts are loaded via `next/font` (Geist and Geist Mono) and injected as CSS variables in `layout.tsx`
- No testing framework is configured
