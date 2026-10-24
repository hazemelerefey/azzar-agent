import FileLink from './FileLink';
import GoalTurn from './GoalTurn';
import ImageSearchRef from './ImageSearchRef';
import Link from './Link';
import AzzarAgents from './AzzarAgents';
import AzzarArtifact from './AzzarArtifact';
import AzzarThinking from './AzzarThinking';
import LocalFile from './LocalFile';
import LocalFileLink from './LocalFileLink';
import Mention from './Mention';
import ReferTopic from './ReferTopic';
import ScmEvent from './ScmEvent';
import Skill from './Skill';
import Task from './Task';
import Thinking from './Thinking';
import Tool from './Tool';
import { type MarkdownElement } from './type';
import UserFeedback from './UserFeedback';

export type { MarkdownElement } from './type';

export const markdownElements: MarkdownElement[] = [
  Thinking,
  AzzarArtifact,
  AzzarThinking,
  LocalFile,
  Mention,
  ReferTopic,
  Skill,
  Tool,
  Task,
  ScmEvent,
  GoalTurn,
  UserFeedback,
  ImageSearchRef,
  AzzarAgents,
  LocalFileLink,
  FileLink,
  Link,
];
