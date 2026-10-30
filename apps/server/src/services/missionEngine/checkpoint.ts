import { MissionModel } from '@azzar/database';

import type { CheckpointSnapshot } from './types';

export class MissionCheckpointManager {
  private missionModel: MissionModel;

  constructor(missionModel?: MissionModel) {
    this.missionModel = missionModel || new MissionModel();
  }

  /**
   * Save a checkpoint snapshot after node commit or before tap tool.
   */
  async saveCheckpoint(missionId: string, snapshot: CheckpointSnapshot) {
    return this.missionModel.saveCheckpoint({
      missionId,
      snapshotJson: snapshot,
    });
  }

  /**
   * Load the latest checkpoint for this mission.
   */
  async getLatestCheckpoint(missionId: string): Promise<CheckpointSnapshot | null> {
    const raw = await this.missionModel.getLatestCheckpoint(missionId);
    if (!raw || !raw.snapshotJson) {
      return null;
    }
    return raw.snapshotJson as CheckpointSnapshot;
  }
}
