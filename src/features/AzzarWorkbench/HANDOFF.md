# AZZAR Workbench: handoff and audit plan

Purpose: let any engineer (or another AI executor) pick up this work, continue it, and **check it
independently**. Do not trust the claims below. Each claim has a command that proves or disproves it.

Base: master `c8ab3e8b0591a9c55bf3137b8d0014cb4f516e48`. Rollback tag `safe-v1-2026-10-27` = `ff3703a0bc679bd43d62a8dc4092766922bf2eed`. Never overwrite the tag. Never merge to master directly.
Demo: Saturday 2026-10-31. Everything is **Simulated**: no model call, no provider key, no database write.

## 1. What exists (all under `src/features/AzzarWorkbench/`)

| Layer                                                     | Path                                                           | State                                                       |
| --------------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------- |
| Catalog (data only)                                       | `catalog/`                                                     | done, tested                                                |
| Domain: rules, matcher, memory, CAO tree, briefing, store | `domain/`                                                      | done, tested                                                |
| Simulated runner + Marketing scripts                      | `runner/`                                                      | done, tested                                                |
| Production agent bridge                                   | `catalog/agentDefinition.ts`                                   | done, tested (not called by any page yet)                   |
| UI kit, dictionary, nav, Rules console                    | `ui/`                                                          | done, rendered in tests                                     |
| Pages (10)                                                | `pages/`                                                       | done, rendered in tests                                     |
| Routes                                                    | `routes.tsx` → `src/business/client/BusinessDesktopRoutes.tsx` | done                                                        |
| Home entry                                                | `src/routes/(main)/home/index.tsx`                             | done (mode choice → Missions home; `?classic=1` = original) |
| Avatars                                                   | `public/azzar/avatars/{dark,light}/`                           | 9 approved SVGs each, from `brand/`                         |
| Tests                                                     | `__tests__/`                                                   | 3 files, 57 tests pass in the build sandbox                 |

## 2. Audit first (do this before building anything)

Run from the repo root on a fresh checkout of master plus this work. Each line is a claim and its proof.

1. Tests: `npx vitest run src/features/AzzarWorkbench` → 3 files, 57 tests pass. They include source audits: no department named outside `catalog/`, `runner/`, `__tests__/`; no key/token/secret strings.
2. Lint: `npx eslint src/features/AzzarWorkbench "src/routes/(main)/home/index.tsx" src/business/client/BusinessDesktopRoutes.tsx` → 0 errors (2 warnings in a test file).
3. Types: use a tsconfig that sets `"types": []` and includes only this folder. **Pitfall found while building:** if tsc reports a global error (such as missing `vitest/globals`), it skips type-checking entirely and prints nothing about your files. Prove the checker works by adding a file with `const x: number = "a"` and confirming it is reported, then delete it.
4. Repo-wide type-check and the router sync test (`src/spa/router/desktopRouter.sync.test.tsx`) could NOT run in the build sandbox (it cannot load the UI package's `.css` files; it fails the same way on untouched master). Run both in a real environment.
5. Coming-soon agents carry no system role and no tools (a test enforces it).
6. Every catalog and dictionary string has Arabic letters and English text (a test enforces it).

## 3. Not done, and why

- **D10 (hide department groups from chat lists):** nothing creates chat groups in this build (departments are workbench state, not `chat_groups` rows), so there is nothing to hide. It becomes real work with migration M1 and real groups.
- **Sidebar entries:** not added. Navigation is the workbench's own top bar (`ui/WorkbenchNav.tsx`), so `useNavLayout` and its tests are untouched.
- **No live run.** Nothing was opened in a browser by the builder.
- Hover and focus styles are minimal (inline styles, no Emotion, per the repo's StyleX migration lint rule).
- Real runs, real approval pause, real connectors, enforced budgets and enforced model lock are all later work.

## 4. Decisions in force (from the written approval, 2026-10-29)

D1 monogram tile for departments 9–15 and Custom. D2 simulated approval pause with a real tap. D3 mode per user (stored in this browser's localStorage in this build). D5 Individual is thin, same code. D6 Starter tier is an offer, all 8 core activatable. D7 model lock is UI only. D8 formal Arabic UI, Egyptian sample mission text. D9 Hazem reviews the 8 manager texts and Marketing mission texts before ship. D10 department groups hidden from chat lists. D11 department projects private by default. Q3 Company→Individual hides, never deletes. Q4 "مهمة" / "Mission". **Delivery is by zip. Do not push, branch, PR or merge. Never ask for or use a token, password or key.**

## 5. Deliberate deviations from the plan (flag them, do not hide them)

- State is a persisted Zustand store in localStorage, not database rows. Reason: DB writes could not be verified live. `toAgentCreateInput` is the bridge for real agents later.
- Mode is stored in the workbench store, not in `UserPreference`, so **no change to `packages/types`** was needed. It is per browser, not per account.
- Routes use the existing empty business extension array, not `desktopRouter.shared.tsx`, to avoid editing the shared router and its sync tests.
- Workbench has its own ar/en dictionary (`ui/i18n.ts`), not `packages/locales`. The repo guideline wants locale files; adopting them is a follow-up.
- Budgets (`maxRounds`, cost cap) are displayed, not enforced.
- The build sandbox could not reach `cdn.sheetjs.com`, so `xlsx` was swapped locally to install. Those edits were reverted and are NOT in the delivery. A real install needs that CDN reachable (`pnpm install --frozen-lockfile`).

## 6. Not verified (be honest)

No page has been opened in a real browser by the builder. Tests render pages in happy-dom and drive the full Marketing flow, but layout, RTL, dark/light, fonts and the real router are for a person to check using `_azzar-delivery/TEST_CHECKLIST.md`.
