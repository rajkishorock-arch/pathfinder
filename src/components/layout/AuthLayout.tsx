import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 font-bold text-slate-900 text-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-md p-1"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Compass className="w-6 h-6" />
          </div>
          <span>Pathfinder</span>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Outlet />
      </div>
    </div>
  );
};
