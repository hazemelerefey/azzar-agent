import type { ErrorResponse, ErrorType } from '@azzar/types';

import { getErrorCodeSpec } from '../errors';
import type { IAzzarAgentRuntimeErrorType } from '../types';

const getStatus = (errorType: IAzzarAgentRuntimeErrorType | ErrorType) => {
  // 1. Authoritative source: the unified spec table.
  const spec = getErrorCodeSpec(errorType as IAzzarAgentRuntimeErrorType);
  if (spec) return spec.httpStatus;

  // 2. Fallback: legacy `Invalid*APIKey` shorthand codes (InvalidAccessCode,
  //    InvalidAzureAPIKey, InvalidOpenAIAPIKey, …) that are still in use.
  if (errorType.toString().includes('Invalid')) return 401;

  // 3. Bare numeric ChatErrorType values (BadRequest=400, Unauthorized=401, …).
  return errorType as number;
};

export const createErrorResponse = (errorType: IAzzarAgentRuntimeErrorType, body?: any) => {
  const statusCode = getStatus(errorType);

  const data: ErrorResponse = { body, errorType };

  if (typeof statusCode !== 'number' || statusCode < 200 || statusCode > 599) {
    console.error(
      `current StatusCode: \`${statusCode}\` .`,
      'Please go to `./utils/errorResponse.ts` to defined the statusCode.',
    );
  }

  return new Response(JSON.stringify(data), { status: statusCode });
};
