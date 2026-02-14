---
id: T-0001
title: "Set up TypeScript project with build infrastructure"
type: task
status: todo
priority: P0
owner: null
labels:
  - infrastructure
  - setup
depends_on: []
parallel_with: []
parent_epic: E-0001
acceptance:
  - TypeScript project initialized with proper tsconfig.json
  - Package.json includes Phaser, TypeScript, Vite, and Vitest
  - Build command successfully compiles TypeScript to JavaScript
  - Development server runs and serves the game
  - Source directory structure matches architecture (/src/engine, /src/objects, /src/levels, /src/renderer, /src/harness)
  - Root index.html exists as a simple redirect/loader to dist/index.html
  - Assets directory structure created
  - npm run build produces dist/ that opens directly via file:// in Chrome
  - Vite config uses build.rollupOptions.output.format 'iife' and base './'
  - dist/ directory is NOT in .gitignore — it is committed as the playable game
created_at: '2026-02-13'
updated_at: '2026-02-13'
---

## Context

This is the foundational task that sets up the development environment for PB-Galaga. All subsequent tasks depend on having a working TypeScript build system.

**Architecture**: `.patchboard/docs/design-architecture/core/architecture.md` (Directory Structure section)

## Plan

1. Initialize npm project with package.json
2. Install dependencies (pinned — not suggestions):
   - TypeScript (latest)
   - Phaser (latest v3.x)
   - Vite (required build tool)
   - Vitest (required test framework)
3. Configure tsconfig.json with:
   - Target: ES2020 or later
   - Module: ESNext
   - Strict mode enabled
   - Source maps enabled
4. Create directory structure:
   ```
   src/
     engine/
     objects/
     levels/
     renderer/
     harness/
   tests/
   assets/
     sprites/
     sounds/
     animations/
   public/
   ```
5. Create root index.html that redirects to dist/index.html
6. Create Vite entry point index.html (in src/ or project root for Vite) with canvas element
7. Configure Vite for IIFE output format (build.rollupOptions.output.format: 'iife')
8. Create minimal main.ts entry point
7. Add build and dev scripts to package.json
8. Test build and dev server

## Notes

- Use Vite for fast dev server and HMR
- Ensure source maps work for debugging
- Keep dependencies minimal - only what's needed for Sprint 1
- Document build commands in README
- Do NOT enable Phaser arcade physics anywhere in the project
- Do NOT hardcode localhost URLs in source code (only in dev/test configs)
- Verify the built dist/index.html works when opened from filesystem (file:// protocol) before considering this task complete
