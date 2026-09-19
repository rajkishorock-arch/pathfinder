import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { validateEmail, validatePassword, validateRequired } from '@/utils/validation';
import { useAuth } from '@/features/auth';

export const SignupForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [errors, setErrors] = useState<{
    name?: string | null;
    email?: string | null;
    password?: string | null;
    confirmPassword?: string | null;
    terms?: string | null;
  }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const passwordVal = validatePassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setSuccessInfo(null);

    const nameErr = validateRequired(name, 'Full name');
    const emailErr = validateEmail(email);
    const passErr = passwordVal.feedback;
    const confirmErr = password !== confirmPassword ? 'Passwords do not match.' : null;
    const termsErr = !acceptedTerms ? 'You must agree to the Terms and Privacy Policy.' : null;

    if (nameErr || emailErr || passErr || confirmErr || termsErr) {
      setErrors({
        name: nameErr,
        email: emailErr,
        password: passErr,
        confirmPassword: confirmErr,
        terms: termsErr,
      });
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const res = await signup(name, email, password);
      if (res.error) {
        setServerError(res.error);
      } else {
        navigate('/dashboard');
      }
    } catch {
      setServerError('An error occurred during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {serverError && (
        <Alert type="error" onClose={() => setServerError(null)}>
          {serverError}
        </Alert>
      )}

      {successInfo && (
        <Alert type="info" onClose={() => setSuccessInfo(null)}>
          {successInfo}
        </Alert>
      )}

      <Input
        label="Full name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        placeholder="Jane Doe"
        autoComplete="name"
        required
        leftIcon={<User className="w-4 h-4" />}
      />

      <Input
        label="Email address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        placeholder="jane@example.com"
        autoComplete="email"
        required
        leftIcon={<Mail className="w-4 h-4" />}
      />

      <div>
        <Input
          label="Create password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          placeholder="At least 6 characters"
          autoComplete="new-password"
          required
          leftIcon={<Lock className="w-4 h-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded p-1"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />

        {/* Password Strength Indicator */}
        {password.length > 0 && (
          <div className="mt-2 space-y-1">
            <div className="flex gap-1 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  passwordVal.score >= 1 ? 'bg-rose-500 w-1/4' : 'w-0'
                }`}
              />
              <div
                className={`h-full transition-all ${
                  passwordVal.score >= 2 ? 'bg-amber-500 w-1/4' : 'w-0'
                }`}
              />
              <div
                className={`h-full transition-all ${
                  passwordVal.score >= 3 ? 'bg-emerald-500 w-1/4' : 'w-0'
                }`}
              />
              <div
                className={`h-full transition-all ${
                  passwordVal.score >= 4 ? 'bg-emerald-600 w-1/4' : 'w-0'
                }`}
              />
            </div>
            <p className="text-xs text-slate-500">
              Include letters, numbers, and symbols for a strong password.
            </p>
          </div>
        )}
      </div>

      <Input
        label="Confirm password"
        type={showPassword ? 'text' : 'password'}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={errors.confirmPassword}
        placeholder="Re-enter your password"
        autoComplete="new-password"
        required
        leftIcon={<Lock className="w-4 h-4" />}
      />

      <div className="pt-1">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-xs text-slate-600">
            I agree to the{' '}
            <Link to="/terms" className="text-indigo-600 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-indigo-600 hover:underline">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        {errors.terms && <p className="mt-1 text-xs text-rose-600">{errors.terms}</p>}
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full justify-center"
        isLoading={isLoading}
        rightIcon={<ArrowRight className="w-4 h-4" />}
      >
        Create free account
      </Button>
    </form>
  );
};
