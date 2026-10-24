---
name: debug-package
description: 'Use for debug() logging, azzar-* namespaces, DEBUG/localStorage.debug configuration and log formatting.'
user-invocable: false
---

# Debug Package Usage Guide

## Basic Usage

```typescript
import debug from 'debug';

// Format: azzar-[module]:[submodule]
const log = debug('azzar-server:market');

log('Simple message');
log('With variable: %O', object);
log('Formatted number: %d', number);
```

## Namespace Conventions

- Desktop: `azzar-desktop:[module]`
- Server: `azzar-server:[module]`
- Client: `azzar-client:[module]`
- Router: `azzar-[type]-router:[module]`

## Format Specifiers

- `%O` - Object expanded (recommended for complex objects)
- `%o` - Object
- `%s` - String
- `%d` - Number

## Enable Debug Output

### Browser

```javascript
localStorage.debug = 'azzar-*';
```

### Node.js

```bash
DEBUG=azzar-* bun run dev
DEBUG=azzar-* pnpm dev
```

### Electron

```typescript
process.env.DEBUG = 'azzar-*';
```

## Example

```typescript
// apps/server/src/routers/lambda/agentEval.ts
import debug from 'debug';

const log = debug('azzar-lambda-router:agent-eval');

log('getAgent input: %O', input);
```
