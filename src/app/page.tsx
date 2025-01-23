import Link from 'next/link';
import styles from './page.module.scss';
import Container from '../client/components/Container';
import { HOMEPAGE_CARDS } from '../client/content';
import LinkArrow from '../client/img/externalLinkArrow.svg';
import Image from 'next/image';
import { TEST_IDS } from '../client/testIDs';
import { Fragment } from 'react';
import { Metadata } from 'next';
import { generateMetadata } from '../client/seo';
import { LayoutUI } from './LayoutUI';

export const metadata: Metadata = generateMetadata({
  title: 'Fingerprint Use Cases | Discover Device Intelligence Use Cases',
  description:
    'Explore an extensive range of use cases supported by Fingerprint, and learn how to successfully implement it for your business with practical guidance and a comprehensive demo.',
});

export default function Index() {
  return (
    <LayoutUI>
      <Container size='large' className={styles.hero}>
        <h1 className={styles.title}>Fingerprint use cases</h1>
        <div className={styles.intro}>
          <p>
            Explore the wide range of major use cases supported by Fingerprint, including a comprehensive demo that
            showcases both frontend and backend sample implementations with a persistent data layer for each use case.
          </p>

          <p>
            This provides insights and practical guidance on how to effectively implement Fingerprint for the specific
            use case that is most relevant to your business.
          </p>
        </div>
      </Container>
      <div className={styles.useCaseGrid}>
        {HOMEPAGE_CARDS.map((card) => (
          <div className={styles.useCaseCard} key={card.url}>
            <div>
              <Image
                src={card.iconSvg}
                alt=''
                className={styles.useCaseIcon}
                data-testid={TEST_IDS.homepageCard.useCaseIcon}
              />
              <Link className={styles.useCaseTitle} data-testid={TEST_IDS.homepageCard.useCaseTitle} href={card.url}>
                {card.title}
              </Link>
              <div className={styles.useCaseDescription} data-testid={TEST_IDS.homepageCard.useCaseDescription}>
                {card.descriptionHomepage?.map((line, i) => <Fragment key={i}>{line}</Fragment>)}
              </div>
            </div>
            <div>
              <span className={styles.viewPrompt}>
                See use case demo
                <Image src={LinkArrow} alt='' />
              </span>
            </div>
          </div>
        ))}
      </div>
    </LayoutUI>
  );
}
