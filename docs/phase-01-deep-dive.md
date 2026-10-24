# Phase 1 Deep Dive - The Skeleton

You built 10 files. Zero agent logic. This doc takes every one of them apart:
each line, each flag, each symbol. For every piece you get four answers:
**what it does**, **why we wrote it**, **what breaks if we didn't**,
**what else we could write instead**.

How to read this doc: every file is shown first in full, then dissected
line by line. Nothing is assumed known. If a word is new, it is explained
where it first appears.

---

## File 1: `package.json` (project root)

The birth certificate. npm, VS Code, and the TypeScript compiler all start
here. Without this file, the folder is just loose files, not a project.

```json
{
  "name": "azar",
  "version": "0.1.0",
  "private": true,
  "description": "AZAR - master AI agent orchestrator. The foundation every future AZAR agent product is built on.",
  "workspaces": ["packages/*", "apps/*"],
  "engines": { "node": ">=20" },
  "scripts": {
    "build": "tsc -b",
    "typecheck": "tsc -b --dry"
  }
}
```

### Line by line

**`{` and `}`** - These open and close a JSON object. JSON (JavaScript Object
Notation) is the data format npm understands. Why JSON and not YAML or TOML:
npm only reads `package.json` as JSON, no choice exists here.

**`"name": "azar"`** - The project's name.
- Does: names the workspace root. Shows up in logs and error messages.
- Why: every project needs an identity; npm requires this field.
- Without it: `npm install` refuses to run ("no name provided").
- Alternative: none, it is mandatory. Rules: lowercase, no spaces
  (npm rejects `"name": "My Agent"`).

**`"version": "0.1.0"`** - The project's version, in semver format:
MAJOR.MINOR.PATCH.
- Does: `0` major means "not stable yet, expect breaking changes".
  `1` minor means "first small feature set". `0` patch means "no fixes yet".
- Why `0.1.0` and not `1.0.0`: version `1.0.0` is a promise of stability.
  We are at the skeleton stage, so `0.x` is the honest version.
- Without it: npm warns and many tools assume `1.0.0`, which lies.
- Alternative: you could start at `1.0.0`, but it misleads anyone who
  depends on the version number.

**`"private": true`** - A guardrail, not a label.
- Does: makes `npm publish` refuse with an error. Your code can never be
  pushed to the public npm registry, even by a typo'd command.
- Why: this is proprietary code. One accidental `npm publish` and your
  product is public forever; you cannot un-ring that bell.
- Without it: nothing stops a mistaken publish.
- Alternative: none. Every closed-source project sets this.

**`"description": "..."`** - One human sentence about the project.
- Does: shows in `npm` listings, GitHub headers, and search results.
- Why: anyone opening this repo (including future-you) understands it in
  five seconds.
- Without it: harmless, but the project looks unfinished.
- Alternative: none needed; it is free documentation.

**`"workspaces": ["packages/*", "apps/*"]`** - The monorepo magic. This is
the most important line in the file.
- Does: tells npm "the folders matching these patterns are part of ONE
  project". The `*` is a glob: it means "any folder directly inside".
  So `packages/agent-core`, `packages/tools`, `apps/backend` all join.
- Why: it lets `@azar/tools` write `import { AZAR } from '@azar/agent-core'`
  and have it just work, with zero publishing to npm. npm links the folders
  together on `npm install`.
- Without it: the six folders are strangers. Cross-package imports fail,
  and sharing code would require publishing each package to npm first,
  which is slow and wrong for code that changes daily.
- Alternative: pnpm workspaces or Yarn workspaces do the same job with
  different package managers. Or no monorepo at all (six separate repos),
  which is worse for one product: six version numbers, six repos to keep
  in sync.

**`"engines": { "node": ">=20" }`** - The minimum runtime.
- Does: `>=` means "version 20 or anything newer". If someone with Node 16
  runs `npm install`, npm prints an error instead of installing.
- Why: our TypeScript output targets modern JavaScript (ES2022). Node 16
  cannot run some of it and would crash with cryptic syntax errors.
  Failing fast with a clear message beats failing late with a confusing one.
- Without it: a teammate on old Node gets weird crashes and blames the code.
- Alternative: pin an exact version (`"node": "20.11.0"`), or omit it
  (not recommended).

