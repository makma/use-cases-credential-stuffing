'use client';

import { useEffect, useState } from 'react';
import { MyCopyButton } from '../../../client/components/CopyButton/CopyButton';
export const AccountSharingDemoLink = () => {
  const [origin, setOrigin] = useState('https://demo.fingerprint.com');

  // Cannot use window.location.origin during server-side rendering, must be wrapped in a hook
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const url = `${origin}/account-sharing?mode=login`;
  return (
    <>
      <code style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>{url}</code>
      <MyCopyButton contentToCopy={url} inline />
    </>
  );
};
