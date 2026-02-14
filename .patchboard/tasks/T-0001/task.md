---
id: T-0001
title: "Set up TypeScript project with build infrastructure"
type: task
status: review
priority: P0
owner: engineer
labels:
  - infrastructure
  - setup
depends_on: []
parallel_with: []
parent_epic: E-0001
acceptance:
  - TypeScript project initialized with proper tsconfig.json
  - Package.json includes Phaser, TypeScript, and build tools
  - Build command successfully compiles TypeScript to JavaScript
  - Development server runs and serves the game
  - Source directory structure matches architecture (/src/engine, /src/objects, /src/levels, /src/renderer, /src/harness)
  - Basic index.html entry point exists
  - Assets directory structure created
created_at: '2026-02-13'
updated_at: '2026-02-13'
---

## Context

This is the foundational task that sets up the development environment for PB-Galaga. All subsequent tasks depend on having a working TypeScript build system.

**Architecture**: `.patchboard/docs/design-architecture/core/architecture.md` (Directory Structure section)

## Plan

1. Initialize npm project with package.json
2. Install dependencies:
   - TypeScript (latest)
   - Phaser (latest v3.x)
   - Build tool (Vite recommended for simplicity)
   - Testing framework (Jest or Vitest)
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
5. Create basic index.html with canvas element
6. Create minimal main.ts entry point
7. Add build and dev scripts to package.json
8. Test build and dev server

## Notes

- Use Vite for fast dev server and HMR
- Ensure source maps work for debugging
- Keep dependencies minimal - only what's needed for Sprint 1
- Document build commands in README
