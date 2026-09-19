import React from 'react';
import { SEOHead } from '@/components/common/SEOHead';
import { Card } from '@/components/ui/Card';
import { ForgotPasswordForm } from '@/features/auth/ForgotPasswordForm';

export const ForgotPasswordPage: React.FC = () => {
  return (
    <>
      <SEOHead title="Reset Password" noIndex />

      <Card padding="lg" className="shadow-lg border-slate-200">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Reset your password</h1>
        </div>

        <ForgotPasswordForm />
      </Card>
    </>
  );
};
