import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2 font-bold text-slate-900 text-lg mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Compass className="w-4 h-4" />
              </div>
              <span>Pathfinder</span>
            </Link>
            <p className="text-sm text-slate-600 leading-relaxed max-w-sm">
              Structured learning paths, skill-gap analysis, and realistic career readiness tracking.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-4">
              Product
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/careers" className="text-slate-600 hover:text-slate-900 transition-colors">
                  Career Explorer
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-slate-600 hover:text-slate-900 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-slate-600 hover:text-slate-900 transition-colors">
                  Create Roadmap
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-4">
              Platform
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="text-slate-600 hover:text-slate-900 transition-colors">
                  About Pathfinder
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-slate-600 hover:text-slate-900 transition-colors">
                  Student Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Trust */}
          <div>
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-4">
              Commitment
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Designed with accessibility, data privacy, and evidence-based learning principles in mind.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {currentYear} Pathfinder. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-slate-700 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-700 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-700 cursor-pointer">Accessibility Statement</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
