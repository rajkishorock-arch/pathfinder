import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Target, Layers, BarChart3, Compass } from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const LandingPage: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Target your career goal',
      desc: 'Select the role you want to achieve, whether software engineering, data science, or DevOps.',
      icon: <Target className="w-5 h-5 text-indigo-600" />,
    },
    {
      num: '02',
      title: 'Identify your skill gaps',
      desc: 'Assess what you already master and pinpoint missing prerequisites before wasting time on wrong topics.',
      icon: <Layers className="w-5 h-5 text-indigo-600" />,
    },
    {
      num: '03',
      title: 'Follow daily structured tasks',
      desc: 'Receive tailored daily milestones optimized for your available learning hours.',
      icon: <Compass className="w-5 h-5 text-indigo-600" />,
    },
    {
      num: '04',
      title: 'Track career readiness',
      desc: 'Monitor evidence-based skill metrics until you are genuinely ready to land your target role.',
      icon: <BarChart3 className="w-5 h-5 text-indigo-600" />,
    },
  ];

  const featuredCareers = [
    { title: 'Software Developer', skills: 'Python, DSA, DBMS, Web Architecture', count: '14 Modules' },
    { title: 'Data Scientist', skills: 'Python, Statistics, Machine Learning, SQL', count: '16 Modules' },
    { title: 'DevOps Engineer', skills: 'Linux, Docker, Kubernetes, CI/CD, Terraform', count: '12 Modules' },
    { title: 'Frontend Engineer', skills: 'HTML/CSS, JavaScript, React, TypeScript, UI/UX', count: '11 Modules' },
  ];

  return (
    <>
      <SEOHead
        title="Know What To Learn Next"
        description="Build a personalized learning path around the career you want. Bridge skill gaps with structured daily milestones."
        canonicalUrl="https://pathfinder.learning/"
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-200/80 bg-linear-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-6">
            <Badge variant="indigo" size="sm">Phase 1 Foundation</Badge>
            <span>Structured Career Guidance Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Know what to learn next.
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Build a personalized learning path around the career you want. Stop guessing your next step and focus on what actually moves you forward.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Create your roadmap
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button size="lg" variant="outline">
                See how it works
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Core Problem & Solution Overview */}
      <section className="py-16 md:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Clear direction for ambitious learners
            </h2>
            <p className="mt-3 text-slate-600 text-base leading-relaxed">
              Most students know what career they want, but struggle with fragmented tutorials, missing prerequisites, and uncertainty about job readiness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => (
              <Card key={step.num} padding="md" className="relative flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-100">
                      {step.icon}
                    </div>
                    <span className="text-xs font-bold text-slate-400 tracking-widest">{step.num}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Career Paths */}
      <section className="py-16 md:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Explore Structured Career Paths
              </h2>
              <p className="mt-2 text-slate-600 text-sm sm:text-base">
                Curated roadmap structures for high-demand technology roles.
              </p>
            </div>
            <Link to="/careers" className="mt-4 md:mt-0">
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                View all careers
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCareers.map((career, i) => (
              <Card key={i} padding="md" hoverEffect className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="indigo" size="sm">
                      {career.count}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{career.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    <span className="font-semibold text-slate-700">Core Skills:</span> {career.skills}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-semibold">
                  <span>Explore Roadmap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Public CTA Banner */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold">
            Ready to organize your career journey?
          </h2>
          <p className="text-slate-300 text-base max-w-2xl mx-auto">
            Create your free account today and discover what you need to learn next.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Create your roadmap
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};
