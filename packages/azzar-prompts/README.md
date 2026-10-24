# @azzar/prompts

Prompt chains and templates for the AZZAR application.

## Features

- **Prompt chains**: reusable prompt templates for common AI tasks
- **Multi-language support**: prompts for multiple languages
- **Type safety**: full TypeScript support with proper type definitions

## Available prompt chains

- `chainSummaryTitle`: generate conversation titles
- `chainLangDetect`: detect the language of input text
- `chainTranslate`: translate content between languages
- `chainPickEmoji`: select appropriate emojis for content
- `chainAnswerWithContext`: answer questions using knowledge base context
- `chainAbstractChunkText`: summarize text chunks

## Testing

Prompt evaluation tests live in `devtools/agent-evals/scenarios/prompt-chain/` (cloud repo) and run via the agent-evals CLI.

```bash
# Run from cloud repo root
bun run agent-evals run prompt-chain/translate
bun run agent-evals run prompt-chain/emoji-picker
bun run agent-evals list # See all available scenarios
```

## Development

```bash
# Run unit tests
pnpm test
```

## Architecture

```
src/
├── chains/           # Prompt chain implementations
├── prompts/          # Prompt templates and utilities
└── index.ts          # Main exports
```
