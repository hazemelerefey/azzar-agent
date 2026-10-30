export type MissionStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'rejected';
export type NodeStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

export interface MissionNodeDef {
  allowedToolIds?: string[];
  approvalRequired?: boolean;
  assignee: string;
  dependsOn: string[];
  expectedOutputSchema?: Record<string, any>;
  id: string;
  title?: string;
}

export interface MissionDAGDef {
  departmentId?: string;
  id: string;
  mode?: string;
  nodes: MissionNodeDef[];
  title: string;
}

export type StepDisposition = 'resumed' | 'failed' | 'rejected';

export interface MissionStepResult {
  disposition?: StepDisposition;
  error?: string;
  kind:
    | 'node_execution'
    | 'checkpoint'
    | 'approval_request'
    | 'approval_consumed'
    | 'resume'
    | 'complete'
    | 'fail'
    | 'reject';
  nodeId?: string;
  output?: any;
}

export interface CheckpointSnapshot {
  committedToolResults: Record<
    string,
    { input: any; output: any; sources?: string[]; toolCallId: string }
  >;
  consumedApprovalIds: string[];
  cost: number;
  missionId: string;
  nodeStatuses: Record<string, NodeStatus>;
  rounds: number;
  tokenRollup?: {
    completionTokens: number;
    promptTokens: number;
    totalTokens: number;
  };
}

export interface JournalEvent {
  createdAt?: string;
  eventType:
    | 'model_block'
    | 'tool_call'
    | 'tool_result'
    | 'context_rewrite'
    | 'node_status_change'
    | 'approval_decision';
  id?: string;
  missionId: string;
  payload: Record<string, any>;
  sourceEventId?: string;
}

export interface ReceiptToolCall {
  input: any;
  output: any;
  sources?: string[];
  toolCallId: string;
  toolId: string;
}

export interface ReceiptApprovalStep {
  consumedAt?: string | null;
  decidedAt?: string | null;
  decidedBy?: string | null;
  decision: 'approved' | 'rejected' | 'pending';
  nodeId: string;
  shownPayloadHash: string;
  toolId?: string;
}

export interface MissionReceipt {
  approvalStep?: ReceiptApprovalStep;
  assignees: Record<string, string>;
  costRollup: {
    currency: string;
    totalCost: number;
  };
  dagTopology: {
    edges: Array<{ from: string; to: string }>;
    nodes: string[];
  };
  missionId: string;
  modelDisclosure: {
    model: string;
    provider: string;
  };
  nodeStatuses: Record<string, NodeStatus>;
  tokenRollup: {
    completionTokens: number;
    promptTokens: number;
    totalTokens: number;
  };
  toolCalls: ReceiptToolCall[];
}