**`"scripts": { ... }`** - Named shortcuts. Instead of typing a long command,
you type `npm run build`.
- Does: maps a short name to a shell command.
- Why: nobody memorizes compiler flags; scripts document the workflow.
- Without it: you type `npx tsc -b` by hand every time, and every teammate
  types it slightly differently.

**`"build": "tsc -b"`** - Compile the whole project.
- `tsc` = the TypeScript compiler: turns `.ts` files into runnable `.js`.
- `-b` = `--build` (the short flag). Build mode does three things plain
  `tsc` does not: (1) follows project references, so packages build in
  dependency order (agent-core before tools, because tools imports it);
  (2) skips packages whose output is already up to date (fast rebuilds);
  (3) refuses to run if a referenced project is misconfigured, instead of
  producing half-broken output.
- Why `-b`: we have six packages that depend on each other. Plain `tsc`
  compiles one project and ignores the rest.
- Without `-b` (just `tsc`): only the current folder compiles; cross-package
  imports resolve to stale or missing files.
- Alternative: `tsc -p packages/agent-core` (`-p` = `--project`, builds ONE
  project file). Fine for debugging one package, wrong for building all.

**`"typecheck": "tsc -b --dry"`** - Check types without producing files.
- `--dry` = dry run: "tell me what you WOULD build, but build nothing."
  Combined with `-b`, the compiler still reads and type-checks every file
  in every package (that is how it decides what needs building), then stops
  before writing any output.
- Why: a fast "is my code correct?" command that never touches `dist/`.
  You run it constantly while coding.
- Without it: the only check is a full build, which writes files and is
  slower.
- Alternative: `tsc --noEmit` (checks one project, emits nothing). Ours is
  better because `-b` covers all six packages at once.

---

## File 2: `tsconfig.base.json` - the shared rulebook

