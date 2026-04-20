import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';

const Login = lazy(() => import('./pages/Login').then((module) => ({ default: module.Login })));
const App = lazy(() => import('./App'));

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
      Loading Lemonade...
    </div>
  );
}

export default function Router() {
  const { user } = useAuth();

  return (
    <ErrorBoundary>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Login route - redirect to home if already logged in */}
          <Route
            path="/login"
            element={user ? <Navigate to="/" replace /> : <Login />}
          />

          {/* App shell handles in-product routes */}
          <Route path="*" element={<App />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
