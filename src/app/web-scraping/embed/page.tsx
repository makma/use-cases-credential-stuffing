import { USE_CASES } from '../../../client/content';
import { generateUseCaseMetadata } from '../../../client/seo';
import { WebScrapingUseCase } from '../WebScraping';

export const metadata = generateUseCaseMetadata(USE_CASES.webScraping);

export default function WebScrapingPage() {
  return <WebScrapingUseCase embed={true} />;
}
