import { USE_CASES } from '../../../client/content';
import { generateUseCaseMetadata } from '../../../client/seo';
import { VpnDetectionUseCaseWrapped } from '../VpnDetectionUseCase';

export const metadata = generateUseCaseMetadata(USE_CASES.vpnDetection);

export default function VpnDetectionPage() {
  return <VpnDetectionUseCaseWrapped embed={true} />;
}
