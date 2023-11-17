import { isEventError } from '@fingerprintjs/fingerprintjs-pro-server-api';
import { NextApiRequest, NextApiResponse } from 'next';
import { fingerprintJsApiClient } from '../../../server/fingerprint-api';

export default async function getFingerprintEvent(req: NextApiRequest, res: NextApiResponse) {
  const { requestId } = req.query as { requestId: string };

  return await tryGetFingerprintEvent(res, requestId);
}

/**
 * It's possible the data about the specific event is not propagated to the Server API yet. This function retries for Not Found (404) requests.
 * */
async function tryGetFingerprintEvent(
  res: NextApiResponse,
  requestId: string,
  retryCount = 5,
  retryDelay: number = 3000,
) {
  try {
    const eventResponse = await fingerprintJsApiClient.getEvent(requestId);
    res.status(200).json(eventResponse);
  } catch (error) {
    console.error(error);

    if (retryCount === 1) {
      handleFinalRetry(res, error);
      return;
    }

    // Retry only Not Found (404) requests.
    if (error.status === 404) {
      setTimeout(() => tryGetFingerprintEvent(res, requestId, retryCount - 1, retryDelay), retryDelay);
    } else {
      handleOtherError(res, error);
    }
  }
}

function handleFinalRetry(res: NextApiResponse, error: any) {
  if (isEventError(error)) {
    res.statusMessage = `${error.error.code} - ${error.error.message}`;
    res.status(error.status).json({
      message: error.error.message,
      code: error.error.code,
    });
  } else {
    handleOtherError(res, error);
  }
}

function handleOtherError(res: NextApiResponse, error: any) {
  res.statusMessage = `Something went wrong ${error}`;
  res.status(500).end();
}
