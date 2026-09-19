import React from 'react';
import { Helmet } from 'react-helmet-async';
import type { SEOProps } from '@/types';
import { DEFAULT_DESCRIPTION, getFullTitle, SITE_URL } from '@/utils/seo';

export const SEOHead: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  canonicalUrl,
  ogType = 'website',
  ogImage = `${SITE_URL}/og-image.png`,
  noIndex = false,
}) => {
  const fullTitle = getFullTitle(title);

  return (
    <Helmet>
      {/* Basic Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta charSet="utf-8" />

      {/* Robots indexing rules */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* Canonical Link */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Pathfinder" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};
