import type { ActionError } from '../domain/store';
import type { AzzarKey } from './i18n';

export const errorKey = (reason: ActionError): AzzarKey => {
  switch (reason) {
    case 'invalid-input': {
      return 'errInvalid';
    }
    case 'agent-not-installed': {
      return 'errNotInstalled';
    }
    case 'agent-not-assigned': {
      return 'errNotAssigned';
    }
    case 'department-inactive': {
      return 'errInactive';
    }
    case 'agent-paused': {
      return 'errPaused';
    }
    case 'coming-soon': {
      return 'errComingSoon';
    }
    default: {
      return 'errGeneric';
    }
  }
};
