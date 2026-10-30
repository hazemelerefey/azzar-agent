import type { MissionDAG } from './dag';
import type { NodeStatus } from './types';

export interface SchedulerOptions {
  concurrencyCap?: number;
  onNodeComplete?: (nodeId: string, output: any) => Promise<void> | void;
  onNodeFailed?: (nodeId: string, error: any) => Promise<void> | void;
  onNodeStart?: (nodeId: string) => Promise<void> | void;
}

export type NodeExecutionFn = (nodeId: string) => Promise<{
  output?: any;
  requiresApproval?: boolean;
  status: 'completed' | 'failed' | 'paused';
}>;

export class MissionScheduler {
  private readonly dag: MissionDAG;
  private readonly concurrencyCap: number;
  private nodeStatuses: Record<string, NodeStatus>;
  private activeWorkers = new Set<string>();

  constructor(
    dag: MissionDAG,
    initialStatuses?: Record<string, NodeStatus>,
    options?: SchedulerOptions,
  ) {
    this.dag = dag;
    this.concurrencyCap = options?.concurrencyCap ?? 2;
    this.nodeStatuses = { ...initialStatuses };

    // Initialize missing statuses to pending
    for (const node of this.dag.nodes) {
      if (!this.nodeStatuses[node.id]) {
        this.nodeStatuses[node.id] = 'pending';
      }
    }
  }

  getStatuses(): Record<string, NodeStatus> {
    return { ...this.nodeStatuses };
  }

  setNodeStatus(nodeId: string, status: NodeStatus): void {
    this.nodeStatuses[nodeId] = status;
  }

  getActiveCount(): number {
    return this.activeWorkers.size;
  }

  isAllTerminal(): boolean {
    return this.dag.nodes.every((n) => {
      const st = this.nodeStatuses[n.id];
      return st === 'completed' || st === 'failed' || st === 'skipped';
    });
  }

  /**
   * Run the ready-set loop until:
   * 1. All nodes complete
   * 2. A node fails (blocks dependents)
   * 3. An approval node pauses the run
   */
  async runLoop(
    executeNode: NodeExecutionFn,
    callbacks?: {
      onNodeComplete?: (nodeId: string, output: any) => Promise<void>;
      onNodeStart?: (nodeId: string) => Promise<void>;
      onPause?: (nodeId: string) => Promise<void>;
    },
  ): Promise<{
    nodeStatuses: Record<string, NodeStatus>;
    pausedNodeId?: string;
    status: 'completed' | 'failed' | 'paused';
  }> {
    let pausedNodeId: string | undefined;
    let hasFailure = false;

    // Running loop while there are active tasks or ready tasks
    while (true) {
      if (hasFailure && this.activeWorkers.size === 0) {
        return { nodeStatuses: this.getStatuses(), status: 'failed' };
      }

      if (pausedNodeId && this.activeWorkers.size === 0) {
        return { nodeStatuses: this.getStatuses(), pausedNodeId, status: 'paused' };
      }

      if (this.isAllTerminal()) {
        const anyFailed = Object.values(this.nodeStatuses).includes('failed');
        return {
          nodeStatuses: this.getStatuses(),
          status: anyFailed ? 'failed' : 'completed',
        };
      }

      // Check if paused
      if (pausedNodeId) {
        // Wait for remaining in-flight tasks to finish
        if (this.activeWorkers.size > 0) {
          await new Promise((r) => setTimeout(r, 20));
          continue;
        }
        return { nodeStatuses: this.getStatuses(), pausedNodeId, status: 'paused' };
      }

      // Get ready nodes
      const readyNodes = this.dag.getReadyNodes(this.nodeStatuses);

      if (readyNodes.length === 0 && this.activeWorkers.size === 0) {
        // Deadlock or finished
        const anyFailed = Object.values(this.nodeStatuses).includes('failed');
        return {
          nodeStatuses: this.getStatuses(),
          status: anyFailed ? 'failed' : 'completed',
        };
      }

      // Fill up to concurrency cap
      const availableSlots = this.concurrencyCap - this.activeWorkers.size;
      const nodesToDispatch = readyNodes.slice(0, Math.max(0, availableSlots));

      if (nodesToDispatch.length === 0) {
        // All slots full, wait a bit for an active worker to report
        await new Promise((r) => setTimeout(r, 10));
        continue;
      }

      for (const nodeId of nodesToDispatch) {
        this.nodeStatuses[nodeId] = 'running';
        this.activeWorkers.add(nodeId);

        // Dispatch async worker
        (async () => {
          try {
            await callbacks?.onNodeStart?.(nodeId);
            const res = await executeNode(nodeId);

            if (res.status === 'paused' || res.requiresApproval) {
              this.nodeStatuses[nodeId] = 'pending'; // Remains pending until approval
              pausedNodeId = nodeId;
              await callbacks?.onPause?.(nodeId);
            } else if (res.status === 'completed') {
              this.nodeStatuses[nodeId] = 'completed';
              await callbacks?.onNodeComplete?.(nodeId, res.output);
            } else {
              this.nodeStatuses[nodeId] = 'failed';
              hasFailure = true;
            }
          } catch {
            this.nodeStatuses[nodeId] = 'failed';
            hasFailure = true;
          } finally {
            this.activeWorkers.delete(nodeId);
          }
        })();
      }

      // Short yield to allow promises to run
      await new Promise((r) => setTimeout(r, 10));
    }
  }
}
