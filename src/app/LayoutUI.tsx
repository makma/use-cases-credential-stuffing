import '../client/styles/global-styles.scss';
import Header from '../client/components/Header/Header';
import Footer from '../client/components/Footer/Footer';
import styles from './LayoutUI.module.scss';

export function LayoutUI({
  children,
  embed,
  onReset,
}: {
  children: React.ReactNode;
  embed?: boolean;
  onReset?: () => void;
}) {
  return (
    <div className={styles.layout}>
      {embed ? null : <Header onReset={onReset} />}
      <div>{children}</div>
      {embed ? null : <Footer />}
    </div>
  );
}
