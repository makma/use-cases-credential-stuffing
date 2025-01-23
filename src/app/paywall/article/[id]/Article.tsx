'use client';

import { Skeleton, SkeletonTypeMap } from '@mui/material';
import { UseCaseWrapper } from '../../../../client/components/UseCaseWrapper/UseCaseWrapper';
import { USE_CASES } from '../../../../client/content';

import Image from 'next/image';
import styles from '../../paywall.module.scss';
import { Alert } from '../../../../client/components/Alert/Alert';
import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { useQuery } from 'react-query';
import { TEST_IDS } from '../../../../client/testIDs';
import { ArticleGrid, Byline } from '../../components/ArticleGrid';
import { BackArrow } from '../../../../client/components/BackArrow/BackArrow';
import { ArticleRequestPayload, ArticleResponse } from '../../api/article/[id]/route';
import { ARTICLES } from '../../api/articles';
import { FPJS_CLIENT_TIMEOUT } from '../../../../const';

function ArticleSkeleton({ animation = false }: { animation?: SkeletonTypeMap['props']['animation'] }) {
  const skeletons = Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} animation={animation} />);
  return <>{skeletons}</>;
}

export function Article({ articleId, embed }: { articleId: string; embed: boolean }) {
  const { getData: getVisitorData } = useVisitorData({
    ignoreCache: true,
    timeout: FPJS_CLIENT_TIMEOUT,
  });

  const { data: articleData, error: articleError } = useQuery<ArticleRequestPayload, Error, ArticleResponse>(
    ['GET_ARTICLE_QUERY', articleId],
    async () => {
      const { requestId } = await getVisitorData();
      const response = await fetch(`/paywall/api/article/${articleId}`, {
        method: 'POST',
        body: JSON.stringify({ requestId } satisfies ArticleRequestPayload),
      });
      return await response.json();
    },
  );

  const { article } = articleData ?? {};
  const returnUrl = `/paywall${embed ? '/embed' : ''}`;
  const relatedArticles = ARTICLES.filter((article) => article.id !== articleId).slice(0, 4);

  return (
    <UseCaseWrapper useCase={USE_CASES.paywall} embed={embed}>
      <div className={styles.articleContainer}>
        <BackArrow as='Link' href={returnUrl} label='Back to articles' testId={TEST_IDS.paywall.goBack} />
        {!articleData && <ArticleSkeleton animation='wave' />}
        {articleData && articleData.message && <Alert severity={articleData.severity}>{articleData.message}</Alert>}
        {articleError && <Alert severity='error'>{articleError.message}</Alert>}
        {article && (
          <div className={styles.article} data-testid={TEST_IDS.paywall.articleContent}>
            <Image src={article.image} alt={article.title} sizes='100vw' className={styles.articleImage} />
            <Byline article={article} includeReadingTime />
            <h2 className={styles.articleTitle}>{article.title}</h2>
            <div className={styles.articleContent}>
              {article.content.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        )}
      </div>
      {article && (
        <div className={styles.readMoreContainer}>
          <h3 className={styles.readMore}>More articles to read</h3>
          <ArticleGrid articles={relatedArticles} embed={embed} />
        </div>
      )}
    </UseCaseWrapper>
  );
}
