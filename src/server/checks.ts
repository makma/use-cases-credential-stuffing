import {
  EventResponse,
  FingerprintJsServerApiClient,
  Region,
  isEventError,
} from '@fingerprintjs/fingerprintjs-pro-server-api';
import { CheckResult, checkResultType } from './checkResult';
import { NextApiRequest, NextApiResponse } from 'next';
import { ValidationDataResult } from '../shared/types';
import { decryptSealedResult } from './decryptSealedResult';
import { env } from '../env';
import { getServerRegion } from './fingerprint-server-api';
import { IS_DEVELOPMENT } from '../envShared';

export const IPv4_REGEX = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.){3}(25[0-5]|(2[0-4]|1\d|[1-9]|)\d)$/;
export const ALLOWED_REQUEST_TIMESTAMP_DIFF_MS = 4000;

// Demo origins.
// It is recommended to use production origins instead.
export const OUR_ORIGINS = [
  'https://fingerprinthub.com',
  'https://demo.fingerprint.com',
  'https://localhost:3000',
  'http://localhost:3000',
  'https://staging.fingerprinthub.com',
];

export type Severity = 'success' | 'warning' | 'error';

// Validates format of visitorId and requestId.
export const isVisitorIdFormatValid = (visitorId: string) => /^[a-zA-Z0-9]{20}$/.test(visitorId);
export const isRequestIdFormatValid = (requestId: string) => /^\d{13}\.[a-zA-Z0-9]{6}$/.test(requestId);
export function areVisitorIdAndRequestIdValid(visitorId: string, requestId: string) {
  return isRequestIdFormatValid(requestId) && isVisitorIdFormatValid(visitorId);
}

/**
 * @deprecated Use getAndValidateFingerprintResult() for new use cases
 */
export type RequestCallback = (req: NextApiRequest, res: NextApiResponse, visitorData: EventResponse) => void;

/**
 * @deprecated Use getAndValidateFingerprintResult() for new use cases
 */
export type RuleCheck = (
  eventResponse: EventResponse,
  req: NextApiRequest,
  ...args: any
) => (CheckResult | undefined) | Promise<CheckResult | undefined>;

/**
 * @deprecated Use getAndValidateFingerprintResult() for new use cases
 */
export const checkFreshIdentificationRequest: RuleCheck = (eventResponse) => {
  const timestamp = eventResponse?.products?.identification?.data?.timestamp;
  if (!eventResponse || !timestamp) {
    return new CheckResult(
      'Hmmm, sneaky trying to forge information from the client-side, no luck this time, no sensitive action was performed.',
      'error',
      checkResultType.RequestIdMismatch,
    );
  }

  const requestTimestampDiff = new Date().getTime() - timestamp;

  if (requestTimestampDiff > ALLOWED_REQUEST_TIMESTAMP_DIFF_MS) {
    return new CheckResult('Old requestId detected. Action ignored and logged.', 'error', checkResultType.OldTimestamp);
  }

  return undefined;
};

/**
 * @deprecated Use getAndValidateFingerprintResult() for new use cases
 */
export const checkConfidenceScore: RuleCheck = (eventResponse) => {
  const confidenceScore = eventResponse?.products?.identification?.data?.confidence.score;
  if (!confidenceScore || confidenceScore < env.MIN_CONFIDENCE_SCORE) {
    return new CheckResult(
      "Low confidence score, we'd rather verify you with the second factor,",
      'error',
      checkResultType.LowConfidenceScore,
    );
  }

  return undefined;
};

/**
 * @deprecated Use getAndValidateFingerprintResult() for new use cases
 */
export const checkIpAddressIntegrity: RuleCheck = (eventResponse, request) => {
  if (!visitIpMatchesRequestIp(eventResponse.products?.identification?.data?.ip, request)) {
    return new CheckResult(
      'IP mismatch. An attacker might have tried to phish the victim.',
      'error',
      checkResultType.IpMismatch,
    );
  }

  return undefined;
};

/**
 * @deprecated Use getAndValidateFingerprintResult() for new use cases
 */
export const checkOriginsIntegrity: RuleCheck = (eventResponse, request) => {
  if (!originIsAllowed(eventResponse.products?.identification?.data?.url, request)) {
    return new CheckResult(
      'Origin mismatch. An attacker might have tried to phish the victim.',
      'error',
      checkResultType.ForeignOrigin,
    );
  }

  return undefined;
};

const isRequest = (request: Request | NextApiRequest): request is Request => {
  return typeof request.headers.get == 'function';
};

const getHeader = (request: Request | NextApiRequest, header: string) => {
  return isRequest(request) ? request.headers.get(header) : request.headers[header];
};

export function visitIpMatchesRequestIp(visitIp = '', request: NextApiRequest | Request) {
  // This check is skipped on purpose in the Stackblitz and localhost environments.
  if (IS_DEVELOPMENT) {
    return true;
  }

  /**
   * Parsing the user IP from `x-forwarded-for` can be unreliable as any proxy between your server
   * and the visitor can overwrite or spoof the header. In most cases, using the right-most external
   * IP is more appropriate than the left-most one as is demonstrated here.
   * You might need to adjust or skip this check depending on your use case and server configuration.
   * You can learn more at:
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For
   * https://adam-p.ca/blog/2022/03/x-forwarded-for/.
   */
  const xForwardedFor = getHeader(request, 'x-forwarded-for');
  const requestIp = Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor?.split(',')[0] ?? '';

  // IPv6 addresses are not supported yet, skip the check
  if (!IPv4_REGEX.test(requestIp)) {
    return true;
  }

  return requestIp === visitIp;
}

