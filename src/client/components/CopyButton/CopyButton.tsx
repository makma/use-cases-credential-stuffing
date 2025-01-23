'use client';

import { FunctionComponent, useEffect, useState } from 'react';
import { CopyButtonSvg } from '../../img/CopyButtonSvg';
import { CheckMarkSvg } from '../../img/CheckmarkSvg';
import styles from './CopyButton.module.scss';
import classnames from 'classnames';

type CopyButtonProps = {
  contentToCopy: string;
  ariaLabel?: string;
  className?: string;
  onCopy?: () => void;
  inline?: boolean;
};

export const MyCopyButton: FunctionComponent<CopyButtonProps> = ({
  contentToCopy,
  ariaLabel,
  className,
  onCopy,
  inline,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  async function onCopyClick() {
    await navigator.clipboard.writeText(contentToCopy);
    setIsCopied(true);
    onCopy?.();
  }

  useEffect(() => {
    if (!isCopied) {
      return;
    }

    const timer = setTimeout(() => setIsCopied(false), 1000);
    return () => clearTimeout(timer);
  }, [isCopied]);

  return (
    <button
      onClick={onCopyClick}
      aria-label={ariaLabel ?? 'Copy to clipboard'}
      className={classnames(styles.copyButton, inline ? styles.inline : className)}
    >
      {isCopied ? (
        <div className={styles.copiedContainer}>
          {inline ? '' : 'Copied'}
          <CheckMarkSvg className={styles.copyIcon} />
        </div>
      ) : (
        <CopyButtonSvg className={styles.copyIcon} />
      )}
    </button>
  );
};
