import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Menu, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Careers Catalog', href: '/careers' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'About', href: '/about' },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Handle ESC key listener and body scroll locking for mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between" aria-label="Main Navigation">
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 font-bold text-slate-900 text-lg group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-md px-1 py-0.5"
        >
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white group-hover:bg-indigo-700 transition-colors">
            <Compass className="w-5 h-5" />
          </div>
          <span>Pathfinder</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                to={link.href}
                aria-current={active ? 'page' : undefined}
                className={`text-sm font-medium transition-colors hover:text-indigo-600 px-1 py-0.5 rounded-md ${
                  active ? 'text-indigo-600 font-semibold' : 'text-slate-600'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link to="/signup">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Create your roadmap
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-slate-700 hover:text-slate-900 p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg border border-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation-menu"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu Dropdown Backdrop & Drawer */}
      {mobileMenuOpen && (
        <div id="mobile-navigation-menu" className="md:hidden fixed inset-x-0 top-16 bottom-0 z-50 bg-slate-900/40 backdrop-blur-xs flex flex-col justify-start">
          <div
            className="bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2.5 rounded-md text-base font-medium min-h-[44px] flex items-center ${
                      active
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <Button variant="outline" className="w-full justify-center">
                  Log in
                </Button>
              </Link>
              <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <Button variant="primary" className="w-full justify-center">
                  Create your roadmap
                </Button>
              </Link>
            </div>
          </div>
          {/* Backdrop click to close */}
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />
        </div>
      )}
    </header>
  );
};
