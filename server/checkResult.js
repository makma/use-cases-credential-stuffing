export class CheckResult {
  /**
   * @param {string} message
   * @param {string} messageSeverity
   * @param {string} type
   * @param {Object | undefined} data
   * */
  constructor(message, messageSeverity, type, data = undefined) {
    /** @type {string} */
    this.message = message;
    /** @type {string} */
    this.messageSeverity = messageSeverity;
    /** @type {string} */
    this.type = type;
    /** @type {Object | undefined} */
    this.data = data;
  }

  toJsonResponse() {
    return {
      message: this.message,
      severity: this.messageSeverity,
      type: this.type,
      data: this.data,
    };
  }
}

export const checkResultType = Object.freeze({
  LowConfidenceScore: 'LowConfidenceScore',
  RequestIdMismatch: 'RequestIdMismatch',
  OldTimestamp: 'OldTimestamp',
  TooManyLoginAttempts: 'TooManyLoginAttempts',
  ForeignOrigin: 'ForeignOrigin',
  Challenged: 'Challenged',
  IpMismatch: 'IpMismatch',
  Passed: 'Passed',
  MaliciousBotDetected: 'MaliciousBotDetected',
  GoodBotDetected: 'GoodBotDetected',
  ServerError: 'ServerError',
  // Login specific checks.
  IncorrectCredentials: 'IncorrectCredentials',
  // Payment specific checks.
  TooManyChargebacks: 'TooManyChargebacks',
  TooManyUnsuccessfulPayments: 'TooManyUnsuccessfulPayments',
  PaidWithStolenCard: 'PaidWithStolenCard',
  IncorrectCardDetails: 'IncorrectCardDetails',

  // Loan risk specific checks.
  PossibleLoanFraud: 'PossibleLoanFraud',

  // Paywall specific checks.
  ArticleViewLimitExceeded: 'ArticleViewLimitExceeded',

  // Coupon fraud specific checks
  CouponDoesNotExist: 'CouponDoesNotExist',
  CouponAlreadyClaimed: 'CouponAlreadyClaimed',
  AnotherCouponClaimedRecently: 'AnotherCouponClaimedRecently',
});
