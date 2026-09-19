import React from 'react';
import { SEOHead } from '@/components/common/SEOHead';
import { Card } from '@/components/ui/Card';
import { ShieldCheck, Target, HeartHandshake } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <>
      <SEOHead
        title="About Pathfinder"
        description="Learn about our product philosophy, evidence-based roadmap design, and commitment to clear, accessible career paths for students."
        canonicalUrl="https://pathfinder.learning/about"
      />

      <div className="py-12 md:py-20 bg-slate-50 min-h-[calc(100vh-4rem)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              About Pathfinder
            </h1>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
              We built Pathfinder to solve a simple, pervasive issue: students know where they want to go, but get lost in the noise of how to get there.
            </p>
          </div>

          {/* Philosophy Principles */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Our Product Philosophy</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card padding="md">
                <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 w-fit mb-4">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Clarity Over Clutter</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  We don't overwhelm you with 500 random tutorials. Every recommendation has a explicit reason tied to your career goal.
                </p>
              </Card>

              <Card padding="md">
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 w-fit mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Truthful Progress</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  No fake statistics or inflated scores. Your progress metrics reflect genuine, verifiable mastery of required skills.
                </p>
              </Card>

              <Card padding="md">
                <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 w-fit mb-4">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Paced & Accessible</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Designed for real schedules—whether you have 30 minutes or 3 hours a day, your roadmap adapts to keep momentum.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
