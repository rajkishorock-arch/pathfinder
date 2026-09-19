import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { validateEmail } from '@/utils/validation';
import { authService } from '@/services/authService';

export const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailErr = validateEmail(email);

    if (emailErr) {
      setError(emailErr);
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await authService.resetPassword(email);
      setIsSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-4 space-y-4">
        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Reset instructions sent</h3>
        <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
          If an account exists for <span className="font-semibold text-slate-800">{email}</span>, you will receive password reset instructions shortly.
        </p>
        <div className="pt-4">
          <Link to="/login">
            <Button variant="outline" className="w-full justify-center">
              Back to login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <p className="text-sm text-slate-600">
        Enter your registered email address below, and we will send you a secure link to reset your password.
      </p>

      <Input
        label="Email address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={error}
        placeholder="you@example.com"
        autoComplete="email"
        required
        leftIcon={<Mail className="w-4 h-4" />}
      />

      <Button
        type="submit"
        variant="primary"
        className="w-full justify-center"
        isLoading={isLoading}
      >
        Send reset link
      </Button>

      <div className="text-center pt-2">
        <Link
          to="/login"
          className="inline-flex items-center text-xs font-medium text-slate-600 hover:text-slate-900 gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to sign in
        </Link>
      </div>
    </form>
  );
};
