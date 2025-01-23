import { USE_CASES } from '../../../client/content';
import { generateUseCaseMetadata } from '../../../client/seo';
import { SmsPumpingUseCase } from '../SmsPumping';

export const metadata = generateUseCaseMetadata(USE_CASES.smsPumping);

export default function SmsPumping() {
  return <SmsPumpingUseCase embed={true} />;
}
