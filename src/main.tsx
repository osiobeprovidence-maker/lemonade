import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { AuthProvider } from './contexts/AuthContext';
import Router from './Router';
import './index.css';

const convexUrl = import.meta.env.VITE_CONVEX_URL || 'https://strong-salamander-825.eu-west-1.convex.cloud/';
const convex = new ConvexReactClient(convexUrl);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ConvexProvider client={convex}>
        <AuthProvider>
          <Router />
        </AuthProvider>
      </ConvexProvider>
    </BrowserRouter>
  </StrictMode>,
);