Every package inherits these compiler rules. One place to change them, not six.

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "rootDir": "src",
    "outDir": "dist",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true
  }
}
```

**`"compilerOptions"`** - The section that holds every compiler setting.
Everything inside configures `tsc`. Without this wrapper, settings are ignored.

**`"strict": true`** - The master strictness switch.
- Does: turns on seven strict checks at once. The two you will feel daily:
  `noImplicitAny` (every variable must have a known type; no silent `any`)
  and `strictNullChecks` (`undefined` and `null` are not allowed where a
  value is expected).
- Example of what it catches:
  ```ts
  function greet(name?: string) {
    return name.toUpperCase(); // ERROR: name might be undefined
  }
  ```
  Without strict, this compiles, then crashes at runtime when `name` is
  missing. With strict, the compiler forces you to handle it:
  ```ts
  return name?.toUpperCase() ?? "stranger";
  ```
- Why: strict mode moves bugs from runtime (your user sees them) to
  compile time (you see them). This is the entire point of TypeScript.
- Without it: TypeScript is just JavaScript with optional types. Bugs slip
  through exactly like they do in plain JS.
- Alternative: enable the seven flags individually. Nobody does; `strict`
  is the industry standard, and you saw the full list so you know what it
  contains.

**`"target": "ES2022"`** - Which JavaScript version the compiler outputs.
- Does: ES2022 is modern JS (supports top-level `await`, class fields,
  `Array.at()`). The compiler will NOT down-convert these to older syntax.
- Why ES2022: our engine floor is Node 20, which runs ES2022 natively.
  Higher target = cleaner, smaller, faster output.
- Without it (default is ES5, from 2009): the compiler rewrites modern
  code into ancient patterns with helper functions. Bloated output for no
  reason.
- Alternative: `ES2020` or `ES2021` if you ever need to support older
  runtimes. For Node 20+, ES2022 is correct.

**`"module": "NodeNext"`** - How `import`/`export` statements are emitted.
**`"moduleResolution": "NodeNext"`** - How the compiler FINDS the files you
import. These two must always be set together; TypeScript errors if they
disagree.
- Does: `NodeNext` means "behave exactly like the Node.js version running
  this code". It understands both ESM (`import`) and CommonJS (`require`)
  and enforces the rules of each, including the `.js` extension rule you
  will meet in `index.ts`.
- Why: the old default (`CommonJS`/`Node10` resolution) mis-resolves modern
  packages, producing "cannot find module" crashes at runtime for code that
  compiled fine. NodeNext fails at compile time instead, which is where
  you want the failure.
- Without it: code compiles, then crashes when run. The worst kind of bug.
- Alternative: `"module": "Node16"` (same idea, older Node), or `"Bundler"`
  (for frontend tools like Vite that resolve differently). For a Node
  backend project, NodeNext is the right choice.

**`"lib": ["ES2022"]`** - Which built-in APIs TypeScript knows exist.
- Does: teaches the compiler about `Promise`, `Map`, `Set`, `Array.at`,
  and every other standard object. `"lib"` is the dictionary of the
  language's standard library.
- Why: without it, `new Promise(...)` is an error: "Cannot find name
  'Promise'". The compiler only knows what you tell it.
- Without it: standard code fails to compile.
- Alternative: add `"DOM"` later for the frontend package (browser APIs
  like `document` and `fetch`). Backend code must NOT include DOM, or
  browser-only code would compile and then crash on the server.

**`"rootDir": "src"`** - Where your source code lives.
**`"outDir": "dist"`** - Where compiled output goes.
- Does: every `.ts` under `src/` is compiled to a mirror path under
  `dist/`. Source and output never mix.
- Why: if output landed next to source, your repo would fill with `.js`
  files beside every `.ts` file, and Git would track generated code.
  `src` in, `dist` out, clean separation.
- Without them: compiled files scatter next to sources. Messy and
  unreviewable.
- Alternative: none sane. This layout is universal.

**`"declaration": true`** - Emit `.d.ts` type files next to the `.js`.
- Does: for `brand.ts` it also writes `brand.d.ts`, a file describing the
  TYPES without the code. When `@azar/tools` imports `@azar/agent-core`,
  TypeScript reads the `.d.ts` to type-check and autocomplete, without
  recompiling the source.
- Why: cross-package imports keep full type safety and editor
  autocomplete. This is how the six packages understand each other.
- Without it: importing another package gives you `any` types. No
  autocomplete, no checking. The monorepo advantage evaporates.
- Alternative: project references to source files (only viable in tiny
  projects; breaks down fast).

**`"declarationMap": true`** - Emit `.d.ts.map` files.
- Does: "go to definition" in VS Code jumps to the real `.ts` source
  instead of the generated `.d.ts`. A quality-of-life feature.
- Why: when debugging across packages, you want to land in real code.
- Without it: harmless; you land in type stubs instead.
- Alternative: omit it. It is a nice-to-have, not a need.

**`"sourceMap": true`** - Emit `.js.map` files.
- Does: maps every line of compiled JS back to your TypeScript. When an
  error throws at runtime, the stack trace shows your `.ts` line numbers,
  and the debugger lets you step through TypeScript, not compiled JS.
- Why: debugging compiled output directly is miserable. Source maps make
  the compiler invisible.
- Without it: stack traces point at `dist/` files you never wrote.
- Alternative: none. Always on.

**`"skipLibCheck": true`** - Do not type-check third-party `.d.ts` files.
- Does: `tsc` checks YOUR code but trusts library type definitions
  without verifying them. Much faster, and one buggy library cannot fail
  your build.
- Why: libraries sometimes ship slightly wrong types. That is their bug,
  not yours; it should not block your work.
- Without it: slower builds, and a bad update in `node_modules` can break
  your compile with errors in files you never touched.
- Alternative: none. This is on in virtually every real project.

**`"forceConsistentCasingInFileNames": true`** - File name casing matters.
- Does: `import "./Brand"` when the file is `brand.ts` becomes an ERROR.
- Why: Linux file systems are case-sensitive (`Brand.ts` and `brand.ts`
  are different files); macOS and Windows are not (they are the same).
  Without this flag, code that works on your laptop crashes on a Linux
  server with "module not found", and you will stare at it for an hour.
- Without it: works on Windows/Mac, breaks on Linux. The classic
  "works on my machine" bug.
- Alternative: none. Always on.

**`"exactOptionalPropertyTypes": true`** - Optional properties are exact.
- Does: with `interface C { color?: string }`, you may OMIT `color`, but
  you may NOT write `{ color: undefined }` explicitly. The `?` means
  "absent", not "undefined".
- Example:
  ```ts
  interface C { color?: string }
  const a: C = {};                  // OK: absent
  const b: C = { color: undefined }; // ERROR with the flag, silent without
  ```
- Why: catches sloppy code that passes `undefined` around instead of
  deciding whether a value exists. Explicit is better than vague.
- Without it: `undefined` sneaks into objects silently and surfaces as
  weird behavior far from where it entered.
- Alternative: omit it and write `color?: string | undefined` when you
  truly mean "undefined allowed". The flag forces you to say what you mean.

**`"noUncheckedIndexedAccess": true`** - Array/object indexing is unsafe
until proven otherwise.
- Does: `arr[0]` gets type `string | undefined` instead of `string`.
- Example:
  ```ts
  const arr = ["a"];
  const x = arr[5];       // string | undefined  (with flag)
  x.toUpperCase();        // ERROR: x might be undefined
  if (x) x.toUpperCase(); // OK: you checked first
  ```
- Why: out-of-bounds access is a top crash source. The flag forces the
  check at the exact line where the risk is.
- Without it: `arr[5].toUpperCase()` compiles cleanly, then throws
  `Cannot read properties of undefined` at runtime.
- Alternative: none recommended. This flag has saved more production
  crashes than any other on this list.

**`"noImplicitOverride": true`** - Overriding a parent method must say so.
- Does: in a class hierarchy, an overriding method must be marked with the
  `override` keyword.
- Example:
  ```ts
  class Animal { speak() { return "..."; } }
  class Dog extends Animal {
    speak() { return "woof"; } // ERROR: add the word "override"
  }
  // correct:
  class Dog extends Animal {
    override speak() { return "woof"; }
  }
  ```
- Why: if you misspell the method name (`spek()`), without the flag you
  silently create a NEW method and the parent's version runs instead.
  With the flag, the compiler says "you wrote override but no parent
  method matches", catching the typo instantly.
- Without it: typo'd overrides fail silently. The parent behavior runs and
  you wonder why your code never executes.
- Alternative: none. Always on.

---

## File 3: `packages/agent-core/package.json` - the heart declares itself

Same shape as the root, but this is a LIBRARY, not the project. It will be
imported by the other five packages.

```json
{
  "name": "@azar/agent-core",
  "version": "0.1.0",
  "private": true,
  "description": "Brain + body: model adapter, plan-execute loop, memory, 7x24 tasks, hub, prompts. Drag source: lab 01-agent-core.",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc -b",
    "typecheck": "tsc -b --dry"
  }
}
```

Only the new lines are dissected; the rest works exactly as in File 1.

**`"name": "@azar/agent-core"`** - The `@azar/` part is a SCOPE, like a
surname for packages.
- Does: namespaces the package. `@azar/agent-core` can never collide with
  someone else's `agent-core` on npm.
- Why: it marks ownership visibly. Every import in the codebase reads as
  "this is ours": `import { AZAR } from '@azar/agent-core'`.
- Without the scope (just `"agent-core"`): the name might already exist on
  npm, and nothing in the import path signals ownership.
- Alternative: no scope for throwaway packages. For a product, always scope.

**`"main": "dist/index.js"`** - The CommonJS entry point.
- Does: when old-style code runs `require('@azar/agent-core')`, Node loads
  this file.
- Why: some tools still use `require`. This keeps them working.
- Without it: `require()` of the package fails.

**`"types": "dist/index.d.ts"`** - Where TypeScript finds the types.
- Does: points the compiler at the declaration file generated by
  `"declaration": true` in File 2. This is the other half of that setting:
  one emits the types, this one advertises them.
- Why: without it, TypeScript cannot find the package's types and every
  import becomes `any`.
- Without it: cross-package autocomplete and checking silently die.
- Alternative: none. `main` + `types` are the two entry doors; a package
  needs both.

---

## File 4: `packages/agent-core/tsconfig.json` - plugging into the rulebook

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true
  },
  "include": ["src"]
}
```

