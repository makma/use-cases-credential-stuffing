import { USE_CASES } from '../../../client/content';
import { generateUseCaseMetadata } from '../../../client/seo';
import { LoanRisk } from '../LoanRisk';

export const metadata = generateUseCaseMetadata(USE_CASES.loanRisk);

export default function LoanRiskPage() {
  return <LoanRisk embed={true} />;
}
