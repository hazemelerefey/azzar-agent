'use client';

import { getGoalCommand } from '@azzar/shared-tool-ui/goal-command';
import {
  createRunCommandInspector,
  GoalCommandInspector,
} from '@azzar/shared-tool-ui/inspectors';
import type { BuiltinInspectorProps } from '@azzar/types';
import { memo } from 'react';

import { ClaudeCodeApiName } from '../../types';

const RunCommandInspector = createRunCommandInspector(ClaudeCodeApiName.Bash);

interface BashArgs {
  command: string;
  description?: string;
}

/**
 * `/goal` reaches AZZAR from a CC run as `lh goal create` / `lh goal plan`
 * shell calls, so those steps read as goal progress instead of raw commands.
 */
export const BashInspector = memo<BuiltinInspectorProps<BashArgs>>((props) => {
  const goalCommand = getGoalCommand(props.args?.command || props.partialArgs?.command);
  if (goalCommand) return <GoalCommandInspector {...props} goalCommand={goalCommand} />;

  return <RunCommandInspector {...props} />;
});

BashInspector.displayName = 'ClaudeCodeBashInspector';
