export const ACCEPTANCE_REVIEW_CLIENT_ID = 'azzar-review';

export const ACCEPTANCE_REVIEW_SCOPE = 'acceptance:review';

export const ACCEPTANCE_REVIEW_RESOURCE_PREFIX = 'urn:azzar:acceptance:';

export const ACCEPTANCE_REVIEW_TOKEN_TTL_SECONDS = 8 * 60 * 60;

const RESOURCE_PATTERN = /^urn:azzar:acceptance:([\w-]{1,64})$/;

export const acceptanceIdFromReviewResource = (resource: unknown): string | undefined => {
  if (typeof resource !== 'string') return undefined;
  return RESOURCE_PATTERN.exec(resource)?.[1];
};
