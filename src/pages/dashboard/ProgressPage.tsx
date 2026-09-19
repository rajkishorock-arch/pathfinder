import React from 'react';
import { SEOHead } from '@/components/common/SEOHead';
import { ProgressView } from '@/features/progress/ProgressView';

export const ProgressPage: React.FC = () => {
  return (
    <>
      <SEOHead title="Progress & Career Readiness" noIndex />
      <ProgressView />
    </>
  );
};
