import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import App from './App';

export default function Router() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public route - everyone sees homepage first */}
      <Route path="/" element={<App />} />
      
      {/* Login route - redirect to home if already logged in */}
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />
      
      {/* Catch all redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
