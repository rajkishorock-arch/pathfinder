import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Target,
  Calendar,
  Award,
  AlertTriangle,
  Info,
  ShieldCheck,
  RefreshCw,
  BookOpen
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { progressService, type UserProgressOverview } from '@/services/progressService';

export const ProgressView: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<UserProgressOverview | null>(null);

  const fetchProgress = async () => {
    setLoading(true);
    setError(null);
    const { data: progressData, error: err } = await progressService.getUserProgressOverview();
    if (err) {
      setError(err.message);
    } else {
      setData(progressData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  if (loading) {
    return (
      <div className="py-12 space-y-6 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="h-32 bg-slate-100 rounded-2xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-48 bg-slate-100 rounded-2xl"></div>
            <div className="h-48 bg-slate-100 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 max-w-3xl mx-auto px-4 text-center space-y-4">
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
          <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <h2 className="text-lg font-bold">Failed to load progress</h2>
          <p className="text-sm text-rose-600 mt-1">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchProgress} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const {
    career,
    dailyProgress,
    learningHistory,
    skillStatus,
    hasHistoricalSkillData,
    assessmentHistory,
    readinessOverview,
  } = data || {};

  const activeSkills = skillStatus || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header & Section Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              Truthful Learning Analytics
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Progress & Career Readiness
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Data-driven insights calculated strictly from your persisted application activity.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchProgress}>
          <RefreshCw className="w-4 h-4 mr-1.5 text-slate-500" />
          Refresh Data
        </Button>
      </div>

      {/* SECTION A: Current Career Goal */}
      <Card padding="lg" className="border-indigo-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-medium border border-indigo-400/20">
              <Target className="w-3.5 h-3.5" />
              Active Career Goal
            </div>
            {career ? (
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {career.title}
                </h2>
                <p className="text-xs text-indigo-200/80 mt-1">
                  All skill gap, roadmap, and readiness metrics below correspond strictly to this career target.
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold text-amber-300">No career goal selected.</h2>
                <p className="text-xs text-slate-300 mt-1">
                  Please select a career goal from Onboarding or Settings to enable readiness tracking.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="secondary" size="md" onClick={() => navigate('/dashboard/roadmap')}>
              View Roadmap
            </Button>
            <Button variant="primary" size="md" onClick={() => navigate('/dashboard/assessment')}>
              Take Assessment
            </Button>
          </div>
        </div>
      </Card>

      {/* SECTION B & C: Daily Progress & Learning History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Learning Progress */}
        <Card padding="lg" className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Today's Learning Progress</h3>
            </div>
            {dailyProgress?.hasTasksToday && (
              <Badge variant="indigo" size="sm">
                {dailyProgress.progressPercentage}% Complete
              </Badge>
            )}
          </div>

          {dailyProgress?.hasTasksToday ? (
            <div className="space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-medium text-slate-600">Tasks Completed Today</span>
                <span className="text-2xl font-black text-slate-900">
                  {dailyProgress.completedTasks} / {dailyProgress.totalTasks}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${dailyProgress.progressPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-500">
                Calculated strictly from today's assigned daily tasks and completions.
              </p>
            </div>
          ) : (
            <div className="py-6 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Calendar className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-slate-700">
                No learning tasks scheduled for today.
              </p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Generate tasks from your active roadmap to start building daily learning activity.
              </p>
              <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/learning')} className="mt-2">
                Go to Daily Learning
              </Button>
            </div>
          )}
        </Card>

        {/* Learning History */}
        <Card padding="lg" className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Learning Activity History</h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">Recorded Daily Tasks</span>
          </div>

          {!learningHistory || learningHistory.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <Info className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No learning activity recorded yet.</p>
              <p className="text-xs text-slate-500">
                Completed daily learning tasks will automatically populate your activity log.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3 text-center">Assigned Tasks</th>
                    <th className="py-2.5 px-3 text-center">Completed Tasks</th>
                    <th className="py-2.5 px-3 text-right">Completion %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {learningHistory.map((row) => (
                    <tr key={row.date} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-slate-900">{row.date}</td>
                      <td className="py-2.5 px-3 text-center">{row.totalTasks}</td>
                      <td className="py-2.5 px-3 text-center font-semibold text-indigo-600">{row.completedTasks}</td>
                      <td className="py-2.5 px-3 text-right font-bold">{row.completionPercentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* SECTION D: Skill Status & Skill Gaps */}
      <Card padding="lg" className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Skill Proficiency & Gap Matrix</h3>
            <p className="text-xs text-slate-500">
              Evaluated against requirements for: <span className="font-semibold text-slate-800">{career?.title || 'No Career Selected'}</span>
            </p>
          </div>
          <Badge variant="indigo" size="sm">
            Phase 3C Deterministic Gap Engine
          </Badge>
        </div>

        {!career ? (
          <div className="py-6 text-center text-slate-500 text-sm">
            Select a career goal to evaluate required skill gaps.
          </div>
        ) : activeSkills.length === 0 ? (
          <div className="py-6 text-center text-slate-500 text-sm">
            No required skills defined for this career.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold bg-slate-50/50">
                  <th className="py-3 px-4 rounded-l-lg">Skill Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">Current Level</th>
                  <th className="py-3 px-4 text-center">Required Level</th>
                  <th className="py-3 px-4 text-center">Gap</th>
                  <th className="py-3 px-4 text-right rounded-r-lg">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {activeSkills.map((skill) => (
                  <tr key={skill.skillId} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{skill.skillName}</td>
                    <td className="py-3 px-4 text-slate-500 capitalize">{skill.skillCategory}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded font-semibold ${
                        skill.currentLevel === 0 ? 'bg-slate-100 text-slate-600' :
                        skill.currentLevel === 1 ? 'bg-blue-50 text-blue-700' :
                        skill.currentLevel === 2 ? 'bg-indigo-50 text-indigo-700' :
                        'bg-purple-50 text-purple-700'
                      }`}>
                        {skill.currentLevelLabel}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-medium">{skill.requiredLevelLabel}</td>
                    <td className="py-3 px-4 text-center font-bold">
                      {skill.gap > 0 ? (
                        <span className="text-amber-600">+{skill.gap} level{skill.gap > 1 ? 's' : ''}</span>
                      ) : (
                        <span className="text-emerald-600">Met</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Badge
                        variant={
                          skill.priority === 'Ready' ? 'emerald' :
                          skill.priority === 'Needs Improvement' ? 'amber' : 'rose'
                        }
                        size="sm"
                      >
                        {skill.priority}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Historical Skill Improvement Distinction Notice */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
          <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-slate-600">
            <span className="font-bold text-slate-900 block">Historical Skill Improvement Distinction</span>
            <p>
              The table above represents your <strong>Current Skill Status</strong> based on your latest diagnostic assessment.
            </p>
            <p className="text-slate-500 italic mt-1">
              {!hasHistoricalSkillData && "Skill improvement history will appear after additional assessment history is available."}
            </p>
          </div>
        </div>
      </Card>

      {/* SECTION E: Assessment Score History */}
      <Card padding="lg" className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Assessment Score History</h3>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/assessment')}>
            Take Diagnostic Assessment
          </Button>
        </div>

        {!assessmentHistory || assessmentHistory.items.length === 0 ? (
          <div className="py-6 text-center space-y-2">
            <Award className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No assessment completed yet.</p>
            <p className="text-xs text-slate-500">
              Complete your first skill diagnostic to establish your assessment score history.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Score Delta Highlight */}
            {assessmentHistory.hasEnoughAssessments && assessmentHistory.overallScoreDelta !== null ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
                    Overall Assessment Score Change
                  </span>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Difference between your latest score and your previous diagnostic score.
                  </p>
                </div>
                <div className="text-2xl font-black text-emerald-700">
                  {assessmentHistory.overallScoreDelta >= 0 ? `+${assessmentHistory.overallScoreDelta}%` : `${assessmentHistory.overallScoreDelta}%`}
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-lg bg-amber-50/60 border border-amber-200/80 text-xs text-amber-800 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Assessment improvement history will appear after additional completed assessments.</span>
              </div>
            )}

            {/* Assessment History List */}
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {assessmentHistory.items.map((item, index) => (
                <div key={item.id} className="p-3.5 bg-white flex items-center justify-between text-xs hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center">
                      #{index + 1}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 block">
                        Diagnostic Assessment #{index + 1}
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        Completed on: {new Date(item.completedAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-slate-900 block">
                      {item.scorePercentage}%
                    </span>
                    <span className="text-[10px] text-slate-400">Score Percentage</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* SECTION F: Career Readiness Breakdown (Transparent Components) */}
      <Card padding="lg" className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Career Readiness Breakdown</h3>
          </div>
          <Badge variant="indigo" size="sm">
            Transparent Component Metrics
          </Badge>
        </div>

        {!readinessOverview ? (
          <div className="py-6 text-center text-slate-500 text-sm">
            Not enough data yet. Select a career goal and complete assessments to populate readiness metrics.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-center space-y-1">
                <span className="text-[11px] font-medium text-slate-500 block">Total Required Skills</span>
                <span className="text-xl font-extrabold text-slate-900">{readinessOverview.totalRequiredSkills}</span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-center space-y-1">
                <span className="text-[11px] font-medium text-slate-500 block">Assessed Skills</span>
                <span className="text-xl font-extrabold text-indigo-600">{readinessOverview.assessedSkillsCount}</span>
              </div>

              <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl text-center space-y-1">
                <span className="text-[11px] font-medium text-emerald-800 block">Skills Meeting Req.</span>
                <span className="text-xl font-extrabold text-emerald-700">{readinessOverview.skillsMeetingRequirement}</span>
              </div>

              <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl text-center space-y-1">
                <span className="text-[11px] font-medium text-amber-800 block">Skills Below Req.</span>
                <span className="text-xl font-extrabold text-amber-700">{readinessOverview.skillsBelowRequirement}</span>
              </div>

              <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-xl text-center space-y-1">
                <span className="text-[11px] font-medium text-rose-800 block">High-Priority Gaps</span>
                <span className="text-xl font-extrabold text-rose-700">{readinessOverview.highPriorityGaps}</span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-center space-y-1">
                <span className="text-[11px] font-medium text-slate-500 block">Completed Tasks</span>
                <span className="text-xl font-extrabold text-slate-900">{readinessOverview.totalCompletedTasks}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-500 border border-slate-200/60 flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                These transparent component metrics represent direct application activity and are not an artificial readiness percentage.
              </span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
