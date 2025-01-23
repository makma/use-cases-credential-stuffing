import React from 'react';
import GithubSVG from './github.svg';
import LinkedInSvg from './linkedin.svg';
import TwitterSvg from './twitter.svg';

import Container from '../Container';
import styles from './Footer.module.scss';
import { URLS } from '../../content';
import classNames from 'classnames';
import Image from 'next/image';
import LogoSvg from '../Header/fpjs.svg';
import LogoDarkSvg from '../Header/fpjsDark.svg';

interface FooterProps {
  darkVariant?: boolean;
}
export default function Footer({ darkVariant }: FooterProps) {
  return (
    <footer className={classNames(styles.footer, { [styles.dark]: darkVariant })}>
      <Container size='large' className={styles.footerContainer}>
        <section className={styles.logoSection}>
          <a href={URLS.mainSite} className={styles.link} title='Logo'>
            {darkVariant ? (
              <Image src={LogoDarkSvg} className={styles.logo} alt='Fingerprint logo' />
            ) : (
              <Image src={LogoSvg} className={styles.logo} alt='Fingerprint logo' />
            )}
          </a>
          <address className={styles.address}>1440 W. Taylor St #735, Chicago, IL 60607, USA</address>
        </section>
        <section className={styles.socialSection}>
          <div className={styles.copyright}>© FingerprintJS 2022, Inc</div>
          <ul className={styles.socials}>
            <li className={styles.link}>
              <a href={URLS.githubRepoUrl} target='_blank' rel='noreferrer' aria-label='GitHub link'>
                <Image src={GithubSVG} alt='Github logo' />
              </a>
            </li>
            <li className={styles.link}>
              <a href={URLS.linkedinUrl} target='_blank' rel='noreferrer' aria-label='LinkedIn link'>
                <Image src={LinkedInSvg} alt='LinkedIn logo' />
              </a>
            </li>
            <li className={styles.link}>
              <a href={URLS.twitterUrl} target='_blank' rel='noreferrer' aria-label='Twitter link'>
                <Image src={TwitterSvg} alt='Twitter logo' />
              </a>
            </li>
          </ul>
        </section>
      </Container>
    </footer>
  );
}
