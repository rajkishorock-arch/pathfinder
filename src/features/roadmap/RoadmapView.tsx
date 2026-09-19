import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Award, RefreshCw, Loader2, AlertCircle, Compass, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/features/auth';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { roadmapService, type RoadmapData } from '@/services/roadmapService';
import { skillGapService } from '@/services/skillGapService';

export const RoadmapView: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [hasCareer, setHasCareer] = useState<boolean>(true);
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState<boolean>(true);
  const [allGapsSatisfied, setAllGapsSatisfied] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadRoadmapAndCheckState() {
      if (!user || !isSupabaseConfigured) return;
      setIsLoading(true);
      setErrorMessage(null);

      try {
        // 1. Check profile career_goal_id
        const { data: profile } = await supabase
          .from('profiles')
          .select('career_goal_id')
          .eq('id', user.id)
          .maybeSingle();

        const careerGoalId = (profile as { career_goal_id: string | null } | null)?.career_goal_id;
        if (!careerGoalId) {
          if (isMounted) {
            setHasCareer(false);
            setIsLoading(false);
          }
          return;
        }
        if (isMounted) setHasCareer(true);

        // 2. Check completed assessment count
        const { data: assessments } = await supabase
          .from('assessments')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'completed');

        if (!assessments || assessments.length === 0) {
          if (isMounted) {
            setHasCompletedAssessment(false);
            setIsLoading(false);
          }
          return;
        }
        if (isMounted) setHasCompletedAssessment(true);

        // 3. Check active roadmap matching current career goal
        const activeData = await roadmapService.getActiveRoadmap(user.id, careerGoalId);
        if (!isMounted) return;

        if (activeData && activeData.items.length > 0) {
          setRoadmap(activeData);
          setAllGapsSatisfied(false);
        } else {
          // Check skill gap overview to see if all gaps are 0
          const gaps = await skillGapService.getUserSkillGaps(user.id, careerGoalId);
          if (!isMounted) return;
          if (gaps && gaps.totalSkills > 0 && gaps.readyCount === gaps.totalSkills) {
            setAllGapsSatisfied(true);
          }
        }
      } catch (e: unknown) {
        console.error('Error loading roadmap view state:', e);
        if (isMounted) setErrorMessage('Failed to load roadmap context.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadRoadmapAndCheckState();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleGenerateOrUpdateRoadmap = async () => {
    if (!user) return;
    setIsGenerating(true);
    setErrorMessage(null);

    const { success, error } = await roadmapService.generateOrUpdateRoadmap();
    if (!success) {
      setErrorMessage(error || 'Failed to generate roadmap.');
      setIsGenerating(false);
      return;
    }

    const updated = await roadmapService.getActiveRoadmap(user.id);
    if (updated) {
      setRoadmap(updated);
    }
    setIsGenerating(false);
  };

  if (isLoading) {
    return (
      <Card padding="lg" className="max-w-3xl mx-auto my-12 text-center py-16">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-sm font-medium text-slate-600">Loading learning roadmap...</p>
        </div>
      </Card>
    );
  }

  // EMPTY STATE A: NO CAREER GOAL SELECTED
  if (!hasCareer) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <Card padding="lg" className="text-center py-12 space-y-4">
          <div className="p-4 rounded-full bg-indigo-50 text-indigo-600 inline-flex">
            <Target className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Choose a career goal to create your roadmap.</h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Select a target career in your student profile settings to define required technical skill levels and baseline learning path.
          </p>
          <div className="pt-2">
            <Button variant="primary" onClick={() => navigate('/dashboard')}>
              Go to Profile Settings
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // EMPTY STATE B: NO COMPLETED ASSESSMENT
  if (!hasCompletedAssessment) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <Card padding="lg" className="text-center py-12 space-y-4">
          <div className="p-4 rounded-full bg-amber-50 text-amber-600 inline-flex">
            <Award className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Take the baseline assessment to identify your skill gaps.</h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Complete your diagnostic skill evaluation so Pathfinder can calculate your deterministic learning sequence.
          </p>
          <div className="pt-2">
            <Button variant="primary" onClick={() => navigate('/dashboard/assessment')}>
              Take Assessment
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // EMPTY STATE C: ALL SKILLS SATISFIED (GAP = 0)
  if (allGapsSatisfied && (!roadmap || roadmap.items.length === 0)) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <Card padding="lg" className="text-center py-12 space-y-4">
          <div className="p-4 rounded-full bg-emerald-50 text-emerald-600 inline-flex">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Your current skills meet the defined requirements for this career.</h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            All required skills for your selected career goal are satisfied based on your latest completed assessment.
          </p>
          <div className="pt-2">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              View Skill Breakdown
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // EMPTY STATE D: ASSESSMENT COMPLETED BUT ROADMAP NOT YET CREATED
  if (!roadmap || roadmap.items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <Card padding="lg" className="text-center py-12 space-y-4">
          <div className="p-4 rounded-full bg-indigo-50 text-indigo-600 inline-flex">
            <Compass className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Your skill gaps are ready for roadmap generation.</h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Generate your deterministic learning sequence based on your latest completed assessment results.
          </p>

          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm max-w-md mx-auto text-left">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="pt-2">
            <Button variant="primary" disabled={isGenerating} onClick={handleGenerateOrUpdateRoadmap}>
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating Roadmap...
                </>
              ) : (
                'Create My Roadmap'
              )}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ACTIVE ROADMAP VIEW
  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6">
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Header */}
      <Card padding="lg" className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                Deterministic Learning Plan
              </span>
              <Badge variant="indigo" size="sm">
                Phase 3D
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{roadmap.careerTitle} Roadmap</h1>
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={isGenerating}
            onClick={handleGenerateOrUpdateRoadmap}
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Updating...' : 'Update My Roadmap'}
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <span>Status: <strong className="text-slate-800 capitalize">{roadmap.status}</strong></span>
          <span>Learning Sequence Items: <strong className="text-slate-800">{roadmap.items.length} Step(s)</strong></span>
          <span>Last Updated: <strong className="text-slate-800">{new Date(roadmap.updatedAt).toLocaleDateString()}</strong></span>
        </div>
      </Card>

      {/* Timeline Sequence */}
      <div className="space-y-4">
        {roadmap.items.map((item) => (
          <Card key={item.id} padding="md" hoverEffect className="relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 text-white font-extrabold text-sm shrink-0 shadow-xs">
                {item.stageNumber}
              </div>

              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                  <Badge variant="neutral" size="sm">
                    {item.skillName}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
