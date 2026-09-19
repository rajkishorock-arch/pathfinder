import React from 'react';
import { SEOHead } from '@/components/common/SEOHead';
import { DashboardShell } from '@/features/dashboard/DashboardShell';

export const DashboardPage: React.FC = () => {
  return (
    <>
      <SEOHead title="Student Dashboard" noIndex />
      <DashboardShell />
    </>
  );
};
