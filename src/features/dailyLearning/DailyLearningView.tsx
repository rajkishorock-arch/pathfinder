import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, Clock, Compass, RefreshCw, Loader2, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { dailyLearningService, type DailyLearningTask } from '@/services/dailyLearningService';

export const DailyLearningView: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<DailyLearningTask[]>([]);
  const [hasActiveRoadmap, setHasActiveRoadmap] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [togglingTaskId, setTogglingTaskId] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    const { data, error, hasActiveRoadmap: activeRm } = await dailyLearningService.getTodayTasks();
    if (!error && data) {
      setTasks(data);
    }
    setHasActiveRoadmap(activeRm);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleGenerateTasks = async () => {
    setIsGenerating(true);
    await dailyLearningService.generateTodayTasks();
    await loadTasks();
    setIsGenerating(false);
  };

  const handleToggleTask = async (task: DailyLearningTask) => {
    setTogglingTaskId(task.id);
    if (task.is_completed) {
      await dailyLearningService.uncompleteTask(task.id);
    } else {
      await dailyLearningService.completeTask(task.id);
    }
    await loadTasks();
    setTogglingTaskId(null);
  };

  const completedCount = tasks.filter((t) => t.is_completed).length;
  const totalCount = tasks.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (isLoading) {
    return (
      <Card padding="lg">
        <div className="flex items-center justify-center py-12 gap-3 text-slate-500 text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
          <span>Loading today's learning tasks...</span>
        </div>
      </Card>
    );
  }

  if (!hasActiveRoadmap) {
    return (
      <Card padding="lg" className="text-center py-12 space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <Compass className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900">Create your roadmap to start daily learning</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Daily tasks are deterministically derived from your active learning roadmap. Generate a roadmap to unlock daily learning goals.
          </p>
        </div>
        <div>
          <Button variant="primary" size="md" onClick={() => navigate('/dashboard/roadmap')}>
            <Compass className="w-4 h-4 mr-2" />
            View Roadmap
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <Card padding="lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                Deterministic Daily Learning Engine
              </span>
              <Badge variant="indigo" size="sm">
                Phase 3E
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-indigo-600" />
              Today's Learning Tasks
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateTasks}
              disabled={isGenerating}

            >
              <RefreshCw className={`w-4 h-4 mr-1.5 ${isGenerating ? 'animate-spin' : ''}`} />
              {tasks.length > 0 ? 'Regenerate Tasks' : "Generate Today's Tasks"}
            </Button>
          </div>
        </div>

        {/* Progress Bar Header */}
        {totalCount > 0 && (
          <div className="pt-4 space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-600 font-medium">
              <span>Today's Progress</span>
              <span className="font-bold text-slate-900">
                {completedCount} of {totalCount} completed ({progressPercentage}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Task List or Empty State */}
      {totalCount === 0 ? (
        <Card padding="lg" className="text-center py-12 space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">No learning tasks for today</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Click below to generate today's learning tasks from your active roadmap items.
            </p>
          </div>
          <div>
            <Button variant="primary" size="md" onClick={handleGenerateTasks} disabled={isGenerating}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
              Generate Today's Tasks
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const isToggling = togglingTaskId === task.id;
            return (
              <Card
                key={task.id}
                padding="md"
                className={`transition-colors ${
                  task.is_completed ? 'bg-slate-50/70 border-slate-200' : 'bg-white border-slate-200 hover:border-indigo-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleTask(task)}
                      disabled={isToggling}
                      aria-label={task.is_completed ? `Mark task ${task.title} as incomplete` : `Mark task ${task.title} as complete`}
                      className="mt-0.5 text-slate-400 hover:text-indigo-600 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 rounded-full transition-colors"
                    >
                      {isToggling ? (
                        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                      ) : task.is_completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 hover:text-indigo-600" />
                      )}
                    </button>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-sm font-semibold ${
                            task.is_completed ? 'text-slate-500 line-through' : 'text-slate-900'
                          }`}
                        >
                          {task.title}
                        </span>
                        {task.stage_number && (
                          <Badge variant="neutral" size="sm">
                            Stage {task.stage_number}
                          </Badge>
                        )}
                        <Badge variant="indigo" size="sm">
                          {task.category}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-600">{task.topic}</p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.estimated_minutes} mins (Estimated)
                        </span>
                        {task.is_completed && task.completed_at && (
                          <span className="text-emerald-600 font-medium">
                            Completed at {new Date(task.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="self-end sm:self-center">
                    <Button
                      variant={task.is_completed ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => handleToggleTask(task)}
                      disabled={isToggling}
                    >
                      {isToggling ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : task.is_completed ? (
                        'Completed'
                      ) : (
                        'Complete'
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
