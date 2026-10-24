import { type CustomSessionGroup, type AzzarSessionGroups } from '@/types/session';

export interface SessionGroupState {
  customSessionGroups: CustomSessionGroup[];
  sessionGroupRenamingId: string | null;
  sessionGroups: AzzarSessionGroups;
  /**
   * @title Group ID being updated
   * @description Used to display loading state when group is being updated
   */
  sessionGroupUpdatingId: string | null;
}

export const initSessionGroupState: SessionGroupState = {
  customSessionGroups: [],
  sessionGroupRenamingId: null,
  sessionGroupUpdatingId: null,
  sessionGroups: [],
};
