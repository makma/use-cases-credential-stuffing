import { UserCartItemDbModel, UserSearchHistoryDbModel } from '../../../personalization/api/database';
import { LoanRequestDbModel } from '../../../loan-risk/api/request-loan/database';
import { CouponClaimDbModel } from '../../../coupon-fraud/api/claim/database';
import { Severity, getAndValidateFingerprintResult } from '../../../../server/checks';
import { LoginAttemptDbModel } from '../../../credential-stuffing/api/authenticate/database';
import { ArticleViewDbModel } from '../../../paywall/api/database';
import { SmsVerificationDatabaseModel } from '../../../sms-pumping/api/database';
import { syncFirewallRuleset } from '../../../bot-firewall/api/block-ip/cloudflareApiHelper';
import { deleteBlockedIp } from '../../../bot-firewall/api/get-blocked-ips/blockedIpsDatabase';
import { PaymentAttemptDbModel } from '../../../payment-fraud/api/place-order/database';
import { NextRequest, NextResponse } from 'next/server';
import { SessionDbModel, UserDbModel } from '../../../account-sharing/api/database';

export type ResetResponse = {
  message: string;
  severity?: Severity;
  result?: ResetResult;
};

export type ResetRequest = {
  requestId: string;
};

export async function POST(req: NextRequest): Promise<NextResponse<ResetResponse>> {
  const { requestId } = (await req.json()) as ResetRequest;

  // Get the full Identification result from Fingerprint Server API and validate its authenticity
  const fingerprintResult = await getAndValidateFingerprintResult({
    requestId,
    req,
    options: { minConfidenceScore: 0.3 },
  });
  if (!fingerprintResult.okay) {
    return NextResponse.json({ severity: 'error', message: fingerprintResult.error }, { status: 403 });
  }

  const { visitorId, ip } = fingerprintResult.data.products.identification?.data ?? {};
  if (!visitorId) {
    return NextResponse.json({ severity: 'error', message: 'Visitor ID not found.' }, { status: 403 });
  }

  const deleteResult = await deleteVisitorData(visitorId, ip ?? '');

  return NextResponse.json({
    message: 'Visitor data deleted successfully.',
    severity: 'success',
    result: deleteResult,
  });
}

const deleteVisitorData = async (visitorId: string, ip: string) => {
  const options = {
    where: { visitorId },
  };

  return {
    deletedLoginAttempts: await tryToDestroy(() => LoginAttemptDbModel.destroy(options)),
    deletedPaymentAttempts: await tryToDestroy(() => PaymentAttemptDbModel.destroy(options)),
    deletedCouponsClaims: await tryToDestroy(() => CouponClaimDbModel.destroy(options)),
    deletedPersonalizationRecords: await tryToDestroy(async () => {
      const deletedCartItemsCount = await UserCartItemDbModel.destroy(options);
      const deletedUserSearchHistoryCount = await UserSearchHistoryDbModel.destroy(options);
      return deletedCartItemsCount + deletedUserSearchHistoryCount;
    }),
    deletedLoanRequests: await tryToDestroy(() => LoanRequestDbModel.destroy(options)),
    deletedArticleViews: await tryToDestroy(() => ArticleViewDbModel.destroy(options)),
    deletedBlockedIps: await tryToDestroy(async () => {
      const deletedIpCount = await deleteBlockedIp(ip);
      await syncFirewallRuleset();
      return deletedIpCount;
    }),
    deletedSmsVerificationRequests: await tryToDestroy(() => SmsVerificationDatabaseModel.destroy(options)),
    deletedAccountSharingRecords: await tryToDestroy(async () => {
      /**
       * Deleting things a little aggressively here, because:
       * This demo requires multiple browsers. User is likely to reset scenarios using just one visitorId,
       * but we want to reset everything they created anyway, to avoid confusion in the other browser.
       */
      let deletedUserCount = 0;
      let deletedSessionsCount = 0;
      // Find all sessions and users created with this visitorId
      const sessions = await SessionDbModel.findAll({ where: { visitorId } });
      const users = await UserDbModel.findAll({ where: { createdWithVisitorId: visitorId } });
      // Delete all sessions with this visitorId, and all users in those sessions
      deletedSessionsCount += await SessionDbModel.destroy({ where: { visitorId } });
      for (const session of sessions) {
        deletedUserCount += await UserDbModel.destroy({ where: { username: session.username } });
      }
      // Delete all users created with this visitorId, and all sessions for those users
      deletedUserCount += await UserDbModel.destroy({ where: { createdWithVisitorId: visitorId } });
      for (const user of users) {
        deletedSessionsCount += await SessionDbModel.destroy({ where: { username: user.username } });
      }
      return deletedUserCount + deletedSessionsCount;
    }),
  };
};

type ResetResult = Awaited<ReturnType<typeof deleteVisitorData>>;

const tryToDestroy = async (callback: () => Promise<number>) => {
  try {
    return await callback();
  } catch (err) {
    console.error(err);
    return 0;
  }
};
