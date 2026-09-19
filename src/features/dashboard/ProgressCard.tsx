import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Award, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { progressService, type UserProgressOverview } from '@/services/progressService';

export const ProgressCard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState<UserProgressOverview | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadProgress = async () => {
      setLoading(true);
      const { data } = await progressService.getUserProgressOverview();
      if (isMounted) {
        setProgressData(data);
        setLoading(false);
      }
    };
    loadProgress();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <Card padding="lg" className="animate-pulse">
        <div className="h-5 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-16 bg-slate-100 rounded mb-4"></div>
        <div className="h-10 bg-slate-200 rounded w-full"></div>
      </Card>
    );
  }

  const { career, dailyProgress, readinessOverview, assessmentHistory } = progressData || {};

  return (
    <Card padding="lg" hoverEffect className="relative border-indigo-100 bg-gradient-to-br from-white to-indigo-50/20">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Career Readiness & Progress</h3>
            <p className="text-xs text-slate-500">
              {career ? career.title : 'No career goal selected'}
            </p>
          </div>
        </div>
        <Badge variant={career ? 'indigo' : 'neutral'} size="sm">
          {career ? 'Tracked' : 'Action Required'}
        </Badge>
      </div>

      {!career ? (
        <div className="text-center py-4">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700">No career goal selected.</p>
          <p className="text-xs text-slate-500 mb-4">Select a career goal to view your readiness breakdown.</p>
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/progress')}>
            View Progress Page
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white border border-slate-100 rounded-xl shadow-2xs">
              <span className="text-slate-500 block mb-1">Today's Learning</span>
              {dailyProgress?.hasTasksToday ? (
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">
                    {dailyProgress.completedTasks}/{dailyProgress.totalTasks} tasks
                  </span>
                  <span className="font-semibold text-indigo-600">{dailyProgress.progressPercentage}%</span>
                </div>
              ) : (
                <span className="text-slate-400 text-xs italic">No tasks today</span>
              )}
            </div>

            <div className="p-3 bg-white border border-slate-100 rounded-xl shadow-2xs">
              <span className="text-slate-500 block mb-1">Skills Met</span>
              {readinessOverview ? (
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">
                    {readinessOverview.skillsMeetingRequirement}/{readinessOverview.totalRequiredSkills} skills
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
              ) : (
                <span className="text-slate-400 text-xs italic">Not assessed</span>
              )}
            </div>
          </div>

          {/* Assessment Score Change Notice if available */}
          {assessmentHistory?.hasEnoughAssessments && assessmentHistory.overallScoreDelta !== null && (
            <div className="flex items-center justify-between p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-lg text-xs">
              <span className="text-emerald-800 font-medium flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                Overall Assessment Score Change
              </span>
              <span className="font-bold text-emerald-700">
                {assessmentHistory.overallScoreDelta >= 0 ? `+${assessmentHistory.overallScoreDelta}%` : `${assessmentHistory.overallScoreDelta}%`}
              </span>
            </div>
          )}

          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/dashboard/progress')}
            className="w-full flex items-center justify-center gap-1 text-slate-700 hover:text-indigo-600"
          >
            View Full Progress Details
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </Card>
  );
};
