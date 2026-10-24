import type { NeonDatabase } from 'drizzle-orm/neon-serverless';

import type * as schema from './schemas';

export type AzzarChatDatabaseSchema = typeof schema;

export type AzzarChatDatabase = NeonDatabase<AzzarChatDatabaseSchema>;

export type Transaction = Parameters<Parameters<AzzarChatDatabase['transaction']>[0]>[0];
