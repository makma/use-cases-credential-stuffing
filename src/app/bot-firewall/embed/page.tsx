import { USE_CASES } from '../../../client/content';
import { generateUseCaseMetadata } from '../../../client/seo';
import BotFirewall from '../BotFirewall';

export const metadata = generateUseCaseMetadata(USE_CASES.botFirewall);

export default function BotFirewallPage() {
  return <BotFirewall embed={true} />;
}
