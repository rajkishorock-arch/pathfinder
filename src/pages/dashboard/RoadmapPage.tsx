import React from 'react';
import { SEOHead } from '@/components/common/SEOHead';
import { RoadmapView } from '@/features/roadmap';

export const RoadmapPage: React.FC = () => {
  return (
    <>
      <SEOHead title="Learning Roadmap" noIndex />
      <RoadmapView />
    </>
  );
};
