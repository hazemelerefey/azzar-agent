import { MissionModel } from '@/database/models/mission';

import { MissionApprovalManager } from './approval';
import { MissionCheckpointManager } from './checkpoint';
import { MissionDAG } from './dag';
import { MissionDispositionManager } from './disposition';
import { MissionJournalManager } from './journal';
import { MissionReceiptManager } from './receipt';
import { MissionScheduler } from './scheduler';
import type {
  MissionDAGDef,
  MissionReceipt,
  MissionStatus,
  NodeStatus,
  ReceiptApprovalStep,
  ReceiptToolCall,
} from './types';

export interface RunMissionContext {
  executeNode: (
    nodeId: string,
    inputs: any,
  ) => Promise<{
    approvalPayload?: any;
    /** Approvals consumed by tap tools inside this node (recorded in the checkpoint). */
    consumedApprovalIds?: string[];
    cost?: number;
    error?: string;
    modelDisclosure?: { model: string; provider: string };
    output?: any;
    requiresApproval?: boolean;
    status: 'completed' | 'failed' | 'paused';
    tokenUsage?: { completionTokens: number; promptTokens: number; totalTokens: number };
    toolCalls?: ReceiptToolCall[];
  }>;
}

export class MissionEngine {
  private missionModel: MissionModel;
  private approvalManager: MissionApprovalManager;
  private checkpointManager: MissionCheckpointManager;
  private journalManager: MissionJournalManager;
  private receiptManager: MissionReceiptManager;

  constructor(missionModel?: MissionModel) {
    this.missionModel = missionModel || new MissionModel();
    this.approvalManager = new MissionApprovalManager(this.missionModel);
    this.checkpointManager = new MissionCheckpointManager(this.missionModel);
    this.journalManager = new MissionJournalManager(this.missionModel);
    this.receiptManager = new MissionReceiptManager(this.missionModel);
  }

  /**
   * Create and persist a new mission.
   */
  async createMission(dagDef: MissionDAGDef) {
    const dag = new MissionDAG(dagDef);
    await this.missionModel.createMission({
      dagJson: dag.definition,
      departmentId: dagDef.departmentId || 'marketing',
      id: dagDef.id,
      mode: dagDef.mode || 'company',
      status: 'pending',
      title: dagDef.title,
    });

    for (const node of dag.nodes) {
      await this.missionModel.createNode({
        allowedToolIds: node.allowedToolIds,
        approvalRequired: !!node.approvalRequired,
        assignee: node.assignee,
        dependsOnJson: node.dependsOn,
        expectedOutputSchema: node.expectedOutputSchema,
        missionId: dagDef.id,
        nodeId: node.id,
        status: 'pending',
      });
    }

    return dagDef.id;
  }

