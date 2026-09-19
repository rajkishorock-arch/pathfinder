import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Award, CheckCircle2, ArrowUpRight, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/features/auth';
import { skillGapService, type CareerSkillGapOverview, type SkillGapItem } from '@/services/skillGapService';

export const SkillGapCard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [overview, setOverview] = useState<CareerSkillGapOverview | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadGapData() {
      if (!user) return;
      setIsLoading(true);
      const data = await skillGapService.getUserSkillGaps(user.id);
      if (isMounted) {
        setOverview(data);
        setIsLoading(false);
      }
    }
    loadGapData();
    return () => {
      isMounted = false;
    };
  }, [user]);

  if (isLoading) {
    return (
      <Card padding="lg">
        <div className="flex items-center justify-center py-12 gap-3 text-slate-500 text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
          <span>Analyzing career skill gaps...</span>
        </div>
      </Card>
    );
  }

  if (!overview || overview.skills.length === 0) {
    return (
      <Card padding="lg">
        <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
          <Target className="w-8 h-8 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900">Choose a career goal to see your skill gaps</h3>
          <p className="text-xs text-slate-500 max-w-md">
            Select a target career in your profile to view deterministic required skill levels and baseline gaps.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Deterministic Skill Gap Analysis
            </span>
            <Badge variant="indigo" size="sm">
              Phase 3C
            </Badge>
          </div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            Target Role: {overview.careerTitle}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-xs">
            <span className="text-slate-500 block">Readiness</span>
            <span className="font-bold text-slate-900 text-sm">
              {overview.readyCount} / {overview.totalSkills} Skills Satisfied
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/assessment')}>
            <Award className="w-4 h-4 mr-1 text-indigo-600" />
            Take Assessment
          </Button>
        </div>
      </div>

      {/* Responsive Table / Skill List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-slate-200/80 text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
              <th className="pb-3 font-semibold">Skill</th>
              <th className="pb-3 font-semibold">Demonstrated Level</th>
              <th className="pb-3 font-semibold">Required Level</th>
              <th className="pb-3 font-semibold">Calculated Gap</th>
              <th className="pb-3 font-semibold text-right">Priority</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {overview.skills.map((item: SkillGapItem) => (
              <tr key={item.skillId} className="hover:bg-slate-50/60 transition-colors">
                {/* Skill Name & Category */}
                <td className="py-3.5 pr-4">
                  <div className="font-semibold text-slate-900">{item.skillName}</div>
                  <div className="text-[11px] text-slate-400">{item.skillCategory}</div>
                </td>

                {/* Current Level */}
                <td className="py-3.5 px-2">
                  {!item.isAssessed ? (
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-medium">
                      Not Assessed
                    </span>
                  ) : (
                    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md font-semibold ${
                      item.currentLevel === 3
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : item.currentLevel === 2
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
                        : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                    }`}>
                      {item.currentLevelLabel} ({item.masteryPercentage}%)
                    </span>
                  )}
                </td>

                {/* Required Level */}
                <td className="py-3.5 px-2 font-medium text-slate-700">
                  {item.requiredLevelLabel} (Level {item.requiredLevel})
                </td>

                {/* Gap */}
                <td className="py-3.5 px-2 font-semibold">
                  {item.gap === 0 ? (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> 0 levels
                    </span>
                  ) : (
                    <span className="text-slate-800">
                      {item.gap} {item.gap === 1 ? 'level' : 'levels'}
                    </span>
                  )}
                </td>

                {/* Priority */}
                <td className="py-3.5 pl-4 text-right">
                  {item.priority === 'Ready' && (
                    <Badge variant="emerald" size="sm">
                      Ready
                    </Badge>
                  )}
                  {item.priority === 'Needs Improvement' && (
                    <Badge variant="amber" size="sm">
                      Needs Improvement
                    </Badge>
                  )}
                  {item.priority === 'High Priority' && (
                    <Badge variant="rose" size="sm">
                      High Priority
                    </Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer CTA */}
      <div className="pt-2 flex justify-between items-center text-xs text-slate-500 border-t border-slate-100">
        <span>Deterministic calculation model: 0–39% Beginner, 40–69% Intermediate, 70–100% Advanced</span>
        <button
          onClick={() => navigate('/dashboard/assessment')}
          className="text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
        >
          Retake Assessment <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </Card>
  );
};
