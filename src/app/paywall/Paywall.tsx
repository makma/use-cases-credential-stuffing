'use client';

import { UseCaseWrapper } from '../../client/components/common/UseCaseWrapper/UseCaseWrapper';
import { USE_CASES } from '../../client/components/common/content';
import { ArticleCard, ArticleGrid } from './components/ArticleGrid';
import { ARTICLES } from './api/articles';

/**
 * Main Paywall use case page with article listing
 */
export default function Paywall() {
  const heroArticle = ARTICLES[0];
  const gridArticles = ARTICLES.slice(1);
  return (
    <UseCaseWrapper useCase={USE_CASES.paywall}>
      {heroArticle && <ArticleCard article={heroArticle} isHeroArticle />}
      {gridArticles && <ArticleGrid articles={gridArticles} />}
    </UseCaseWrapper>
  );
}
