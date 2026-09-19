import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { validateEmail, validateRequired } from '@/utils/validation';
import { useAuth } from '@/features/auth';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string | null; password?: string | null }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const emailErr = validateEmail(email);
    const passErr = validateRequired(password, 'Password');

    if (emailErr || passErr) {
      setErrors({ email: emailErr, password: passErr });
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const res = await login(email, password);
      if (res.error) {
        setServerError(res.error);
      } else {
        navigate('/dashboard');
      }
    } catch {
      setServerError('Something went wrong while connecting. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {serverError && (
        <Alert type="error" onClose={() => setServerError(null)}>
          {serverError}
        </Alert>
      )}

      <Input
        label="Email address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        placeholder="you@example.com"
        autoComplete="email"
        required
        leftIcon={<Mail className="w-4 h-4" />}
      />

      <div className="space-y-1">
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          placeholder="••••••••"
          autoComplete="current-password"
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
        <div className="flex justify-end pt-1">
          <Link
            to="/forgot-password"
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
          >
            Forgot your password?
          </Link>
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full justify-center"
        isLoading={isLoading}
        rightIcon={<ArrowRight className="w-4 h-4" />}
      >
        Sign in to your account
      </Button>
    </form>
  );
};
