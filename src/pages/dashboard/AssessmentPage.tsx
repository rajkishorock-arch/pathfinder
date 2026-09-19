import React from 'react';
import { SEOHead } from '@/components/common/SEOHead';
import { AssessmentFlow } from '@/features/assessment';

export const AssessmentPage: React.FC = () => {
  return (
    <>
      <SEOHead title="Skill Assessment" noIndex />
      <AssessmentFlow />
    </>
  );
};