**`"extends": "../../tsconfig.base.json"`** - Inherit, don't duplicate.
- Does: loads every setting from the base file, then applies this file's
  overrides on top. `../..` means "go up two folders": from
  `packages/agent-core/` up to the project root, where the base lives.
- Why: change a rule once (in the base), and all six packages follow.
  Six copies of the same rules would drift apart within a month.
- Without it: you paste all 14 settings into every package. Edit one rule,
  edit six files, miss one, get mysterious inconsistencies.
- Alternative: none sane for a monorepo.

**`"composite": true`** - "This package is a buildable unit."
- Does: three things: (1) forces `declaration: true` (references need type
  files); (2) makes `tsc -b` track this package's build state in a
  `.tsbuildinfo` file, so unchanged packages are skipped; (3) restricts
  some sloppy patterns that break incremental builds.
- Why: `tsc -b` REFUSES to build a referenced project that is not
  composite. This flag is the ticket that lets the root `npm run build`
  include this package, in the right order.
- Without it: `tsc -b` errors with "referenced project must have
  composite enabled". The monorepo build breaks.
- Alternative: none. Composite is mandatory for project references.

**`"include": ["src"]`** - Compile only this folder.
- Does: `tsc` looks at `src/` and nowhere else. Config files, READMEs,
  and stray scripts are ignored.
