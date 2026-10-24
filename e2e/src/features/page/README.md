# Page module E2E test coverage

This directory contains all E2E test cases for the Page (documents) module.

## Module overview

The Page module is AZZAR's document management feature. It lets users create, edit, and manage document pages.

**Routes**: `/page`, `/page/[id]`

## Feature list and test coverage

### 1. Sidebar: document list management

| Feature            | Description                              | Priority | Status      | Test file        |
| ------------------ | ---------------------------------------- | -------- | ----------- | ---------------- |
| Create document    | Click the + button to create a document  | P0       | Done        | `crud.feature`   |
| Rename document    | Rename via context menu / overflow menu   | P0       | Done        | `crud.feature`   |
| Duplicate document | Duplicate a document (adds "Copy" suffix)| P1       | Done        | `crud.feature`   |
| Delete document    | Delete a document (with confirm dialog)  | P0       | Done        | `crud.feature`   |
| Copy full text     | Copy document content to clipboard       | P2       | Pending     |                  |
| List page size     | Set visible count (20/40/60/100)         | P2       | Pending     |                  |
| All documents drawer | Open the full list with search         | P2       | Pending     |                  |
| Search documents   | Filter by title / content                | P1       | Pending     |                  |

### 2. Editor: document header

| Feature           | Description                              | Priority | Status      | Test file               |
| ----------------- | ---------------------------------------- | -------- | ----------- | ----------------------- |
| Back button       | Return to the previous page              | P2       | Pending     |                         |
| Title editing     | Large title input, auto-saves            | P0       | Done        | `editor-meta.feature`   |
| Emoji picker      | Pick / change / remove the icon          | P1       | Done        | `editor-meta.feature`   |
| Auto-save hint    | Shows the save state                     | P2       | Pending     |                         |
| Full-width toggle | Toggle full / fixed width on large screens | P2     | Pending     |                         |
| Copy link         | Copy the document URL                    | P2       | Pending     |                         |
| Export Markdown   | Export as a .md file                     | P2       | Pending     |                         |
| Page info         | Shows the last edit time                 | P2       | Pending     |                         |

### 3. Editor: rich text editing

| Feature             | Description                        | Priority | Status      | Test file                  |
| ------------------- | ---------------------------------- | -------- | ----------- | -------------------------- |
| Basic text input    | Type and edit text                 | P0       | Done        | `editor-content.feature`   |
| Slash command (/)   | Open the command menu              | P1       | Done        | `editor-content.feature`   |
| Headings H1/H2/H3   | Insert headings                    | P1       | Done        | `editor-content.feature`   |
| Task list           | Insert to-do items                 | P2       | Done        | `editor-content.feature`   |
| Bulleted list       | Insert a bulleted list             | P2       | Done        | `editor-content.feature`   |
| Numbered list       | Insert a numbered list             | P2       | Pending     |                            |
| Image upload        | Insert an image                    | P2       | Pending     |                            |
| Divider             | Insert a horizontal rule           | P2       | Pending     |                            |
| Table               | Insert a table                     | P2       | Pending     |                            |
| Code block          | Insert a code block (with syntax highlighting) | P2 | In progress | `editor-content.feature` |
| LaTeX formula       | Insert a math formula              | P2       | Pending     |                            |
| Bold text           | Bold via keyboard shortcut         | P1       | Done        | `editor-content.feature`   |
| Italic text         | Italic via keyboard shortcut       | P2       | Done        | `editor-content.feature`   |

### 4. Copilot sidebar

| Feature            | Description                       | Priority | Status  | Test file          |
| ------------------ | --------------------------------- | -------- | ------- | ------------------ |
| Open / close panel | Expand / collapse Copilot         | P1       | Pending | `copilot.feature`  |
| Ask Copilot        | Ask about selected text           | P0       | Pending | `copilot.feature`  |
| Agent switching    | Pick a different agent            | P2       | Pending |                    |
| New topic          | Start a new conversation topic    | P2       | Pending |                    |
| Topic history      | View and switch topic history     | P2       | Pending |                    |
| Conversation       | Send messages, receive replies    | P0       | Pending | `copilot.feature`  |
| Model selection    | Switch the model in use           | P2       | Pending |                    |
| File upload        | Drag and drop to upload files     | P2       | Pending |                    |

## Test file structure

```
e2e/src/features/page/
├── README.md              # This document
├── crud.feature           # Sidebar CRUD operations (5 scenarios)
├── editor-meta.feature    # Editor metadata: title, emoji (6 scenarios)
└── editor-content.feature # Rich text editing (8 scenarios)
```

## Test stats

- **Total scenarios**: 19 (passing) + 1 (skipped)
- **Total steps**: 109+
- **Runtime**: about 3 minutes

## Running the tests

```bash
# Run all Page module tests
cd e2e
BASE_URL=http://localhost:3006 \
  DATABASE_URL=postgresql://postgres:postgres@localhost:5433/postgres \
  pnpm exec cucumber-js --config cucumber.config.js --tags "@page and not @skip"

# Run a specific test
pnpm exec cucumber-js --config cucumber.config.js --tags "@PAGE-CREATE-001"

# Debug mode (visible browser)
HEADLESS=false pnpm exec cucumber-js --config cucumber.config.js --tags "@PAGE-TITLE-001"
```

## Status key

- Done: the test case is implemented and passing
- Pending: the feature is identified, the test is not yet written
- In progress: the test case is being developed or needs fixes

## Known issues

1. **Code block test (@PAGE-SLASH-005)**: the `/codeblock` slash command triggers unreliably, marked @skip

## Changelog

| Date       | Change                                                      |
| ---------- | ----------------------------------------------------------- |
| 2025-01-12 | Initialized the feature list, completed sidebar CRUD        |
| 2025-01-12 | Completed editor title / emoji tests (6 scenarios)          |
| 2025-01-12 | Completed rich text editing tests (8 scenarios, 1 skipped)  |
