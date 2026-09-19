import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, BookOpen, Award, Compass } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/features/auth';
import { OnboardingWizard } from '@/features/onboarding/OnboardingWizard';
import { SkillGapCard } from '@/features/dashboard/SkillGapCard';

import { DailyLearningCard } from '@/features/dashboard/DailyLearningCard';

export const DashboardShell: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user?.isOnboarded) {
    return (
      <div className="py-6">
        <OnboardingWizard />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              Student Dashboard
            </div>
            <Badge variant="indigo" size="sm">
              Phase 3E Daily Learning Active
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Good morning, {user.name}
          </h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
              <Target className="w-4 h-4 text-indigo-600" />
              Goal: {user.careerGoalTitle || 'No career goal selected'}
            </span>
            <span>•</span>
            <span>{user.availableHoursPerDay || 2}h daily learning target</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="md" onClick={() => navigate('/dashboard/learning')}>
            <BookOpen className="w-4 h-4 mr-1.5 text-indigo-600" />
            Today's Learning
          </Button>

          <Button variant="outline" size="md" onClick={() => navigate('/dashboard/roadmap')}>
            <Compass className="w-4 h-4 mr-1.5 text-indigo-600" />
            View My Roadmap
          </Button>

          <Button variant="primary" size="md" onClick={() => navigate('/dashboard/assessment')}>
            <Award className="w-4 h-4 mr-1.5" />
            Take Skill Assessment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column: Skill Gap Card + Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <SkillGapCard />

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card padding="md" hoverEffect className="cursor-pointer" onClick={() => navigate('/dashboard/assessment')}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Skill Diagnostic</h3>
                  <p className="text-xs text-slate-500">Test baseline programming knowledge</p>
                </div>
              </div>
            </Card>

            <Card padding="md" hoverEffect className="cursor-pointer" onClick={() => navigate('/dashboard/learning')}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Daily Tasks</h3>
                  <p className="text-xs text-slate-500">View today's learning objectives</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Column: Daily Learning Widget + Profile Summary */}
        <div className="space-y-6">
          <DailyLearningCard />

          <Card padding="lg">
            <h3 className="text-base font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
              Account & Profile Overview
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Full Name</span>
                <span className="font-semibold text-slate-800">{user.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Education Level</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {user.educationLevel?.replace('-', ' ') || 'Undergraduate'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Field of Study</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {user.field?.replace('-', ' ') || 'Computer Science'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Experience Level</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {user.experienceLevel || 'Beginner'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Daily Learning Target</span>
                <span className="font-semibold text-slate-800">
                  {user.availableHoursPerDay || 2} hours/day
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