- Why: without it, the compiler may pick up files you never meant to
  compile (a scratch test file, a config), producing confusing errors.
- Without it: stray files get compiled; errors appear from nowhere.
- Alternative: `"files"` (an explicit file list) for tiny packages.
  `"include"` with a folder is the standard.

---

## File 5: `packages/agent-core/src/brand.ts` - the brand on line one

The single source of truth for identity. Every future file imports the brand
from here. Nothing is hardcoded anywhere else.

```ts
/**
 * AZAR brand constants. Imported by every package - the single source of
 * truth for the master orchestrator's identity. Future agent products
 * override these when they customize AZAR for their job.
 */
export const AZAR = {
  /** Product name. */
  name: 'AZAR',
  /** npm scope for all packages. */
  scope: '@azar',
  /** Prefix for every builtin tool identifier, e.g. `azar-agent`. */
  toolPrefix: 'azar',
  /** The master orchestrator's title in system prompts. */
  orchestratorTitle: 'AZAR Master Orchestrator',
  version: '0.1.0',
} as const;

export type AzarBrand = typeof AZAR;
```

**The `/** ... */` comment** - a JSDoc block comment.
- Does: documentation attached to the code below it. VS Code shows it on
  hover wherever `AZAR` is imported.
- Why: the most important constant in the project deserves an explanation
  where it lives, not in a separate doc nobody opens.
- `//` is a single-line comment; `/** */` is a block. JSDoc blocks get
  special treatment by editors.

**`export const AZAR = { ... }`** - A constant object, exported.
- `const`: the binding cannot be reassigned (`AZAR = somethingElse` is an
  error). The OBJECT's fields are still mutable unless frozen, which is
  why `as const` below matters.
- `export`: makes it importable by other files. Without `export`, the
  constant is trapped in this file and useless to the project.
- Why an object and not five separate constants: one import gives you the
  whole brand, and the brand travels as a unit.

**`name: 'AZAR'`** - the product name. Single quotes vs double quotes: pure
style. TypeScript accepts both; we use single quotes by convention.

**`scope: '@azar'`** - mirrors the npm scope from File 3. If a future tool
needs to construct a package name at runtime, it reads it from here instead
of hardcoding the string.

**`toolPrefix: 'azar'`** - THE rule that replaces `lobe-`.
- Does: every builtin tool identifier we will ever create starts with this:
  `azar-agent`, `azar-task`, and so on.
- Why it lives here: tool ids get stored in message history permanently
  (you learned this in the lab). Centralizing the prefix means a rebrand
  is one edit, not a hundred.

**`orchestratorTitle: 'AZAR Master Orchestrator'`** - the words the LLM
reads. In Phase 2, system prompts will interpolate this instead of
hardcoding "You are AZAR...". Change the title here, every prompt updates.

**`} as const`** - the most load-bearing two words in the file.
- Does: (1) narrows every property to its LITERAL type: `name` is not
  `string`, it is the exact type `'AZAR'`. (2) Makes all properties
  `readonly`: `AZAR.name = 'X'` is a compile error.
- Example of the protection:
  ```ts
  AZAR.name = 'LOBE';     // ERROR: Cannot assign to 'name' (readonly)
  const n: 'AZAR' = AZAR.name; // OK: the type is the literal 'AZAR'
  ```
- Why: the brand must be immutable. A typo or a rogue assignment that
  renames your product at runtime would be a nightmare to trace. `as const`
  makes it impossible.
- Without it: `name` is just `string`, properties are mutable, and nothing
  stops `AZAR.toolPrefix = 'lobe'` from compiling.
- Alternative: `Object.freeze()` (runtime freeze, no type narrowing) or a
  TypeScript `enum`. `as const` gives both immutability AND literal types
  in two words; it is the modern standard.

