import React from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/common/SEOHead';
import { Card } from '@/components/ui/Card';
import { SignupForm } from '@/features/auth/SignupForm';

export const SignupPage: React.FC = () => {
  return (
    <>
      <SEOHead title="Create Your Roadmap" noIndex />

      <Card padding="lg" className="shadow-lg border-slate-200">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="text-sm text-slate-600 mt-1">
            Start building your career-aligned learning path
          </p>
        </div>

        <SignupForm />

        <div className="mt-6 text-center text-xs text-slate-600 pt-4 border-t border-slate-100">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Sign in
          </Link>
        </div>
      </Card>
    </>
  );
};
