import { ChatErrorType } from '@azzar/types';
import { toast } from '@azzar/ui';
import { TRPCClientError } from '@trpc/client';
import { t } from 'i18next';

interface AZZARModelDeprecatedErrorData {
  modelType?: string;
  requestedModel?: string;
}

export const handleAZZARModelDeprecatedError = (error: unknown) => {
  if (!(error instanceof TRPCClientError) || error.message !== ChatErrorType.AZZARModelDeprecated)
    return;

  const requestedModel = (error.data?.errorData as AZZARModelDeprecatedErrorData | undefined)
    ?.requestedModel;

  toast.error(
    t('response.AZZARModelDeprecated', {
      model: requestedModel ?? '-',
      ns: 'error',
    }),
  );
};
