import React from 'react';
import { SEOHead } from '@/components/common/SEOHead';
import { Card } from '@/components/ui/Card';

export const HowItWorksPage: React.FC = () => {
  const deepSteps = [
    {
      step: 'Step 1',
      title: 'Career Selection & Benchmark Mapping',
      description: 'We analyze current industry standards for your target role to establish a concrete skill matrix required for production readiness.',
    },
    {
      step: 'Step 2',
      title: 'Skill Diagnostics & Gap Analysis',
      description: 'Instead of assuming you are starting from zero, our quick diagnostic assessment identifies what topics you already know.',
    },
    {
      step: 'Step 3',
      title: 'Roadmap Generation & Daily Task Pacing',
      description: 'The platform structures your journey into logical stages, delivering daily 45-minute focused tasks based on your available time.',
    },
    {
      step: 'Step 4',
      title: 'Practice & Career Readiness Verification',
      description: 'As you complete modules, your overall readiness score increases toward full career readiness.',
    },
  ];

  return (
    <>
      <SEOHead
        title="How It Works"
        description="Detailed overview of Pathfinder's 4-step personalized learning methodology: goal benchmark, gap analysis, daily tasks, and readiness tracking."
        canonicalUrl="https://pathfinder.learning/how-it-works"
      />

      <div className="py-12 md:py-20 bg-slate-50 min-h-[calc(100vh-4rem)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How Pathfinder Works
            </h1>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
              A systematic approach to learning that eliminates decision fatigue and keeps you moving forward every day.
            </p>
          </div>

          <div className="space-y-6">
            {deepSteps.map((item, index) => (
              <Card key={index} padding="lg">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold shrink-0">
                    {item.step}
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-slate-900">{item.title}</h2>
                    <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
