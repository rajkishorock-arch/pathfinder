import React from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/common/SEOHead';
import { Button } from '@/components/ui/Button';
import { Compass, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <>
      <SEOHead title="Page Not Found" noIndex />

      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto">
            <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: '10s' }} />
          </div>

          <h1 className="text-4xl font-extrabold text-slate-900">404</h1>
          <h2 className="text-xl font-bold text-slate-800">Page Not Found</h2>

          <p className="text-sm text-slate-600 leading-relaxed">
            The page you are looking for doesn't exist or has been moved.
          </p>

          <div className="pt-2 flex justify-center">
            <Link to="/">
              <Button variant="primary" leftIcon={<Home className="w-4 h-4" />}>
                Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
