import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle2, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { dailyLearningService, type DailyLearningTask } from '@/services/dailyLearningService';

export const DailyLearningCard: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<DailyLearningTask[]>([]);
  const [hasActiveRoadmap, setHasActiveRoadmap] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  async function loadTasks() {
    setIsLoading(true);
    const { data, error, hasActiveRoadmap: activeRm } = await dailyLearningService.getTodayTasks();
    if (!error && data) {
      setTasks(data);
    }
    setHasActiveRoadmap(activeRm);
    setIsLoading(false);
  }

  useEffect(() => {
    loadTasks();
  }, []);

  const handleGenerate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsGenerating(true);
    await dailyLearningService.generateTodayTasks();
    await loadTasks();
    setIsGenerating(false);
  };

  const completedCount = tasks.filter((t) => t.is_completed).length;
  const totalCount = tasks.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (isLoading) {
    return (
      <Card padding="md">
        <div className="flex items-center justify-center py-6 gap-2 text-slate-400 text-xs">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
          <span>Loading today's learning progress...</span>
        </div>
      </Card>
    );
  }

  if (!hasActiveRoadmap) {
    return (
      <Card padding="md" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Today's Learning</h3>
          </div>
          <Badge variant="neutral" size="sm">
            Phase 3E
          </Badge>
        </div>
        <p className="text-xs text-slate-500">No active roadmap found. Create your roadmap to start daily learning.</p>
        <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/dashboard/roadmap')}>
          View Roadmap
        </Button>
      </Card>
    );
  }

  return (
    <Card padding="md" className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Today's Learning</h3>
            <p className="text-[11px] text-slate-500">
              {totalCount > 0 ? `${completedCount} of ${totalCount} tasks completed` : 'No tasks generated today'}
            </p>
          </div>
        </div>

        <Badge variant={completedCount === totalCount && totalCount > 0 ? 'emerald' : 'indigo'} size="sm">
          {progressPercentage}%
        </Badge>
      </div>

      {totalCount > 0 && (
        <div className="space-y-1">
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {totalCount > 0 ? (
        <div className="space-y-2">
          {tasks.slice(0, 3).map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-100"
            >
              <div className="flex items-center gap-2 truncate">
                <CheckCircle2
                  className={`w-3.5 h-3.5 flex-shrink-0 ${
                    task.is_completed ? 'text-emerald-600' : 'text-slate-300'
                  }`}
                />
                <span className={`truncate ${task.is_completed ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'}`}>
                  {task.title}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 flex-shrink-0 ml-2">
                {task.estimated_minutes}m (Est.)
              </span>
            </div>
          ))}

          <div className="flex items-center gap-2 pt-1">
            <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => navigate('/dashboard/learning')}>
              View All Tasks
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2 pt-1">
          <Button variant="primary" size="sm" className="w-full text-xs" onClick={handleGenerate} disabled={isGenerating}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isGenerating ? 'animate-spin' : ''}`} />
            Generate Today's Tasks
          </Button>
        </div>
      )}
    </Card>
  );
};