  /**
   * Run or resume a mission from its current state.
   */
  async runMission(
    missionId: string,
    context: RunMissionContext,
    options?: { concurrencyCap?: number },
  ): Promise<{
    consumedApprovalIds: string[];
    missionId: string;
    nodeStatuses: Record<string, NodeStatus>;
    pausedApprovalId?: string;
    pausedNodeId?: string;
    receipt?: MissionReceipt | null;
    status: MissionStatus;
  }> {
    const mission = await this.missionModel.getMission(missionId);
    if (!mission) {
      throw new Error(`Mission "${missionId}" not found`);
    }

    const dag = new MissionDAG(mission.dagJson as MissionDAGDef);
    const dbNodes = await this.missionModel.getNodes(missionId);

    // Initial node statuses
    const nodeStatuses: Record<string, NodeStatus> = {};
    for (const n of dbNodes) {
      nodeStatuses[n.nodeId] = n.status as NodeStatus;
    }

    // Check if resuming from checkpoint
    const checkpoint = await this.checkpointManager.getLatestCheckpoint(missionId);
    if (checkpoint?.nodeStatuses) {
      for (const [nId, st] of Object.entries(checkpoint.nodeStatuses)) {
        if (st === 'completed' || !nodeStatuses[nId] || nodeStatuses[nId] === 'running') {
          nodeStatuses[nId] = st === 'running' ? 'pending' : st;
        }
      }
    }
    const consumedApprovalIds = new Set<string>(checkpoint?.consumedApprovalIds || []);
    const committedToolResults: Record<string, any> = {
      ...checkpoint?.committedToolResults,
    };
    let totalCost = checkpoint?.cost || 0;
    let rounds = checkpoint?.rounds || 0;
    const accumulatedToolCalls: ReceiptToolCall[] = Object.entries(committedToolResults)
      .filter(([key, val]) => !key.startsWith('__nodeOutput_') && Boolean((val as any)?.toolCallId))
      .map(([, val]) => val as ReceiptToolCall);
    const tokenRollup = {
      completionTokens: checkpoint?.tokenRollup?.completionTokens || 0,
      promptTokens: checkpoint?.tokenRollup?.promptTokens || 0,
      totalTokens: checkpoint?.tokenRollup?.totalTokens || 0,
    };
    let modelDisclosure = { model: 'gemma4:e4b', provider: 'ollama' };

    // Update mission status in DB
    await this.missionModel.updateMission(missionId, { status: 'running' });

    const scheduler = new MissionScheduler(dag, nodeStatuses, {
      concurrencyCap: options?.concurrencyCap ?? 2,
    });

    let pausedNodeId: string | undefined;
    let pausedApprovalId: string | undefined;

    const result = await scheduler.runLoop(
      async (nodeId: string) => {
        rounds++;
        const nodeDef = dag.getNode(nodeId);

        // Check if node requires approval before execution
        if (nodeDef?.approvalRequired) {
          const approvalId = `approval_${missionId}_${nodeId}`;
          pausedApprovalId = approvalId;
          const payload = {
            message: `Approval required before executing node ${nodeId}`,
            nodeId,
          };

          await this.approvalManager.createApproval({
            id: approvalId,
            missionId,
            nodeId,
            payload,
          });

          await this.checkpointManager.saveCheckpoint(missionId, {
            committedToolResults,
            consumedApprovalIds: [...consumedApprovalIds],
            cost: totalCost,
            missionId,
            nodeStatuses: scheduler.getStatuses(),
            rounds,
            tokenRollup: { ...tokenRollup },
          });

          return { requiresApproval: true, status: 'paused' };
        }

        // Execute node
        const execRes = await context.executeNode(nodeId, committedToolResults);

        if (execRes.modelDisclosure) {
          modelDisclosure = execRes.modelDisclosure;
        }

        if (execRes.tokenUsage) {
          tokenRollup.completionTokens += execRes.tokenUsage.completionTokens;
          tokenRollup.promptTokens += execRes.tokenUsage.promptTokens;
          tokenRollup.totalTokens += execRes.tokenUsage.totalTokens;
        }

        if (execRes.cost) {
          totalCost += execRes.cost;
        }

        for (const id of execRes.consumedApprovalIds ?? []) {
          consumedApprovalIds.add(id);
        }

        if (execRes.toolCalls) {
          for (const tc of execRes.toolCalls) {
            accumulatedToolCalls.push(tc);
            committedToolResults[tc.toolCallId] = tc;
          }
        }

        if (execRes.output !== undefined) {
          committedToolResults[`__nodeOutput_${nodeId}`] = execRes.output;
        }

        // If node pauses for human approval (e.g. N6 approval step)
        if (execRes.requiresApproval || execRes.status === 'paused') {
          const approvalId = `approval_${missionId}_${nodeId}`;
          pausedApprovalId = approvalId;

          await this.approvalManager.createApproval({
            id: approvalId,
            missionId,
            nodeId,
            payload: execRes.approvalPayload || execRes.output || { nodeId },
          });

          await this.checkpointManager.saveCheckpoint(missionId, {
            committedToolResults,
            consumedApprovalIds: [...consumedApprovalIds],
            cost: totalCost,
            missionId,
            nodeStatuses: scheduler.getStatuses(),
            rounds,
            tokenRollup: { ...tokenRollup },
          });

          return { requiresApproval: true, status: 'paused' };
        }

        // Node completed - checkpoint after commit
        if (execRes.status === 'completed') {
          await this.missionModel.updateNode(missionId, nodeId, { status: 'completed' });
          await this.checkpointManager.saveCheckpoint(missionId, {
            committedToolResults,
            consumedApprovalIds: [...consumedApprovalIds],
            cost: totalCost,
            missionId,
            nodeStatuses: scheduler.getStatuses(),
            rounds,
            tokenRollup: { ...tokenRollup },
          });
        } else if (execRes.status === 'failed') {
          await this.missionModel.updateNode(missionId, nodeId, { status: 'failed' });
        }

        return execRes;
      },
      {
        onNodeStart: async (nodeId) => {
          await this.missionModel.updateNode(missionId, nodeId, { status: 'running' });
          await this.journalManager.appendEvent({
            eventType: 'node_status_change',
            missionId,
            payload: { nodeId, status: 'running' },
          });
        },
        onPause: async (nodeId) => {
          pausedNodeId = nodeId;
          await this.missionModel.updateMission(missionId, { status: 'paused' });
          await this.journalManager.appendEvent({
            eventType: 'node_status_change',
            missionId,
            payload: { nodeId, status: 'paused' },
          });
        },
      },
    );

    const finalStatus: MissionStatus = result.status;
    let finalReceipt: MissionReceipt | null = null;

    // Recorded-path reconciliation (v2.9 must-fix), against the DB rows: persist any
    // consumption this run recorded, then require checkpoint and mission_approvals to agree.
    const latestCheckpoint = await this.checkpointManager.getLatestCheckpoint(missionId);
    const checkpointIds = new Set(latestCheckpoint?.consumedApprovalIds ?? []);
    const localIds = [...consumedApprovalIds];
    if (localIds.length !== checkpointIds.size || localIds.some((id) => !checkpointIds.has(id))) {
      await this.checkpointManager.saveCheckpoint(missionId, {
        committedToolResults,
        consumedApprovalIds: localIds,
        cost: totalCost,
        missionId,
        nodeStatuses: result.nodeStatuses,
        rounds,
        tokenRollup: { ...tokenRollup },
      });
    }
    const returnedConsumedIds = await this.reconcileConsumedApprovals(missionId);

    if (finalStatus === 'completed') {
      // Build receipt
      let approvalStep: ReceiptApprovalStep | undefined;
      const approvals = await this.missionModel.getApprovals(missionId);
      const lastAppr = approvals.at(-1);
      if (lastAppr) {
        approvalStep = {
          consumedAt: lastAppr.consumedAt?.toISOString(),
          decidedAt: lastAppr.decidedAt?.toISOString(),
          decidedBy: lastAppr.decidedBy,
          decision: lastAppr.decision as any,
          nodeId: lastAppr.nodeId,
          shownPayloadHash: lastAppr.shownPayloadHash,
          toolId: lastAppr.toolId || undefined,
        };
      }

      finalReceipt = this.receiptManager.buildReceipt({
        approvalStep,
        costRollup: { currency: 'USD', totalCost },
        dag,
        missionId,
        modelDisclosure,
        nodeStatuses: result.nodeStatuses,
        tokenRollup,
        toolCalls: accumulatedToolCalls,
      });

      await this.receiptManager.saveReceipt(finalReceipt);
      await this.missionModel.updateMission(missionId, { status: 'completed' });
    } else if (finalStatus === 'failed') {
      await this.missionModel.updateMission(missionId, { status: 'failed' });
    }

    return {
      consumedApprovalIds: returnedConsumedIds,
      missionId,
      nodeStatuses: result.nodeStatuses,
      pausedApprovalId,
      pausedNodeId,
      receipt: finalReceipt,
      status: finalStatus,
    };
  }

