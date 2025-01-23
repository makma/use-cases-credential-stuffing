import { USE_CASES } from '../../../client/content';
import { generateUseCaseMetadata } from '../../../client/seo';
import { CredentialStuffing } from '.././CredentialStuffing';

export const metadata = generateUseCaseMetadata(USE_CASES.credentialStuffing);

export default function CredentialStuffingPage() {
  return <CredentialStuffing embed={true} />;
}
