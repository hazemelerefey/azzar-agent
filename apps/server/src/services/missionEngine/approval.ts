import { createHash } from 'node:crypto';

import { MissionModel } from '@/database/models/mission';

export class MissionApprovalManager {
  private missionModel: MissionModel;

  constructor(missionModel?: MissionModel) {
    this.missionModel = missionModel || new MissionModel();
  }

  /**
   * Deterministically compute SHA-256 hash of shown payload.
   */
  static hashPayload(payload: any): string {
    const serialized = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return createHash('sha256').update(serialized).digest('hex');
  }

  /**
   * Create a pending approval gate before pausing.
   */
  async createApproval(params: {
    id: string;
    missionId: string;
    nodeId: string;
    payload: any;
    toolId?: string;
  }) {
    const shownPayloadHash = MissionApprovalManager.hashPayload(params.payload);
    const serializedPayload =
      typeof params.payload === 'string' ? params.payload : JSON.stringify(params.payload);

    return this.missionModel.createApproval({
      id: params.id,
      missionId: params.missionId,
      nodeId: params.nodeId,
      shownPayload: serializedPayload,
      shownPayloadHash,
      toolId: params.toolId,
    });
  }

  /**
   * Record human decision (approved or rejected).
   */
  async decideApproval(approvalId: string, decision: 'approved' | 'rejected', decidedBy: string) {
    return this.missionModel.decideApproval(approvalId, decision, decidedBy);
  }

  /**
   * Consume an approved approval exactly once.
   * Throws if:
   * - Already consumed (second use)
   * - Not approved (e.g. pending or rejected)
   * - Payload has changed / hash mismatch
   */
  async consumeApproval(approvalId: string, currentPayload?: any) {
    const existing = await this.missionModel.getApproval(approvalId);
    if (!existing) {
      throw new Error(`Approval "${approvalId}" not found`);
    }

    if (existing.consumedAt) {
      throw new Error(`Approval "${approvalId}" already consumed at ${existing.consumedAt}`);
    }

    if (existing.decision !== 'approved') {
      throw new Error(
        `Approval "${approvalId}" cannot be consumed: decision is "${existing.decision}", expected "approved"`,
      );
    }

    if (currentPayload !== undefined) {
      const currentHash = MissionApprovalManager.hashPayload(currentPayload);
      if (currentHash !== existing.shownPayloadHash) {
        throw new Error(
          `Approval "${approvalId}" invalidation: payload changed after approval (hash mismatch: expected ${existing.shownPayloadHash}, got ${currentHash})`,
        );
      }
    }

    return this.missionModel.consumeApproval(approvalId);
  }

  async getApproval(approvalId: string) {
    return this.missionModel.getApproval(approvalId);
  }
}