**`export type AzarBrand = typeof AZAR;`** - a type from a value.
- `typeof` has TWO meanings and beginners mix them up. At RUNTIME,
  `typeof x` returns a string like `"object"`. In TYPE position (after a
  `: ` or in a `type` alias), `typeof AZAR` means "the TYPE of the AZAR
  value": an object type with all five literal properties.
- Does: creates a reusable type describing the brand's shape, without
  writing a separate `interface`.
- Why: single source of truth again. Add a field to the object and the
  type follows automatically. Two sources (object + interface) would drift.
- Without it: every function that takes the brand would redeclare its
  shape, or worse, use `any`.
- Alternative: write `interface AzarBrand { name: 'AZAR'; ... }` by hand.
  Works, but now the shape exists twice and they can disagree.

---

## File 6: `packages/agent-core/src/index.ts` - the front door

```ts
export * from './brand.js';
```

One line. It deserves respect anyway.

**`export *`** - re-export EVERYTHING from another module.
- Does: anyone who writes `import { AZAR } from '@azar/agent-core'` gets
  it, because this file forwards all of `brand.ts`'s exports outward.
- Why: this file is the package's PUBLIC API. Consumers never import deep
  paths like `@azar/agent-core/dist/brand.js`. The front door stays stable
  even as files move inside: tomorrow `brand.ts` could move to
  `src/identity/brand.ts` and no consumer changes a single import.

**`from './brand.js'`** - note the `.js` extension in a `.ts` file. This is
the number-one beginner gotcha in modern TypeScript.
- Does: with `"module": "NodeNext"` (File 2), TypeScript requires you to
  write the import path EXACTLY as it will appear in the compiled output.
  The compiler turns `brand.ts` into `brand.js`, so you write `.js` NOW,
  in the source.
- Why: Node.js resolves `./brand` (no extension) differently from
  `./brand.js`, and under real ESM rules the extensionless form FAILS at
  runtime. TypeScript forces you to write the truth upfront so compiled
  code never breaks.
- Without `.js` (writing `from './brand'`): error TS2835 under NodeNext:
  "Relative import paths need explicit file extensions". The compiler
  stops you before Node does.
- Alternative: switch `"module"` to `"Bundler"` (Vite-style, extensionless
  imports allowed). We deliberately did not: this is a Node project, and
  NodeNext's strictness prevents runtime surprises.

**Why `index.ts` exists at all:** it is the convention Node and every
bundler follows: importing a folder resolves to its `index` file. It is
the difference between a package and a pile of files.

---

## File 7: the repeated pattern - tools, skills, ui, frontend, backend

Each of the other five packages contains the same four files, with only the
name and description changed:

| Package | `package.json` name | `src/index.ts` |
|---|---|---|
| `packages/tools` | `@azar/tools` | `export {};` (empty for now) |
| `packages/skills` | `@azar/skills` | `export {};` |
| `apps/ui` | `@azar/ui` | `export {};` |
| `apps/frontend` | `@azar/frontend` | `export {};` |
| `apps/backend` | `@azar/backend` | `export {};` |

**`export {};`** - an empty export statement.
- Does: marks the file as a MODULE (with zero exports) instead of a
  global script.
- Why this matters: a `.ts` file with no imports or exports is treated as
  a "script": its top-level names leak into the GLOBAL scope. Two scripts
  declaring `const config` collide with "Duplicate identifier" errors.
  `export {}` opts the file into module scope, where names are private to
  the file. It is a placeholder that says "real exports arrive in later
  phases, but this file is already well-behaved".
- Without it: today nothing breaks (files are empty anyway), but the first
  real code added to two files could collide globally in confusing ways.
- Alternative: leave the file out entirely until needed. We keep the
  placeholder so the folder structure is complete and every package
  compiles from day one.

**`packages/` vs `apps/`** - why two folders?
- `packages/`: LIBRARIES. Code that gets imported by other code. Never run
  directly, never deployed alone.
- `apps/`: RUNNABLE things. The backend server you start, the frontend you
  deploy, the UI package you publish. Each has its own lifecycle.
- Why the split: tools, deploys, and teams treat them differently. A CI
  pipeline builds apps; it only type-checks packages. Mixing them hides
  that distinction.
- Alternative: one flat folder. Works for small projects, becomes a maze
  past a handful of packages.

**The teaching point of the repetition:** patterns beat snowflakes. You
learned one package deeply (agent-core); now you know all six. When a
codebase repeats a shape deliberately, learning compounds instead of
starting over. This is what "convention over configuration" means in
practice.

