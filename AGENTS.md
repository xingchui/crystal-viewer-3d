# AGENTS.md - Crystal Viewer 3D

## Project Overview

3D晶体结构可视化工具 - A TypeScript-based 3D crystal structure visualization application using Three.js, with Electron and Tauri desktop packaging support.

## Build Commands

```bash
# Development
yarn dev              # Start Vite dev server
yarn electron-dev     # Start Electron in dev mode (requires vite dev running)

# Production Build
yarn build            # Build frontend (TypeScript + Vite)
yarn electron-build-win   # Build Windows Electron app
yarn tauri-build      # Build Tauri app (requires Rust)

# Packaging
./build.bat           # Windows build script (electron|tauri|both)
./build.sh            # Unix build script

# Testing
yarn test             # Run unit tests in watch mode
yarn test:run         # Run unit tests once
```

## Project Structure

```
src/
├── core/             # Core 3D rendering logic
│   ├── CrystalViewer.ts
│   ├── cells/        # Cell implementations
│   └── renderers/    # Three.js renderers
├── data/             # Type definitions & constants
├── ui/               # UI management
├── utils/            # Utilities (coordinates, bonds)
├── main.ts           # App entry point
├── index.html        # HTML template
electron/             # Electron main process
├── main.mjs          # Main entry (ES Module)
├── preload.mjs       # Preload script
└── assets/           # Icons & resources
src-tauri/            # Tauri configuration
public/               # Static assets
dist/                 # Build output (gitignored)
release/              # Electron build output (gitignored)
```

## Code Style Guidelines

### TypeScript
- **Target**: ES2022, strict mode enabled
- **Module**: ESNext with bundler resolution
- Always use explicit return types for public functions
- Prefer `readonly` for immutable properties
- Use `type` for unions, `interface` for objects

### Naming Conventions
- **Classes**: PascalCase (`CrystalViewer`, `AtomRenderer`)
- **Interfaces**: PascalCase with no I-prefix (`RenderOptions`, `CellParams`)
- **Types**: PascalCase (`ElementSymbol`, `BondType`)
- **Functions**: camelCase (`loadCell`, `updateRender`)
- **Constants**: UPPER_SNAKE_CASE for true constants
- **Private members**: prefix with underscore (`_currentCell`)
- **Boolean variables**: use `is` prefix (`isOrthographic`)

### Imports
```typescript
// External libraries first
import * as THREE from 'three';

// Internal types
import type { RenderOptions, Atom } from '../data/types';

// Internal modules
import { SceneManager } from './renderers/SceneManager';
import { RENDER_CONFIG } from '../data/constants';
```

### Error Handling
- Throw descriptive errors for invalid states
- Use constants for error messages (`ERROR_MESSAGES.invalidSuperCell()`)
- Always clean up resources in `dispose()` methods
- Handle async errors with try-catch

### Comments
- JSDoc for public APIs
- Chinese comments acceptable for domain-specific terms
- Keep comments current with code changes

## Technology Stack

- **Build Tool**: Vite 7.x
- **Language**: TypeScript 5.x (strict mode)
- **3D Engine**: Three.js 0.182
- **Desktop**: Electron 40.x / Tauri 2.x
- **Package Manager**: Yarn (preferred) or npm 8+

## Common Tasks

### Add New Cell Type
1. Define cell data in `src/data/cells.ts`
2. Create class in `src/core/cells/CellImplementations.ts`
3. Register in `CellRegistry.initializeDefaults()`

### Fix ES Module Issues
- Electron main process: use `.mjs` extension (ES Module)
- Use `import` syntax instead of `require`
- Use `import.meta.url` and `fileURLToPath` for __dirname equivalent
- Never mix `require` and `import` in same file

### Debug Build Issues
- Check `release/build-log.txt` for Electron errors
- Ensure `asar: false` in package.json for debugging
- Use `yarn` instead of `npm` to avoid compatibility issues

## Important Notes

- This is a **browser-first** app with desktop packaging
- Keep frontend code decoupled from Electron-specific APIs
- Use constants from `src/data/constants.ts` for configuration
- Always dispose Three.js resources to prevent memory leaks
- Test both web (`yarn dev`) and desktop (`yarn electron-dev`) modes