export function originIsAllowed(url = '', request: NextApiRequest | Request) {
  // This check is skipped on purpose in the Stackblitz and localhost environments.
  if (IS_DEVELOPMENT) {
    return true;
  }

  const headerOrigin = getHeader(request, 'origin');
  const visitDataOrigin = new URL(url).origin;
  return (
    visitDataOrigin === headerOrigin && OUR_ORIGINS.includes(visitDataOrigin) && OUR_ORIGINS.includes(headerOrigin)
  );
}

/**
 * Retrieves the full Identification event validates its authenticity.
 * - If your account has [Sealed Results](https://dev.fingerprint.com/docs/sealed-client-results) turned on, you can pass
 *   the `sealedResult` parameter to the function and it will decrypt the result locally using your decryption key
 *   instead of calling Server API (this is generally faster and simpler than Server API).
 * - If `sealedResult` is not provided or something goes wrong during decryption, the function falls back to using Server API.
 */

type GetFingerprintResultArgs = {
  requestId: string;
  req: NextApiRequest | Request;
  sealedResult?: string;
  serverApiKey?: string;
  region?: Region;
  options?: {
    blockTor: boolean;
    blockBots: boolean;
  };
};

export const getAndValidateFingerprintResult = async ({
  requestId,
  req,
  sealedResult,
  serverApiKey: apiKey = env.SERVER_API_KEY,
  region = getServerRegion(env.NEXT_PUBLIC_REGION),
  options,
}: GetFingerprintResultArgs): Promise<ValidationDataResult<EventResponse>> => {
  let identificationEvent: EventResponse | undefined;

  /**
   * If a sealed result was provided, try to decrypt it.
   * Fall back to Server API if sealed result is not available.
   * If your account doesn't have Sealed Results turned on you can ignore/skip this step in your implementation.
   **/
  if (sealedResult) {
    console.log(`Sealed result provided, trying to decrypt...`, sealedResult);
    try {
      identificationEvent = await decryptSealedResult(sealedResult);
      if (identificationEvent.products?.identification?.data?.requestId !== requestId) {
        return {
          okay: false,
          error: 'Sealed result request ID does not match provided request ID, potential spoofing attack',
        };
      }
    } catch (error) {
      console.error(
        `Decrypting sealed result failed on ${error}. Falling back to Server API to get the identification event`,
      );
    }
  }

  console.log('unsealed result', JSON.stringify(identificationEvent, null, 2));

  /**
   * If `sealedResult` was not provided or unsealing failed, use Server API to get the identification event.
   * The Server API must contain information about this specific identification request.
   * If not, the request might have been tampered with and we don't trust this identification attempt.
   * The Server API also allows you to access all available [Smart Signals](https://dev.fingerprint.com/docs/smart-signals-overview)
   */
  if (!identificationEvent) {
    try {
      const client = new FingerprintJsServerApiClient({ region, apiKey });
      identificationEvent = await client.getEvent(requestId);
    } catch (error) {
      console.error(error);
      // Throw a specific error if the request ID is not found
      if (isEventError(error) && error.status === 404) {
        return { okay: false, error: 'Request ID not found, potential spoofing attack.' };
      }
      return { okay: false, error: String(error) };
    }
  }

  // Identification event must contain identification data
  const identification = identificationEvent.products?.identification?.data;
  if (!identification) {
    return { okay: false, error: 'Identification data not found, potential spoofing attack.' };
  }

  // The client request must come from the same IP address as the identification request.
  if (!visitIpMatchesRequestIp(identification?.ip, req)) {
    return { okay: false, error: 'Identification IP does not match request IP, potential spoofing attack.' };
  }

  /**
   * The client request must come from an expected origin (usually your website)
   * and its origin must match the identification request origin
   */
  if (!originIsAllowed(identification.url, req)) {
    return { okay: false, error: 'Visit origin does not match request origin, potential spoofing attack.' };
  }

  /**
   * An attacker might have acquired a valid requestId and visitorId via phishing.
   * It's recommended to check freshness of the identification request to prevent replay attacks.
   */
  if (Date.now() - Number(new Date(identification.time)) > ALLOWED_REQUEST_TIMESTAMP_DIFF_MS) {
    return { okay: false, error: 'Old identification request, potential replay attack.' };
  }

  /**
   * You can prevent Tor network users from performing sensitive actions in your application.
   */
  if (options?.blockTor && identificationEvent.products?.tor?.data?.result === true) {
    return { okay: false, error: 'Tor network detected, please use a regular browser instead.' };
  }

  /**
   * You can prevent bots from performing sensitive actions in your application.
   */
  if (options?.blockBots && identificationEvent.products?.botd?.data?.bot?.result === 'bad') {
    return { okay: false, error: '🤖 Malicious bot detected, the attempted action was denied.' };
  }

  /**
   * The Confidence Score reflects the system's degree of certainty that the visitor identifier is correct.
   * If it's lower than the certain threshold we recommend using an additional way of verification, e.g. 2FA or email.
   * This is context-sensitive and less reliable than the binary checks above, that's why it is checked last.
   * More info: https://dev.fingerprint.com/docs/understanding-your-confidence-score
   */
  if (identification.confidence.score < env.MIN_CONFIDENCE_SCORE) {
    return { okay: false, error: 'Identification confidence score too low, potential spoofing attack.' };
  }

  // All checks passed, we can trust this identification event
  return { okay: true, data: identificationEvent };
};
