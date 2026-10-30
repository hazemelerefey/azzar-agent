import { MissionModel } from '@/database/models/mission';

import type { MissionDAG } from './dag';
import type { MissionReceipt, NodeStatus, ReceiptApprovalStep, ReceiptToolCall } from './types';

export class MissionReceiptManager {
  private missionModel: MissionModel;

  constructor(missionModel?: MissionModel) {
    this.missionModel = missionModel || new MissionModel();
  }

  /**
   * Redact sensitive secrets from payloads (tokens, keys, bearer headers).
   */
  static redactSecrets(obj: any): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => MissionReceiptManager.redactSecrets(item));
    }

    const redacted: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      const lower = key.toLowerCase();
      if (
        lower.includes('secret') ||
        lower.includes('token') ||
        lower.includes('password') ||
        lower.includes('authorization') ||
        lower.includes('apikey') ||
        lower.includes('api_key')
      ) {
        redacted[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        redacted[key] = MissionReceiptManager.redactSecrets(value);
      } else {
        redacted[key] = value;
      }
    }
    return redacted;
  }

  /**
   * Build the complete receipt record for a mission.
   */
  buildReceipt(params: {
    approvalStep?: ReceiptApprovalStep;
    costRollup?: { currency: string; totalCost: number };
    dag: MissionDAG;
    missionId: string;
    modelDisclosure: { model: string; provider: string };
    nodeStatuses: Record<string, NodeStatus>;
    tokenRollup?: { completionTokens: number; promptTokens: number; totalTokens: number };
    toolCalls: ReceiptToolCall[];
  }): MissionReceipt {
    const assignees: Record<string, string> = {};
    for (const node of params.dag.nodes) {
      assignees[node.id] = node.assignee;
    }

    const receipt: MissionReceipt = {
      approvalStep: params.approvalStep
        ? {
            consumedAt: params.approvalStep.consumedAt,
            decidedAt: params.approvalStep.decidedAt,
            decidedBy: params.approvalStep.decidedBy,
            decision: params.approvalStep.decision,
            nodeId: params.approvalStep.nodeId,
            shownPayloadHash: params.approvalStep.shownPayloadHash,
            toolId: params.approvalStep.toolId,
          }
        : undefined,
      assignees,
      costRollup: params.costRollup || { currency: 'USD', totalCost: 0 },
      dagTopology: {
        edges: params.dag.getEdges(),
        nodes: params.dag.nodes.map((n) => n.id),
      },
      missionId: params.missionId,
      modelDisclosure: params.modelDisclosure,
      nodeStatuses: { ...params.nodeStatuses },
      tokenRollup: params.tokenRollup || {
        completionTokens: 0,
        promptTokens: 0,
        totalTokens: 0,
      },
      toolCalls: params.toolCalls.map((tc) => ({
        input: MissionReceiptManager.redactSecrets(tc.input),
        output: MissionReceiptManager.redactSecrets(tc.output),
        sources: tc.sources || [],
        toolCallId: tc.toolCallId,
        toolId: tc.toolId,
      })),
    };

    return receipt;
  }

  /**
   * Save receipt to the database.
   */
  async saveReceipt(receipt: MissionReceipt) {
    return this.missionModel.saveReceipt({
      missionId: receipt.missionId,
      receiptJson: receipt,
    });
  }

  /**
   * Retrieve receipt from the database.
   */
  async getReceipt(missionId: string): Promise<MissionReceipt | null> {
    const raw = await this.missionModel.getReceipt(missionId);
    if (!raw || !raw.receiptJson) {
      return null;
    }
    return raw.receiptJson as MissionReceipt;
  }
}