---

## File 8: `.gitignore` - what Git must never see

```
node_modules/
dist/
*.tsbuildinfo
.env
.env.*
.DS_Store
```

Each line is a pattern. Git ignores any file matching one.

**`node_modules/`** - your dependencies. Thousands of files, hundreds of
megabytes, reinstallable with one command: `npm install`.
- Why ignored: committing it bloats the repo enormously, causes endless
  merge conflicts, and some packages contain OS-specific binaries that
  break when a teammate is on a different OS.
- The trailing `/` means "directory only". `node_modules` the file (if one
  existed) would NOT match; the folder does.

**`dist/`** - compiled output.
- Why ignored: it is GENERATED from `src/`. Committing generated files
  means every build creates fake "changes" in Git, and merges fight over
  files no human wrote. Source is truth; output is disposable.
- Without ignoring: `git status` is permanently noisy and reviews drown
  in generated code.

**`*.tsbuildinfo`** - the incremental build cache from `"composite": true`.
- `*` means "any characters": matches `tsconfig.tsbuildinfo`,
  `packages/agent-core.tsbuildinfo`, anything ending that way.
- Why ignored: it is a local speed cache. Your cache is useless to me and
  mine to you; committing it just creates conflicts.

**`.env`** - environment variables: API keys, secrets, connection strings.
- Why ignored: THIS IS THE MOST IMPORTANT LINE. A committed API key is
  compromised within minutes; bots scan GitHub for them constantly.
  Revoking and rotating a leaked key is painful and sometimes impossible.
- Without it: one `git push` can leak the keys to your LLM provider,
  your database, everything.

**`.env.*`** - `.env.local`, `.env.production`, `.env.staging`, any variant.
- Why both lines: `.env` covers the base file; `.env.*` covers every
  environment-specific twin. Secrets hide in variants too.

**`.DS_Store`** - macOS folder metadata (icon positions, view settings).
- Why ignored: invisible junk the OS drops in every folder. Committing it
  pollutes the repo with files no human will ever open on purpose.

---

## File 9: `LICENSE` - the ownership paper

```
Copyright (c) 2026 Hazem Elerefy. All rights reserved.

AZAR and all its components are proprietary software. No part of this
repository may be copied, modified, distributed, or used to build derivative
works without prior written permission.

The architecture was studied from open-source references for learning; every
line of code in this repository is original work written for AZAR.
```

**`Copyright (c) 2026 Hazem Elerefy.`** - asserts WHO owns it and SINCE WHEN.
The `(c)` is the copyright symbol in plain text. The year fixes the start
of protection; the name fixes the holder.

**`All rights reserved.`** - the classic reservation of rights. In plain
terms: "I keep every right the law gives me; you get none unless I grant
them."

**The proprietary paragraph** - closes the door: no copying, no modifying,
no distributing, no derivatives, without written permission.
- Why: your standing requirement is 100% ownership with no foreign
  licenses. This paragraph IS that requirement, in legal form.
- Alternative: MIT or Apache-2.0 (open source: anyone may use it). You
  explicitly rejected that for your product. The day you want to open
  part of AZAR, you replace this file, deliberately.

**The honesty paragraph** - "architecture studied from open-source
references; every line original."
- Why: it documents the clean-room story. We learned PATTERNS (not
  copyrightable) from the lab and wrote every line ourselves. If anyone
  ever questions provenance, this paragraph plus the lab's BRAND_CLEANUP.md
  is the paper trail.

---

## File 10: `README.md` (root) - the map

The table of the six folders, the brand rules (`@azar/*` scope,
`azar-<domain>` tool ids), and the five-phase build order.
- Why it exists in Phase 1: a repo without a README is a maze. Anyone,
  including future-you six months from now, understands the whole project
  in 30 seconds.
- Why the build order is written down: it is a contract with yourself.
  Phase 2 does not start until Phase 1's doc (this file) exists. Process
  you can see is process you keep.

---

## What Phase 1 gave you

A project that knows its name, enforces strict rules on every future line,
links six packages into one build, carries your brand in exactly one place,
and is legally yours. Nothing runs yet, and that is correct: in Phase 2,
the model adapter will assume `tsconfig.base.json` exists, the tool engine
will assume `@azar/agent-core` resolves, and every prompt will assume
`brand.ts` is the source of truth. Foundations first, wiring second.
