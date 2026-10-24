# Trimmed Registry

Everything cut from the agent-system build, with its exact recovery location.
Nothing is lost: the original repo at `~/workspace/lobehub` is the source of
truth, and this file maps each trim back to it for later integration.

Rule: when integrating a trim, apply the brand swap (`Lobe`→`Azzar`,
`lobe-`→`azzar-`, `LobeHub`→`AZZAR`) at integration time, not before.

---

## 1. Agent permission / selection policies

**Trimmed from:** `packages/types/src/agent/agencyConfig.ts`
**Original:** `~/workspace/lobehub/packages/types/src/agent/agencyConfig.ts`
**Integrate during:** app mirror (agent settings UI + permission system)

| Identifier | Original line | Notes |
|---|---|---|
| `ExecutionTargetSelectionPolicy` | 936 | `member` \| `fixed` union |
| `AgentModelSelectionPolicy` | 945 | model override policy |
| `AgentTopicSharePolicy` | 963 | topic sharing policy |
| `AGENT_PERMISSION_POLICY_KEYS` | 1118 | key list const |
| `DEFAULT_WORKSPACE_AGENT_SELECTION_POLICIES` | 1131 | defaults const |
| `resolveAgentTopicSharePolicy` | 1147 | resolver fn |
| `AgentTopicShareSubject` | 1156 | subject type |
| `canPublishAgentTopicLink` | 1170 | permission check fn |
| `AgentAgencyConfigContext` | 1256 | context type |
| `resolveAgentAgencyConfig` | 1276 | full resolver (ours keeps the simplified `resolveAgencyConfig`) |

**Recovery:** copy lines 936–1290 from the original, brand-swap, append to our
`agencyConfig.ts`. Verify no name collisions with our simplified
`resolveAgencyConfig` first.

## 2. Device surface (full)

**Trimmed from:** `packages/types/src/device.ts` (ours keeps lines ~1–104: the
working-dir slice — `WorkingDirConfigValue` and its dependencies)
**Original:** `~/workspace/lobehub/packages/types/src/device.ts` (1111 lines)
**Integrate during:** app mirror (device pairing, gateway management)

Trimmed: device pairing/enrollment, gateway management, worktree operations,
terminal sessions, git operations (branches, PRs, diffs, worktrees), file
preview, project file index, app update state, CLI update state, listening
ports. Full export list was captured in the 2026-10-20 extreme audit.

**Recovery:** the original file is the complete reference. When the app mirror
needs the device surface, take the original whole, brand-swap, and replace our
slice — keeping our slice's header comment history in git.

## 3. File library list / upload surfaces

**Trimmed from:** `packages/types/src/files/index.ts`
**Original:** `~/workspace/lobehub/packages/types/src/files/`
**Integrate during:** app mirror (resource library)

| Identifier | Original file | Notes |
|---|---|---|
| `./list` re-export | `files/list.ts` | file-library listing types |
| `./upload` re-export | `files/upload.ts` | upload flow types |

**Recovery:** un-comment the two deferred re-exports in our `files/index.ts`
once `list.ts` and `upload.ts` are built.

## 4. Model catalog cards

**Trimmed from:** `packages/types/src/llm.ts` (line 6, deferred)
**Original:** `~/workspace/lobehub/packages/types/src/llm.ts`
**Integrate during:** model adapter phase (real model-bank package)

| Identifier | Notes |
|---|---|
| `ChatModelCard` | re-exported from `model-bank` |
| `ModelProviderCard` | re-exported from `model-bank` |

**Recovery:** un-comment the deferred re-export in our `llm.ts` once the real
`model-bank` package exists.

## 5. Share tool grants

**Trimmed from:** `packages/types/src/agentRuntime.ts` (deferred field +
`./agent/share` import)
**Original:** `~/workspace/lobehub/packages/types/src/agentRuntime.ts` (lines
1, 130–139)
**Integrate during:** app mirror (agent sharing)

| Identifier | Notes |
|---|---|
| `AgentShareToolGrant` | type from `./agent/share` |
| `toolGrants?` field on `AgentInitRequest` | mirrors `shareConfig.toolGrants` |

**Recovery:** build `agent/share.ts`, then un-comment the import and field in
our `agentRuntime.ts`.

## 6. Agent sub-modules (deferred exports)

