import { USE_CASES } from '../../../client/content';
import { generateUseCaseMetadata } from '../../../client/seo';
import { Personalization } from '../Personalization';

export const metadata = generateUseCaseMetadata(USE_CASES.personalization);

export default function PaywallPage() {
  return <Personalization embed={true} />;
}
