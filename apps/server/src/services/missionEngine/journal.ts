import { MissionModel } from '@/database/models/mission';

import { MissionReceiptManager } from './receipt';
import type { JournalEvent } from './types';

export class MissionJournalManager {
  private missionModel: MissionModel;

  constructor(missionModel?: MissionModel) {
    this.missionModel = missionModel || new MissionModel();
  }

  /**
   * Append an event to the append-only mission journal.
   */
  async appendEvent(event: JournalEvent) {
    return this.missionModel.appendJournal({
      eventType: event.eventType,
      missionId: event.missionId,
      // The journal is persisted and shown in the UI: secrets never enter it either.
      payloadJson: MissionReceiptManager.redactSecrets(event.payload),
      sourceEventId: event.sourceEventId,
    });
  }

  /**
   * Fetch all journal events for this mission in chronological order.
   */
  async getJournal(missionId: string) {
    const rawList = await this.missionModel.getJournal(missionId);
    return rawList.map((entry) => ({
      createdAt: entry.createdAt?.toISOString(),
      eventType: entry.eventType,
      id: entry.id,
      missionId: entry.missionId,
      payload: entry.payloadJson as Record<string, any> | undefined,
      sourceEventId: entry.sourceEventId,
    }));
  }

  /**
   * Post-run verify reports pass, fail, or inconclusive based on the event journal.
   */
  async verifyJournal(missionId: string): Promise<{
    issues: string[];
    status: 'pass' | 'fail' | 'inconclusive';
  }> {
    const events = await this.getJournal(missionId);
    const issues: string[] = [];

    if (events.length === 0) {
      return { issues: ['No journal events recorded'], status: 'inconclusive' };
    }

    const pendingToolCalls = new Map<string, any>();
    let hasModelBlock = false;
    let hasFailedNode = false;

    for (const evt of events) {
      if (evt.eventType === 'model_block') {
        hasModelBlock = true;
      } else if (evt.eventType === 'tool_call') {
        const callId = evt.payload?.toolCallId;
        if (callId) {
          pendingToolCalls.set(callId, evt);
        }
      } else if (evt.eventType === 'tool_result') {
        const callId = evt.payload?.toolCallId;
        if (callId) {
          if (!pendingToolCalls.has(callId)) {
            issues.push(`Tool result for "${callId}" without preceding tool call`);
          } else {
            pendingToolCalls.delete(callId);
          }
        }
      } else if (evt.eventType === 'node_status_change' && evt.payload?.status === 'failed') {
        hasFailedNode = true;
      }
    }

    if (pendingToolCalls.size > 0) {
      for (const callId of pendingToolCalls.keys()) {
        issues.push(`Unresolved tool call "${callId}"`);
      }
      return { issues, status: 'inconclusive' };
    }

    if (hasFailedNode) {
      issues.push('One or more nodes failed during execution');
      return { issues, status: 'fail' };
    }

    if (!hasModelBlock) {
      issues.push('No model block events were recorded');
      return { issues, status: 'fail' };
    }

    return { issues: [], status: 'pass' };
  }
}
