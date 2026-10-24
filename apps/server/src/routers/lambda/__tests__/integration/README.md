# Integration tests

This directory contains the AZZAR backend integration tests.

## Directory structure

```
tests/integration/
├── README.md           # This file
├── setup.ts            # Shared integration test setup
├── utils.ts            # Integration test utilities
└── routers/            # tRPC router integration tests
    ├── message.integration.test.ts
    ├── session.integration.test.ts
    └── topic.integration.test.ts
```

## What are integration tests?

Integration tests verify that multiple modules work correctly together. Unlike unit tests:

- **Unit tests**: test a single function or class, isolating dependencies with mocks
- **Integration tests**: test the full call chain (Router to Service to Model to Database), using a real database

## Why integration tests are needed

Even with high unit test coverage (80%+), integration problems can still appear:

1. **Dropped parameters**: `containerId` or `threadId` lost somewhere in the call chain
2. **Database constraints**: foreign key relations and cascading deletes cannot be verified with mocks
3. **Transaction integrity**: atomicity of cross-table operations
4. **Real scenarios**: simulating a user's complete operation flow

## Running integration tests

```bash
# Run all integration tests
pnpm test:integration

# Run a specific file
pnpm vitest tests/integration/routers/message.integration.test.ts

# Watch mode
pnpm vitest tests/integration --watch
```

## Best practices for writing integration tests

### 1. Use a real database environment

```typescript
import { getTestDB } from '@/database/models/__tests__/_util';

const serverDB = await getTestDB();
```

### 2. Keep each test case independent

```typescript
beforeEach(async () => {
  // Prepare test data
  await serverDB.insert(users).values({ id: userId });
});

afterEach(async () => {
  // Clean up test data
  await serverDB.delete(users).where(eq(users.id, userId));
});
```

### 3. Test the complete call chain

```typescript
// A good integration test
it('should create message with correct sessionId and topicId', async () => {
  const caller = messageRouter.createCaller(createTestContext());

  const messageId = await caller.createMessage({
    content: 'Test',
    sessionId: testSessionId,
    topicId: testTopicId,
  });

  // Verify from the database
  const message = await serverDB.select().from(messages).where(eq(messages.id, messageId));
  expect(message.topicId).toBe(testTopicId);
});
```

### 4. Verify the critical paths

Prioritize testing:

- ID passing across layers
- Permission checks
- Concurrency scenarios
- Error handling

## Coverage targets

- **API layer integration tests**: 30%
- **Critical business flows**: 100%
- **Error scenarios**: main paths covered

## Notes

1. Integration tests are slower than unit tests. Do not overuse them.
2. Keep test data isolated so tests do not affect each other.
3. Use meaningful test data to make debugging easier.
4. When a test fails, check the database state.
