import { lambdaClient } from '@/libs/trpc/client';

class MissionService {
  cancel = async (missionId: string) => {
    return lambdaClient.mission.cancel.mutate({ missionId });
  };

  createAndRun = async (params: {
    departmentId?: string;
    goal: string;
    mode?: 'company' | 'individual';
    modelId?: string;
  }) => {
    return lambdaClient.mission.createAndRun.mutate(params);
  };

  decideApproval = async (params: {
    approvalId: string;
    decidedBy?: string;
    decision: 'approved' | 'rejected';
    missionId: string;
  }) => {
    return lambdaClient.mission.decideApproval.mutate(params);
  };

  getById = async (id: string) => {
    return lambdaClient.mission.getById.query({ id });
  };

  list = async (limit = 30) => {
    return lambdaClient.mission.list.query({ limit });
  };

  resume = async (missionId: string) => {
    return lambdaClient.mission.resume.mutate({ missionId });
  };
}

export const missionService = new MissionService();
