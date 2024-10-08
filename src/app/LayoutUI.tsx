'use client';

import '../client/styles/global-styles.scss';
import { useSelectedLayoutSegments } from 'next/navigation';
import { IS_PRODUCTION } from '../envShared';
import Header from '../client/components/Header/Header';
import { Analytics } from '../client/analytics/Analytics';
import Footer from '../client/components/Footer/Footer';
import styles from './LayoutUI.module.scss';

export function LayoutUI({ children }: { children: React.ReactNode }) {
  const segments = useSelectedLayoutSegments();
  const embed = Boolean(segments?.includes('embed'));
  return (
    <div className={styles.layout}>
      {embed ? null : <Header />}
      {IS_PRODUCTION ? <Analytics /> : null}
      <div>{children}</div>
      {embed ? null : <Footer />}
    </div>
  );
}