**Trimmed from:** `packages/types/src/agent/index.ts` (commented re-exports)
**Original:** `~/workspace/lobehub/packages/types/src/agent/`
**Integrate during:** app mirror

| Module | Notes |
|---|---|
| `./modelSelection` | agent model picker types |
| `./share` | agent sharing types (unblocks trim #5) |
| `./tts` | agent voice types |

**Recovery:** build each module, then un-comment its re-export in our
`agent/index.ts`.

## 7. Types root barrel

**Missing:** `packages/types/src/index.ts`
**Integrate during:** when the types package is complete (unblocks
`@azzar/types` imports across model-runtime)

## 8. CLI references

**Deferred in:** `agent/agencyConfig.ts`, `agent/heterogeneousAgent.ts`,
`agent/executionTargetRules.ts` (comments mention `lh hetero exec`,
`lh connect`)
**Integrate during:** our CLI build (after the agent system is done — his
standing order)

---

## Audit trail

- 2026-10-20 ~20:00 EEST: extreme audit captured the full trimmed export lists
  (agencyConfig 10 identifiers, device ~90 identifiers).
- 2026-10-20 ~20:10 EEST: registry created on his question — every trim now
  has a recovery path.

---

## Minimal barrel stubs (Phase 6, agent-runtime support)

Created minimal to unblock agent-runtime imports. Full versions deferred to app mirror.

**File:** `packages/types/src/message/index.ts` (minimal barrel)
**Original:** `~/workspace/lobehub/packages/types/src/message/index.ts`
**Integrate during:** app mirror

**File:** `packages/types/src/session/index.ts` (minimal barrel)
**Original:** `~/workspace/lobehub/packages/types/src/session/index.ts`
**Integrate during:** app mirror

**File:** `packages/types/src/task/index.ts` (minimal barrel)
**Original:** `~/workspace/lobehub/packages/types/src/task/index.ts`
**Integrate during:** app mirror

**File:** `packages/types/src/goalReport.ts` (minimal)
**Original:** `~/workspace/lobehub/packages/types/src/goalReport.ts`
**Integrate during:** app mirror

**File:** `packages/types/src/meta.ts` (minimal)
**Original:** `~/workspace/lobehub/packages/types/src/meta.ts`
**Integrate during:** app mirror

---

## React UI types trimmed from tool/builtin.ts (Phase 6)

**Trimmed from:** `packages/types/src/tool/builtin.ts`
**Original:** `~/workspace/lobehub/packages/types/src/tool/builtin.ts`
**Integrate during:** app mirror (tool UI components)

14 React render/intervention types removed (162 lines). These are UI-only types for tool inspectors/renderers.

| Identifier | Notes |
|---|---|
| `BuiltinInspectorProps` | React props for tool inspector |
| `BuiltinInterventionProps` | React props for intervention UI |
| `BuiltinPlaceholderProps` | React props for placeholder |
| `BuiltinPortalProps` | React props for portal |
| `BuiltinPortalTitleProps` | React props for portal title |
| `BuiltinRenderProps` | React props for render |
| `BuiltinStreamingProps` | React props for streaming UI |
| (+ 7 more render-related types) | See original file lines |

## Recovery Log

### 2026-10-21 ~21:25 EEST — All trims recovered

- **Trim #1 (agencyConfig.ts):** RECOVERED. Rebuilt from original (1,325 lines), all 10 identifiers restored with brand swap. Zero leaks.
- **Trim #2 (device.ts):** RECOVERED. Full 1,111-line version built in Wave 3.
- **Trim #3 (files/index.ts):** RECOVERED. list.ts + upload.ts re-exports un-commented.
- **Trim #4 (llm.ts):** RECOVERED. ChatModelCard/ModelProviderCard re-exported from @azzar/model-bank.
- **Trim #5 (agentRuntime.ts):** RECOVERED. toolGrants field un-commented.
- **Trim #6 (agent/index.ts):** RECOVERED. modelSelection/share/tts re-exports un-commented.
- **Trim #7 (types root barrel):** RECOVERED. packages/types/src/index.ts built (84 exports).
- **Trim #8 (CLI references):** DEFERRED to CLI phase per HAZEM's order. `lh` references remain in comments, to be renamed when our CLI is built.
