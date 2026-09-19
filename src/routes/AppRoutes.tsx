import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

// Public Pages
import { LandingPage } from '@/pages/public/LandingPage';
import { AboutPage } from '@/pages/public/AboutPage';
import { HowItWorksPage } from '@/pages/public/HowItWorksPage';
import { CareersPage } from '@/pages/public/CareersPage';

// Auth Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';

// Dashboard Pages
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { AssessmentPage } from '@/pages/dashboard/AssessmentPage';
import { RoadmapPage } from '@/pages/dashboard/RoadmapPage';
import { DailyLearningPage } from '@/pages/dashboard/DailyLearningPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

import { useAuth } from '@/features/auth';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const UnauthenticatedOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/careers" element={<CareersPage />} />
      </Route>

      {/* Auth Pages */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <UnauthenticatedOnlyRoute>
              <LoginPage />
            </UnauthenticatedOnlyRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <UnauthenticatedOnlyRoute>
              <SignupPage />
            </UnauthenticatedOnlyRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* Dashboard Protected Pages */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/learning" element={<DailyLearningPage />} />
        <Route path="/dashboard/assessment" element={<AssessmentPage />} />
        <Route path="/dashboard/roadmap" element={<RoadmapPage />} />
        <Route path="/dashboard/*" element={<DashboardPage />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