  /**
   * Decide on a pending approval. If approved, consumes it atomically and marks approval consumed.
   * If rejected, marks mission as rejected, prevents dependent nodes from running.
   */
  async decideAndConsumeApproval(params: {
    approvalId: string;
    currentPayload?: any;
    decidedBy: string;
    decision: 'approved' | 'rejected';
    missionId: string;
  }) {
    // 1. Record decision
    const decidedAppr = await this.approvalManager.decideApproval(
      params.approvalId,
      params.decision,
      params.decidedBy,
    );

    if (params.decision === 'rejected') {
      // Mark mission rejected and create rejection receipt
      await this.missionModel.updateMission(params.missionId, { status: 'rejected' });
      await this.journalManager.appendEvent({
        eventType: 'approval_decision',
        missionId: params.missionId,
        payload: {
          approvalId: params.approvalId,
          decidedBy: params.decidedBy,
          decision: 'rejected',
        },
      });

      const mission = await this.missionModel.getMission(params.missionId);
      const dag = new MissionDAG(mission!.dagJson as MissionDAGDef);
      const dbNodes = await this.missionModel.getNodes(params.missionId);
      const nodeStatuses: Record<string, NodeStatus> = {};
      for (const n of dbNodes) nodeStatuses[n.nodeId] = n.status as NodeStatus;
      if (decidedAppr?.nodeId) {
        nodeStatuses[decidedAppr.nodeId] = 'failed';
      }

      const checkpoint = await this.checkpointManager.getLatestCheckpoint(params.missionId);
      const toolCalls = Object.entries(checkpoint?.committedToolResults || {})
        .filter(([key, val]) => !key.startsWith('__nodeOutput_') && Boolean((val as any)?.toolCallId))
        .map(([, val]) => val as ReceiptToolCall);

      const receipt = this.receiptManager.buildReceipt({
        approvalStep: {
          decidedAt: decidedAppr?.decidedAt?.toISOString() || new Date().toISOString(),
          decidedBy: params.decidedBy,
          decision: 'rejected',
          nodeId: decidedAppr?.nodeId || 'N6',
          shownPayloadHash: decidedAppr?.shownPayloadHash || '',
        },
        dag,
        missionId: params.missionId,
        modelDisclosure: { model: 'gemma4:e4b', provider: 'ollama' },
        nodeStatuses,
        toolCalls,
      });
      await this.receiptManager.saveReceipt(receipt);

      // Rejection consumes nothing: the DB and the checkpoint must agree on that too.
      await this.reconcileConsumedApprovals(params.missionId);

      return MissionDispositionManager.createStep('reject', {
        disposition: 'rejected',
        error: `Mission rejected by ${params.decidedBy} at node ${decidedAppr?.nodeId || 'N6'}`,
      });
    }

    // 2. Consume approval atomically (v2.9 must-fix)
    const consumedAppr = await this.approvalManager.consumeApproval(
      params.approvalId,
      params.currentPayload,
    );

    await this.journalManager.appendEvent({
      eventType: 'approval_decision',
      missionId: params.missionId,
      payload: {
        approvalId: params.approvalId,
        consumedAt: consumedAppr.consumedAt?.toISOString(),
        decidedBy: params.decidedBy,
        decision: 'approved',
        nodeId: consumedAppr.nodeId,
      },
    });

    // Mark the approval gate node completed in DB
    await this.missionModel.updateNode(params.missionId, consumedAppr.nodeId, {
      status: 'completed',
    });

    // 3. Update checkpoint with consumed approval
    const checkpoint = await this.checkpointManager.getLatestCheckpoint(params.missionId);
    const consumedApprovalIds = new Set<string>(checkpoint?.consumedApprovalIds || []);
    consumedApprovalIds.add(params.approvalId);

    if (checkpoint) {
      await this.checkpointManager.saveCheckpoint(params.missionId, {
        ...checkpoint,
        consumedApprovalIds: [...consumedApprovalIds],
        nodeStatuses: {
          ...checkpoint.nodeStatuses,
          [consumedAppr.nodeId]: 'completed',
        },
      });
    } else {
      await this.checkpointManager.saveCheckpoint(params.missionId, {
        committedToolResults: {},
        consumedApprovalIds: [...consumedApprovalIds],
        cost: 0,
        missionId: params.missionId,
        nodeStatuses: { [consumedAppr.nodeId]: 'completed' },
        rounds: 0,
      });
    }

    // Recorded-path reconciliation against the DB consumed rows before returning.
    await this.reconcileConsumedApprovals(params.missionId);

    return MissionDispositionManager.createStep('resume', {
      disposition: 'resumed',
      output: { approvalId: params.approvalId, nodeId: consumedAppr.nodeId, status: 'consumed' },
    });
  }

  /**
   * Recorded-path reconciliation against the database (v2.9 must-fix).
   * The consumed set recorded in the latest checkpoint must equal the approvals whose
   * `consumed_at` is set in `mission_approvals`. Throws on any mismatch, otherwise returns
   * the consumed approval ids as the database has them.
   */
  async reconcileConsumedApprovals(missionId: string): Promise<string[]> {
    const checkpoint = await this.checkpointManager.getLatestCheckpoint(missionId);
    const recorded = checkpoint?.consumedApprovalIds ?? [];
    const approvals = await this.missionModel.getApprovals(missionId);
    const dbConsumed = approvals.filter((a) => a.consumedAt).map((a) => a.id);
    MissionDispositionManager.reconcileRecordedPath(dbConsumed, recorded);
    return dbConsumed;
  }
}
