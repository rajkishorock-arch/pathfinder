import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '@/features/auth';
import { AppRoutes } from '@/routes/AppRoutes';

export const App: React.FC = () => {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
};

export default App;
