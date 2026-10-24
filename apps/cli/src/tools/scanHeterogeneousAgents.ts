import type { HeterogeneousAgentScanMap } from '@azzar/heterogeneous-agents';
import { scanHeterogeneousAgentsOnHost } from '@azzar/heterogeneous-agents/scanHost';

export interface ScanHeterogeneousAgentsResult {
  agents: HeterogeneousAgentScanMap;
}

/**
 * Probe every known heterogeneous agent type on this device in one pass.
 * Dispatched by the server via the `device.scanAgents` tRPC procedure.
 */
export async function scanHeterogeneousAgents(): Promise<ScanHeterogeneousAgentsResult> {
  return { agents: await scanHeterogeneousAgentsOnHost() };
}
