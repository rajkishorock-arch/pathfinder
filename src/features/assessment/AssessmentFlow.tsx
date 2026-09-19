import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, CheckCircle2, ChevronRight, ChevronLeft, Loader2, AlertCircle, Award } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/features/auth';
import { assessmentService, type AssessmentQuestion, type AssessmentResult } from '@/services/assessmentService';

export const AssessmentFlow: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<'intro' | 'questions' | 'submitting' | 'result'>('intro');
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSavingAnswer, setIsSavingAnswer] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load questions on mount
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      setErrorMessage(null);

      const qs = await assessmentService.getQuestionsWithOptions();
      if (!isMounted) return;

      if (qs.length === 0) {
        setErrorMessage('No assessment questions found. Please contact support.');
        setIsLoading(false);
        return;
      }

      setQuestions(qs);
      setIsLoading(false);
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Start or recover active assessment session
  const handleStartAssessment = async () => {
    if (!user) return;
    setIsLoading(true);
    setErrorMessage(null);

    const { assessmentId: activeId, error } = await assessmentService.getOrCreateActiveAssessment(user.id);
    if (error || !activeId) {
      setErrorMessage(error || 'Failed to initialize assessment session.');
      setIsLoading(false);
      return;
    }

    setAssessmentId(activeId);

    // Load any existing submitted answers for recovery
    const existingAnswers = await assessmentService.getExistingAnswers(activeId);
    setAnswers(existingAnswers);

    setStep('questions');
    setIsLoading(false);
  };

  const handleSelectOption = async (questionId: string, optionId: string) => {
    if (!assessmentId || !user || isSavingAnswer) return;

    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    setIsSavingAnswer(true);

    const { error } = await assessmentService.saveAnswer(assessmentId, questionId, optionId, user.id);
    if (error) {
      console.warn('Failed to save answer auto-save:', error);
    }
    setIsSavingAnswer(false);
  };

  const handleSubmitAssessment = async () => {
    if (!assessmentId || !user) return;
    setStep('submitting');
    setErrorMessage(null);

    // Ensure final current question answer is saved
    const currentQ = questions[currentQuestionIndex];
    if (currentQ && answers[currentQ.id]) {
      await assessmentService.saveAnswer(assessmentId, currentQ.id, answers[currentQ.id], user.id);
    }

    const { result: evalResult, error } = await assessmentService.submitAndScoreAssessment(assessmentId);

    if (error || !evalResult) {
      setErrorMessage(error || 'Failed to score assessment.');
      setStep('questions');
      return;
    }

    setResult(evalResult);
    setStep('result');
  };

  if (isLoading) {
    return (
      <Card padding="lg" className="max-w-2xl mx-auto my-12 text-center py-16">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-sm font-medium text-slate-600">Loading diagnostic assessment...</p>
        </div>
      </Card>
    );
  }

  // 1. INTRO STEP
  if (step === 'intro') {
    return (
      <div className="max-w-3xl mx-auto space-y-6 py-6">
        <Card padding="lg" className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">Skill Diagnostic Assessment</h1>
                <Badge variant="indigo" size="sm">Phase 3B</Badge>
              </div>
              <p className="text-xs text-slate-500">Measure your baseline knowledge across target technical domain skills</p>
            </div>
          </div>

          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-4 text-sm text-slate-600">
            <p>
              This baseline assessment will test your foundational concepts in <strong>Python Programming</strong> and <strong>SQL & DBMS</strong>.
            </p>
            <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs border border-slate-200/60">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span>Total Questions: {questions.length}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span>Estimated Time: ~5 minutes</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span>Evaluation: Immediate deterministic database scoring</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleStartAssessment}>
              Start Assessment
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // 2. SUBMITTING STEP
  if (step === 'submitting') {
    return (
      <Card padding="lg" className="max-w-2xl mx-auto my-12 text-center py-16">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <h2 className="text-lg font-bold text-slate-900">Evaluating Your Answers...</h2>
          <p className="text-sm text-slate-500">Comparing responses against protected benchmark answer criteria.</p>
        </div>
      </Card>
    );
  }

  // 3. RESULT STEP
  if (step === 'result' && result) {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <Card padding="lg" className="text-center space-y-6">
          <div className="inline-flex p-4 rounded-full bg-emerald-50 text-emerald-600 mb-2">
            <Award className="w-12 h-12" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900">Assessment Complete!</h1>
            <p className="text-sm text-slate-500">Your baseline skill evaluation has been recorded successfully.</p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 max-w-sm mx-auto space-y-4">
            <div>
              <div className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">
                Final Score
              </div>
              <div className="text-4xl font-extrabold text-indigo-600">
                {result.scorePercentage}%
              </div>
            </div>

            <div className="flex justify-center gap-6 pt-3 border-t border-slate-200/60 text-xs">
              <div>
                <span className="text-slate-500 block">Correct</span>
                <span className="font-bold text-slate-800 text-sm">{result.correctAnswers}</span>
              </div>
              <div className="border-r border-slate-200" />
              <div>
                <span className="text-slate-500 block">Total Questions</span>
                <span className="font-bold text-slate-800 text-sm">{result.totalQuestions}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-center">
            <Button variant="primary" size="lg" onClick={() => navigate('/dashboard')}>
              Continue to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // 4. QUESTIONS STEP
  const currentQuestion = questions[currentQuestionIndex];
  const selectedOptionId = answers[currentQuestion.id] || '';
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6">
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Progress Header */}
      <div className="flex justify-between items-center bg-white border border-slate-200 rounded-xl px-6 py-4 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <Badge variant="neutral" size="sm">
            {currentQuestion.difficulty}
          </Badge>
        </div>
        {isSavingAnswer && (
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" /> Auto-saving...
          </span>
        )}
      </div>

      {/* Question Card */}
      <Card padding="lg" className="space-y-6">
        <h2 className="text-lg font-bold text-slate-900 leading-snug">
          {currentQuestion.questionText}
        </h2>

        <div className="space-y-3">
          {currentQuestion.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            return (
              <label
                key={opt.id}
                onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
                className={`flex items-start gap-3.5 p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  checked={isSelected}
                  onChange={() => {}}
                  className="mt-1 text-indigo-600 focus:ring-indigo-500 h-4 w-4 border-slate-300"
                />
                <span className={`text-sm font-medium ${isSelected ? 'text-indigo-950 font-semibold' : 'text-slate-700'}`}>
                  {opt.optionText}
                </span>
              </label>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
          <Button
            variant="outline"
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          {isLastQuestion ? (
            <Button
              variant="primary"
              disabled={!selectedOptionId}
              onClick={handleSubmitAssessment}
            >
              Submit Assessment
            </Button>
          ) : (
            <Button
              variant="primary"
              disabled={!selectedOptionId}
              onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
