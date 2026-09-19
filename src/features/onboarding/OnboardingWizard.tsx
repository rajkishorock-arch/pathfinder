import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, GraduationCap, Briefcase, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { OnboardingState } from '@/types';
import { useAuth } from '@/features/auth';
import { validateRequired } from '@/utils/validation';

export const OnboardingWizard: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const { user, completeOnboarding } = useAuth();

  const [formData, setFormData] = useState<OnboardingState>({
    step: 1,
    name: user?.name || '',
    educationLevel: 'undergraduate',
    field: 'computer-science',
    careerGoalId: 'software-developer',
    availableHoursPerDay: 2,
    experienceLevel: 'beginner',
  });

  const [stepError, setStepError] = useState<string | null>(null);

  const careerGoals = [
    {
      id: 'software-developer',
      title: 'Software Developer',
      desc: 'Build full-stack web applications, REST APIs, and backend architectures.',
      icon: <Briefcase className="w-5 h-5 text-indigo-600" />,
    },
    {
      id: 'data-scientist',
      title: 'Data Scientist',
      desc: 'Analyze data models, train predictive algorithms, and draw insights.',
      icon: <Sparkles className="w-5 h-5 text-indigo-600" />,
    },
    {
      id: 'devops-engineer',
      title: 'DevOps / Cloud Engineer',
      desc: 'Automate CI/CD pipelines, container orchestration, and cloud infrastructure.',
      icon: <Clock className="w-5 h-5 text-indigo-600" />,
    },
    {
      id: 'frontend-engineer',
      title: 'Frontend Engineer',
      desc: 'Craft crisp, accessible user interfaces, animations, and web design systems.',
      icon: <GraduationCap className="w-5 h-5 text-indigo-600" />,
    },
  ];

  const handleNext = () => {
    setStepError(null);

    // Validate current step
    if (formData.step === 1) {
      const err = validateRequired(formData.name, 'Your name');
      if (err) {
        setStepError(err);
        return;
      }
    } else if (formData.step === 3) {
      const err = validateRequired(formData.field, 'Field or branch');
      if (err) {
        setStepError(err);
        return;
      }
    }

    if (formData.step < 6) {
      setFormData((prev) => ({ ...prev, step: prev.step + 1 }));
    } else {
      completeOnboarding(formData);
      if (onComplete) onComplete();
    }
  };

  const handleBack = () => {
    setStepError(null);
    if (formData.step > 1) {
      setFormData((prev) => ({ ...prev, step: prev.step - 1 }));
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full mx-auto p-6 sm:p-8">
      {/* Step Header Indicator */}
      <div className="mb-6">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          <span>Step {formData.step} of 6</span>
          <span>{Math.round((formData.step / 6) * 100)}% Completed</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-indigo-600 h-full transition-all duration-300 ease-out"
            style={{ width: `${(formData.step / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Name */}
      {formData.step === 1 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">What should we call you?</h2>
            <p className="text-sm text-slate-600 mt-1">
              We will personalize your roadmap dashboard with your preferred name.
            </p>
          </div>
          <Input
            label="Your full name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={stepError}
            placeholder="Alex Morgan"
            required
          />
        </div>
      )}

      {/* Step 2: Education Level */}
      {formData.step === 2 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">What is your education level?</h2>
            <p className="text-sm text-slate-600 mt-1">
              This helps tailor module depth and fundamental prerequisites.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {[
              { id: 'high-school', label: 'High School Student' },
              { id: 'undergraduate', label: 'Undergraduate Degree (B.Tech, B.S., B.C.A)' },
              { id: 'postgraduate', label: 'Postgraduate Degree (M.Tech, M.S., M.C.A)' },
              { id: 'working-professional', label: 'Working Professional / Self-Taught' },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setFormData({ ...formData, educationLevel: option.id })}
                className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all min-h-[52px] ${
                  formData.educationLevel === option.id
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-600/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <span className="text-sm font-medium">{option.label}</span>
                {formData.educationLevel === option.id && (
                  <CheckCircle className="w-5 h-5 text-indigo-600 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Field / Branch */}
      {formData.step === 3 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">What is your field or branch of study?</h2>
            <p className="text-sm text-slate-600 mt-1">
              Enter your current specialization or academic background.
            </p>
          </div>
          <Input
            label="Field or Branch"
            value={formData.field}
            onChange={(e) => setFormData({ ...formData, field: e.target.value })}
            error={stepError}
            placeholder="e.g. Computer Science, Mechanical Engineering, Information Tech"
            required
          />
        </div>
      )}

      {/* Step 4: Career Goal */}
      {formData.step === 4 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Choose your primary career goal</h2>
            <p className="text-sm text-slate-600 mt-1">
              Select the role you are aiming to land. You can adjust this later.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {careerGoals.map((goal) => (
              <button
                key={goal.id}
                type="button"
                onClick={() => setFormData({ ...formData, careerGoalId: goal.id })}
                className={`p-4 rounded-xl border text-left flex items-start gap-3.5 transition-all min-h-[64px] ${
                  formData.careerGoalId === goal.id
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-600/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="p-2 rounded-lg bg-white border border-slate-200 shrink-0 mt-0.5">
                  {goal.icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold">{goal.title}</span>
                    {formData.careerGoalId === goal.id && (
                      <CheckCircle className="w-5 h-5 text-indigo-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{goal.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 5: Learning Time */}
      {formData.step === 5 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">How much time can you learn daily?</h2>
            <p className="text-sm text-slate-600 mt-1">
              We use this to pace your daily milestones realistically.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { hours: 1, label: '30 - 60 min', title: 'Casual Pace' },
              { hours: 2, label: '1 - 2 hours', title: 'Steady Pace' },
              { hours: 4, label: '3+ hours', title: 'Accelerated' },
            ].map((time) => (
              <button
                key={time.hours}
                type="button"
                onClick={() => setFormData({ ...formData, availableHoursPerDay: time.hours })}
                className={`p-4 rounded-xl border text-center transition-all ${
                  formData.availableHoursPerDay === time.hours
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-600/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="text-lg font-bold text-slate-900 mb-1">{time.label}</div>
                <div className="text-xs text-slate-500">{time.title}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 6: Experience Level */}
      {formData.step === 6 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">What is your current experience level?</h2>
            <p className="text-sm text-slate-600 mt-1">
              Be honest—this ensures we don't make you repeat topics you already master.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {[
              {
                id: 'beginner',
                title: 'Beginner / Starting Fresh',
                desc: 'Little to no previous experience with programming or target core concepts.',
              },
              {
                id: 'intermediate',
                title: 'Intermediate / Basic Familiarity',
                desc: 'Know fundamental syntax, basic data types, and simple algorithms.',
              },
              {
                id: 'advanced',
                title: 'Advanced / Ready for Polish',
                desc: 'Experienced with major tools; looking for deep gap analysis & career readiness.',
              },
            ].map((exp) => (
              <button
                key={exp.id}
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    experienceLevel: exp.id as 'beginner' | 'intermediate' | 'advanced',
                  })
                }
                className={`p-4 rounded-xl border text-left flex items-start justify-between transition-all ${
                  formData.experienceLevel === exp.id
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-600/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div>
                  <div className="text-sm font-semibold">{exp.title}</div>
                  <div className="text-xs text-slate-500 mt-1">{exp.desc}</div>
                </div>
                {formData.experienceLevel === exp.id && (
                  <CheckCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5 ml-3" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Action Buttons */}
      <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
        {formData.step > 1 ? (
          <Button variant="outline" onClick={handleBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
        ) : (
          <div />
        )}
        <Button
          variant="primary"
          onClick={handleNext}
          rightIcon={
            formData.step === 6 ? <CheckCircle className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />
          }
        >
          {formData.step === 6 ? 'Complete Onboarding' : 'Continue'}
        </Button>
      </div>
    </div>
  );
};
