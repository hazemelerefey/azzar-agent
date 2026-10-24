# AZZAR Full App — Build Plan

## Decision (HAZEM, 2026-10-21)
- Build in the repo (`azzar-agent`), NOT Drive. Git push per phase.
- Fresh design system for the app UI (NOT the same as `@azzar/ui` look). UI planned and built LAST.
- Strong on time: no issues, no hallucinations. Audit many times with different techniques.

## Phases

### Phase 1: Database (~578 files)
- `packages/database` (578 files): schemas, models, repositories, migrations, drizzle config.
- Pipeline: 6 stations. Ship = git commit + push to `azzar-agent`.

### Phase 2: Backend (~500 files)
- `src/services` (236), `src/libs` (225), `src/app/(backend)` + API routes (32+), `src/auth.ts`, `src/initialize.ts`, `drizzle.config.ts`, root configs.
- Pipeline: 6 stations. Ship = git commit + push.

### Phase 3: Frontend (~7,000 files, FRESH design)
- `src/features` (4,469), `src/routes` (929), `src/store` (1,045), `src/components` (236), `src/hooks` (137), `src/app` pages, `src/layout` (51).
- Design system planned separately with HAZEM before building. NOT a copy of the original's UI.
- Pipeline: 6 stations. Ship = git commit + push.

## Audit techniques (run many times, different angles)
1. Coverage gate (comm diff vs original) — nothing missing.
2. Syntax (tsc transpile) — zero parse errors.
3. Brand sweep (case-insensitive) — zero `lobe`.
4. Export preservation — nothing dropped.
5. Import resolution — every import target exists.
6. v2 pipeline gates (differential syntax, URL audit).
7. Fresh-clone verification after each push.

## Rules
- Brand swaps as before. Cost rule holds (no paid backends except opt-in).
- UI files: structure and logic faithful, visuals fresh (Phase 3 design).
- Commit per phase. Push per phase. Verify per phase.
