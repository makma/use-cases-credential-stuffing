import { NextResponse } from 'next/server';
import { getAndValidateFingerprintResult } from '../../../../server/checks';
import { SessionDbModel, UserDbModel } from '../database';
import { ACCOUNT_SHARING_COPY } from '../../const';

export type IsLoggedInPayload = {
  requestId: string;
  username: string;
};

export type IsLoggedInResponse = {
  message: string;
  severity: 'success' | 'error';
  otherDevice?: {
    deviceName: string;
    deviceLocation: string;
  };
};

export async function POST(req: Request): Promise<NextResponse<IsLoggedInResponse>> {
  const { username, requestId } = (await req.json()) as IsLoggedInPayload;

  // Get the full Identification result from Fingerprint Server API and validate its authenticity
  const fingerprintResult = await getAndValidateFingerprintResult({
    requestId,
    req,
    // We use the built-in React SDK caching to get user to the homepage faster, so we disable the freshness check
    // Alternatively, we could keep the check and disable caching with useVisitorData({ ignoreCache: true })
    options: { disableFreshnessCheck: true },
  });
  if (!fingerprintResult.okay) {
    return NextResponse.json({ message: fingerprintResult.error, severity: 'error' }, { status: 403 });
  }

  // Get visitorId from the Server API Identification event
  const visitorId = fingerprintResult.data.products.identification?.data?.visitorId;
  if (!visitorId) {
    return NextResponse.json({ message: ACCOUNT_SHARING_COPY.visitorIdNotFound, severity: 'error' }, { status: 403 });
  }

  // Check if the user exists
  const user = await UserDbModel.findOne({ where: { username } });
  if (!user) {
    return NextResponse.json({ message: ACCOUNT_SHARING_COPY.userNotFound, severity: 'error' }, { status: 403 });
  }

  // Check if the user is logged in with this device
  const isLoggedIn = Boolean(await SessionDbModel.findOne({ where: { username, visitorId } }));
  // If not, return error
  if (isLoggedIn === false) {
    const otherDevice = await SessionDbModel.findOne({ where: { username } });
    return NextResponse.json(
      {
        message: 'You have been logged out',
        severity: 'error',
        otherDevice: otherDevice
          ? {
              deviceName: otherDevice.deviceName,
              deviceLocation: otherDevice.deviceLocation,
            }
          : undefined,
      },
      { status: 401 },
    );
  }

  // If yes, return success
  return NextResponse.json({ message: ACCOUNT_SHARING_COPY.loginSuccess(username), severity: 'success' });
}
