import { lambdaClient } from '@/libs/trpc/client';

class MissionService {
  activateDepartment = async (params: {
    context?: string;
    customName?: { ar: string; en: string };
    instructions?: string;
    templateId: string;
    tone?: string;
  }) => {
    return lambdaClient.mission.activateDepartment.mutate(params);
  };

  assignAgent = async (params: {
    departmentId?: string;
    projectId?: string;
    templateId: string;
  }) => {
    return lambdaClient.mission.assignAgent.mutate(params);
  };

  cancel = async (missionId: string) => {
    return lambdaClient.mission.cancel.mutate({ missionId });
  };

  createAndRun = async (params: {
    agentId?: string;
    departmentId?: string;
    goal: string;
    managerId?: string;
    mode?: 'company' | 'individual';
    modelId?: string;
    projectId?: string | null;
    scriptId?: string;
  }) => {
    return lambdaClient.mission.createAndRun.mutate(params);
  };

  createProject = async (params: {
    context?: string;
    departmentId?: string | null;
    description?: string;
    id?: string;
    name: string;
    visibility?: 'private' | 'shared';
  }) => {
    return lambdaClient.mission.createProject.mutate(params);
  };

  deactivateDepartment = async (templateId: string) => {
    return lambdaClient.mission.deactivateDepartment.mutate({ templateId });
  };

  decideApproval = async (params: {
    approvalId: string;
    decidedBy?: string;
    decision: 'approved' | 'rejected';
    missionId: string;
  }) => {
    return lambdaClient.mission.decideApproval.mutate(params);
  };

  deleteProject = async (id: string) => {
    return lambdaClient.mission.deleteProject.mutate({ id });
  };

  getById = async (id: string) => {
    return lambdaClient.mission.getById.query({ id });
  };

  getCaoTree = async (mode: 'company' | 'individual' = 'company') => {
    return lambdaClient.mission.getCaoTree.query({ mode });
  };

  getWorkbenchState = async () => {
    return lambdaClient.mission.getWorkbenchState.query();
  };

  installAgent = async (params: {
    departmentId?: string;
    projectId?: string;
    templateId: string;
  }) => {
    return lambdaClient.mission.installAgent.mutate(params);
  };

  list = async (limit = 30) => {
    return lambdaClient.mission.list.query({ limit });
  };

  resume = async (missionId: string) => {
    return lambdaClient.mission.resume.mutate({ missionId });
  };

  unassignAgent = async (params: {
    departmentId?: string;
    projectId?: string;
    templateId: string;
  }) => {
    return lambdaClient.mission.unassignAgent.mutate(params);
  };

  uninstallAgent = async (templateId: string) => {
    return lambdaClient.mission.uninstallAgent.mutate({ templateId });
  };

  updateDepartment = async (params: {
    context?: string;
    customName?: { ar: string; en: string };
    instructions?: string;
    rules?: any;
    sources?: Array<{
      content?: string;
      id: string;
      kind: 'file' | 'link' | 'note';
      name: string;
      shareable: boolean;
    }>;
    templateId: string;
    tone?: string;
  }) => {
    return lambdaClient.mission.updateDepartment.mutate(params);
  };

  updateProject = async (params: {
    context?: string;
    description?: string;
    id: string;
    inherit?: { policies: boolean; sources: boolean; tone: boolean };
    name?: string;
    sources?: Array<{
      content?: string;
      id: string;
      kind: 'file' | 'link' | 'note';
      name: string;
      shareable: boolean;
    }>;
    visibility?: 'private' | 'shared';
  }) => {
    return lambdaClient.mission.updateProject.mutate(params);
  };
}

export const missionService = new MissionService();
