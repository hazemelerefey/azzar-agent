# AZZAR Open Notes

Every deferred item, open import, and integration task, kept here until it is
resolved at the right time. Nothing gets lost.

## Resolve during the build

- [x] **`@azzar/types` root barrel** — BUILT 2026-10-21
  Re-export everything built so far. Unblocks the `@azzar/types` import in
  `model-runtime/src/types/chat.ts`. Build it when the types package is complete.
- [ ] **Declare npm dependencies** (`zod`, `ajv` done; still to declare: `type-fest`, `openai`)
  All four are imported by built files. Installed locally for audits; declare
  in package.json when wiring the real build.
- [x] **Real `model-bank` package** — BUILT (Phase 4)
  Must export `AZZAR_DEFAULT_MODEL_LIST` (not `LOBE_DEFAULT_MODEL_LIST`),
  plus: `AIBaseModelCard`, `AiFullModelCard`, `AiModelType`, `Pricing`,
  `PricingUnitName`, `FixedPricingUnit`, `LookupPricingUnit`, `LLMParams`,
  `RuntimeImageGenParams`, `RuntimeImageGenParamsValue`,
  `RuntimeVideoGenParams`, `ModelProvider`, `ChatModelCard`,
  `ModelProviderCard`.
  `node_modules/model-bank` is an audit-only stub (LLMParams shape copied from
  the original). Replace with the real package in the model adapter phase.
  Unblocks the `ChatModelCard` / `ModelProviderCard` re-export deferred in
  `packages/types/src/llm.ts`.
- [x] **`@azzar/model-runtime` package.json** — BUILT
  Needed when wiring the model-runtime package build.
- [x] **Model-runtime root `index.ts` + `runtimeMap.ts`** — BUILT (Phase 4)
  Deferred until the providers phase: both reference provider classes
  (`LobeXxxAI` → `AzzarXxxAI`) that do not exist in our mirror yet.
- [ ] **Our CLI replaces `lh`**
  Rename `lh hetero exec` / `lh connect` left in comments in `agencyConfig.ts`,
  `heterogeneousAgent.ts`, `executionTargetRules.ts`. Standing reminder: build
  our CLI once the agent system is done.

## Deferred to the full app mirror phase

- [x] `packages/types/src/agent/modelSelection.ts` — BUILT + re-exported
- [x] `packages/types/src/agent/share.ts` — BUILT + re-exported
  (also un-defer the `toolGrants` field in `packages/types/src/agentRuntime.ts`)
- [x] `packages/types/src/agent/tts.ts` — BUILT + re-exported
- [x] `packages/types/src/files/list.ts` + `upload.ts` — BUILT + re-exported
  (un-defer the re-exports in `packages/types/src/files/index.ts`)
- [x] Full `packages/types/src/device.ts` — BUILT (1,111 lines)
  (we carry the working-dir slice only)

## Standing rules

- **Cost rule:** the 6 paid search backends (Tavily, Exa, Firecrawl, Jina Reader,
  Browserless, Search1API) stay as opt-in plugins configured by API key.
  The agent is fully functional without them. Only the LLM API is ever a
  required cost; local LLMs (Ollama, LM Studio, vLLM) are first-class.
- **Brand rule:** double z always (`Azzar`, never `Azar`).

## App phase notes (2026-10-21)
- `AzzarDocumentPage` (renamed from `LobeDocumentPage`, imported from `@/types/document`): app phase must define it. Deferred to frontend.
- Brand-swap ordering rule: `@lobechat/`→`@azzar/` MUST run before generic `lobe`→`azzar` rules, or `@azzarchat/*` imports get produced (caught in DB batch-0, 50 imports fixed).
- Brand-swap patterns to include (found by backend builders): `lobe([A-Z])` camelCase (lobeOpenApi→azzarOpenApi), `\bLOBE_` prefixes (LOBE_CHAT_OIDC_AUTH_HEADER→AZZAR_*), `__LOBE_` dunders, `lobeobjects.space` CDN URLs → AZZAR_TODO_CDN placeholders.
- Never run tree-wide sed across sibling builders' files (backend srv-ab corrupted 4 srv-ad files; lesson recorded).
- **Frontend locales/i18n gap (flagged 2026-10-21 ~17:02 EEST by ui-aa builder):**  (i18n JSON files) is not in any frontend batch. A test file imports . Handle in the final frontend phase.
- **Frontend final audit must also sweep for 'Lobe AI'** (user-facing product name with a space — word-boundary regexes miss it; ui-ab builder caught 5 instances → AZZAR AI). Flagged 2026-10-21 ~17:03 EEST.

