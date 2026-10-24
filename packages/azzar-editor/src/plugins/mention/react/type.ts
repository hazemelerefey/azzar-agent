import type { MentionNode } from '../node/MentionNode';

export interface ReactMentionPluginProps {
  className?: string;
  markdownWriter?: (file: MentionNode) => string;
  theme?: {
    mention?: string;
  };
}
