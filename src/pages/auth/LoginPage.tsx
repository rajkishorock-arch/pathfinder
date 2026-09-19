import React from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/common/SEOHead';
import { Card } from '@/components/ui/Card';
import { LoginForm } from '@/features/auth/LoginForm';

export const LoginPage: React.FC = () => {
  return (
    <>
      <SEOHead title="Log In" noIndex />

      <Card padding="lg" className="shadow-lg border-slate-200">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="text-sm text-slate-600 mt-1">
            Sign in to continue your personalized learning path
          </p>
        </div>

        <LoginForm />

        <div className="mt-6 text-center text-xs text-slate-600 pt-4 border-t border-slate-100">
          Don't have an account yet?{' '}
          <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Create free account
          </Link>
        </div>
      </Card>
    </>
  );
};
