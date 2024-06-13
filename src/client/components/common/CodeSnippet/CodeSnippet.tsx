import { CSSProperties, PropsWithChildren } from 'react';
import { PrismAsyncLight } from 'react-syntax-highlighter';
import lightTheme from 'react-syntax-highlighter/dist/cjs/styles/prism/coy';
import darkTheme from 'react-syntax-highlighter/dist/cjs/styles/prism/coldark-dark';
import styles from './CodeSnippet.module.scss';
import classnames from 'classnames';
import { MyScrollArea } from '../ScrollArea/ScrollArea';
import { CopyButtonSvg } from '../../../img/CopyButtonSvg';

export interface CodeSnippetProps {
  language: string;
  children: string;
  showCopyButton?: boolean;
  showLineNumbers?: boolean;
  className?: string;
  dataTestId?: string;
}

const PRISM_LINE_NUMBER_STYLE = { minWidth: 28 };

/**
 * Provides a syntax-highlighted code block
 */
export function CodeSnippet({
  language,
  showLineNumbers,
  className,
  children,
  dataTestId,
}: PropsWithChildren<CodeSnippetProps>) {
  const hasDarkMode = false;

  const PRISM_CUSTOM_STYLE: CSSProperties = {
    padding: '16px',
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '16px',
    overflow: 'auto',
    marginTop: '0',
    marginBottom: '0',
    marginLeft: '0',
    marginRight: '0',
  };
  const PRISM_CODE_TAG_PROPS = { style: { color: '#c92c2c', font: 'inherit' as const } };

  return (
    <div className={styles.snippetContainer}>
      <div className={styles.copyButtonContainer}>
        <button className={styles.copyButton} onClick={() => navigator.clipboard.writeText(children)}>
          <CopyButtonSvg />
        </button>
      </div>
      <MyScrollArea className={styles.scrollArea}>
        <PrismAsyncLight
          showLineNumbers={showLineNumbers}
          lineNumberStyle={PRISM_LINE_NUMBER_STYLE}
          wrapLines
          language={language}
          style={hasDarkMode ? darkTheme : lightTheme}
          customStyle={PRISM_CUSTOM_STYLE}
          codeTagProps={PRISM_CODE_TAG_PROPS}
          className={classnames(styles.snippet, className)}
          data-testid={dataTestId}
        >
          {children}
        </PrismAsyncLight>
      </MyScrollArea>
    </div>
  );
}
