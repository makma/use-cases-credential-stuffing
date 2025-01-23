import { Suspense } from 'react';
import { USE_CASES } from '../../../../client/content';
import { generateUseCaseMetadata } from '../../../../client/seo';
import { AccountSharingHome } from './AccountSharingHome';

export const metadata = generateUseCaseMetadata(USE_CASES.accountSharing);

export default function AccountSharingPage({ params }: { params: { username: string } }) {
  return (
    <Suspense>
      <AccountSharingHome username={params.username} />
    </Suspense>
  );
}
