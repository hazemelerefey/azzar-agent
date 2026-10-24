import { type TopicExportMode } from '@azzar/types';

export interface BaseExportOptions {
  includeTool: boolean;
  withSystemRole: boolean;
}

export interface FieldType extends BaseExportOptions {
  exportMode: TopicExportMode;
}