## Resolved 2026-10-21 ~18:55 EEST (Wave 3)

- [x] `@azzar/types` root barrel — BUILT (packages/types/src/index.ts, 84 exports)
- [x] `packages/types/src/document/` — EXISTS (AzzarDocumentPage exported, database import fixed)
- [x] `files/index.ts` list/upload — UN-COMMENTED
- [x] `agent/index.ts` modelSelection/share/tts — UN-COMMENTED
- [x] `agentRuntime.ts` toolGrants — UN-COMMENTED
- [x] `llm.ts` ChatModelCard/ModelProviderCard — UN-COMMENTED (from @azzar/model-bank)
- [x] `device.ts` full version — BUILT (1,111 lines)
- [x] Root tsconfig.json with @/ mappings — BUILT
- [ ] `type-fest`, `openai` deps — NEEDS HAZEM'S APPROVAL (standing rule)
- [ ] Our CLI replaces `lh` — DEFERRED to CLI phase (his order)

## Resolved 2026-10-21 ~19:10 EEST (Round 2 fixes)

- [x] 181 migration SQL files — COPIED (packages/database/migrations/)
- [x] Duplicate packages/local-file-shell/ — DELETED (kept azzar-local-file-shell/)
- [x] BaseDataModel — ADDED to types/src/meta.ts
- [x] ModelRankItem — message/index.ts expanded to full barrel
- [x] @azzar/ui exports — ADDED ./form, ./pro-table, ./base-ui (point to v6.5.1 dirs)
- [x] @azzar/business-model-runtime — BUILT (3 files, was missing)
- [x] agent-templates 4 .md files — COPIED
- [x] toc.json title LobeHub — FIXED to AZZAR
- [x] apps/server/package.json — BUILT (@azzar/server)
- [ ] 119 @lobehub/* external npm imports — CORRECT (never-forked third-party packages, not violations)
- [ ] 8 linear.app test fixtures — CORRECT (Linear integration test data, faithful copies)
- [ ] type-fest, openai deps — NEEDS HAZEM'S APPROVAL
- [ ] Our CLI replaces lh — DEFERRED to CLI phase

## ACTIVE 2026-10-22 ~02:10 EEST — Pure-Brand Lifecycle (HAZEM's order, supersedes DEFERRED)

**Goal:** zero `@lobehub/*` dependencies. Our own `@azzar/ui`, `@azzar/editor`, `@azzar/icons` become full working replacements. Work continues across days until done; token budget not a constraint.

**Revert done:** commits 4fac42cb + 38433346 reverted as 5a2be9fd — repo is pure `@azzar/*` again (3,928 files).

**Lifecycle:** `pipeline/pure-brand/LIFECYCLE.md` — 6 stations (S0 Coverage Gate → S5 Integration) per fork, run by parallel workers.
**Sources:** originals on disk at `~/workspace/azzar-ui-source/` (lobe-ui v6.5.1), `~/workspace/azzar-editor-source/` (lobe-editor v5.0.2), `~/workspace/azzar-icons-source/` (lobe-icons v6.0.0); npm reference tarballs at `pipeline/pure-brand/reference/`.

**Notes:**
- From-scratch rebuild was REJECTED as unrealistic (100+ components + styling system = team-months). Completing the forks is the viable pure path.
- Upstream v6 migration (2026-10-16, "drop ant") means the ui fork must match the v6 API, not v5.
