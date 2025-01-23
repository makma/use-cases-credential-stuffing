import { USE_CASES } from '../../../client/content';
import { generateUseCaseMetadata } from '../../../client/seo';
import { PaymentFraud } from '../PaymentFraud';

export const metadata = generateUseCaseMetadata(USE_CASES.paymentFraud);

export default function PaymentFraudPage() {
  return <PaymentFraud embed={true} />;
}
