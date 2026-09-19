import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/common/SEOHead';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ArrowRight, Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { careerService } from '@/services/careerService';
import type { CareerOption } from '@/types';

export const CareersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [careersList, setCareersList] = useState<CareerOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    careerService.getCareers().then((res) => {
      setCareersList(res);
      setIsLoading(false);
    });
  }, []);

  const filteredCareers = careersList.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <SEOHead
        title="Career Catalog & Learning Paths"
        description="Browse production-ready learning roadmaps for Software Engineering, Data Science, Frontend, and DevOps roles."
        canonicalUrl="https://example-pathfinder.domain/careers"
      />

      <div className="py-12 md:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Career Catalog & Learning Paths
            </h1>
            <p className="mt-2 text-slate-600 text-base max-w-2xl">
              Select a target role below to view required skills, stage breakdowns, and estimation guidelines.
            </p>
          </div>

          {/* Search filter */}
          <div className="max-w-md">
            <Input
              placeholder="Search careers (e.g. Frontend, Data, DevOps)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          {/* Career Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <Card key={n} padding="lg">
                  <div className="space-y-3 animate-pulse">
                    <div className="h-5 bg-slate-200 rounded w-1/3" />
                    <div className="h-6 bg-slate-200 rounded w-2/3" />
                    <div className="h-4 bg-slate-200 rounded w-full" />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCareers.map((career) => (
                <Card key={career.slug} padding="lg" hoverEffect className="flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="indigo">{career.category}</Badge>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">{career.title}</h2>
                    <p className="text-xs text-slate-600 leading-relaxed mb-6">
                      {career.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      to="/signup"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      <span>Start roadmap for this role</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
