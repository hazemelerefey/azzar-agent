import { type AzzarAgentConfig } from '@/types/agent';

export interface UpdateAgentResult {
  agent?: AzzarAgentConfig;
  success: boolean;
}
