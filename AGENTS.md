# AGENTS.md - Crystal Viewer 3D

TypeScript + Three.js crystal-structure viewer built with Vite, packaged with Electron (primary) and Tauri. UI text, docs, and domain comments are Chinese.

## Commands

Run from this directory:

- `yarn install`
- `yarn dev` — Vite on http://localhost:5173
- `yarn electron-dev` — requires `yarn dev` already running; loads localhost:5173 only when `NODE_ENV=development`
- `yarn build` — `tsc && vite build`; typecheck alone: `npx tsc --noEmit`
- `yarn build:offline` — single-file offline HTML into `release/Crystal-Viewer-Offline-<version>.html`
- `yarn dist:all` — offline HTML + Windows portable exe
- `yarn test:run` / `yarn test` — Vitest once / watch
- `yarn vitest run src/__tests__/cells.test.ts` — one file; add `-t "name"` for one test
- `yarn electron-build-win` — portable + ZIP into `release/`
- `yarn tauri-build` — requires Rust

No lint or formatter script exists.

## Baseline checks

`npx tsc --noEmit` and `yarn test:run` pass. C60/C70 fullerene cells are intentionally not part of this app.

## Architecture

- Entry: `src/main.ts` → `CrystalViewer` (`src/core/CrystalViewer.ts`) + `UIManager` (`src/ui/UIManager.ts`).
- `CellRegistry` in `src/core/cells/CellImplementations.ts` is the source of truth for selectable cells; `UIManager` builds the grouped cell dropdown (`<optgroup>` per category) from `CellRegistry.getAll()`.
- `src/data/cells.ts` holds cell definitions only. `CellRegistry` is the single source of truth for selectable cells; do not add a second lookup table there.
- Renderers in `src/core/renderers/` own Three.js geometry/materials; dispose them in `dispose()`.
- Electron main is ESM (`electron/main.mjs`, preload `electron/preload.mjs`); production loads `dist/index.html`.
- `tsconfig.json` enables `verbatimModuleSyntax` (type-only imports need `import type`) and typechecks only `src/**`.

## Adding a cell

1. Define/export the `UnitCell` in `src/data/cells.ts`.
2. Add a `BaseCell` subclass and a `CellRegistry.register(...)` call in `src/core/cells/CellImplementations.ts` (this is the only selectable-cell registry).
3. Add `ELEMENT_FORMULAS` and `ELEMENT_ICONS` entries in `src/data/constants.ts`; otherwise the UI falls back to the name and 💎.
4. Add tests under `src/__tests__/` (Vitest includes only that directory, node environment).

Known drift: `src/data/adamantane.ts` is an unreferenced prototype. C60/C70 fullerene cells live in a separate app.

## Coordinates and types

- `Atom.x/y/z` are fractional coordinates (normally 0..1), multiplied by `a/b/c` in Å by `src/utils/bonds.ts`.
- Molecular builders fit an 8 Å box with `(v + 4) / 8`; do not put raw Å values in `atoms`.
- Elements must be members of the `ElementSymbol` union in `src/data/types.ts` or typecheck fails.

## Stale docs and files

- `PACKAGING.md`, `BUILD_ARTIFACTS.md`, `FIX_INSTRUCTIONS.md`, and `BUILD_VERIFICATION_REPORT.md` reference old `E:\op\op2\...` paths, `electron/main.js`/`preload.js`, and an `nsis` target. Trust `package.json`, `electron/*.mjs`, and `src-tauri/tauri.conf.json` instead.
- `build-log.txt` and `dist/` are old outputs.
