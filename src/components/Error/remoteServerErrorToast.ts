import type { RemoteServerNetworkErrorType } from '@azzar/types';
import { toast } from '@azzar/ui';
import { t } from 'i18next';

export const remoteServerErrorToast = (errorType: RemoteServerNetworkErrorType) => {
  toast.error({
    id: `remote-server-network-error-${errorType}`,
    title: t(`response.${errorType}`, { ns: 'error' }),
  });
};
