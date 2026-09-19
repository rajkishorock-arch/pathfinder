export const SITE_NAME = 'Pathfinder';
export const DEFAULT_TITLE = 'Pathfinder - Know What To Learn Next';
export const DEFAULT_DESCRIPTION = 'Build a structured, personalized learning path toward your dream career with targeted skill gap analysis and step-by-step guidance.';

// Configurable production domain (override in .env using VITE_APP_URL)
export const SITE_URL = (import.meta.env.VITE_APP_URL as string) || 'https://example-pathfinder.domain';

export function getFullTitle(title?: string): string {
  if (!title) return DEFAULT_TITLE;
  return `${title} | ${SITE_NAME}`;
}

export function generateStructuredData(type: 'WebSite' | 'Organization' | 'Course' | 'BreadcrumbList', data: Record<string, unknown>) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  });
}
