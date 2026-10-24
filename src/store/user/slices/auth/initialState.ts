import { type SSOProvider } from '@azzar/types';

import { type AzzarUser } from '@/types/user';

export interface UserAuthState {
  authProviders?: SSOProvider[];
  /**
   * Whether user registered with email/password (credential login)
   */
  hasPasswordAccount?: boolean;
  /** Whether the current local cache identity has been authoritatively selected. */
  isIdentityResolved?: boolean;
  isLoaded?: boolean;

  isLoadedAuthProviders?: boolean;

  isSignedIn?: boolean;
  oAuthSSOProviders?: string[];
  user?: AzzarUser;
}

export const initialAuthState: UserAuthState = {};
