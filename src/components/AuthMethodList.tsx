import { Mail } from 'lucide-react';
import type { AuthMethod } from './LastSignInMethodHint';

interface AuthMethodListProps {
  mode: 'create' | 'login';
  loading: boolean;
  lastSignInMethod: AuthMethod | null;
  onEmailSelect: () => void;
  onProviderSelect: (method: 'google' | 'apple') => void;
}

function MethodIcon({ method }: { method: AuthMethod }) {
  if (method === 'email') {
    return <Mail className="h-4 w-4" />;
  }

  if (method === 'google') {
    return <img src="https://www.google.com/favicon.ico" alt="" className="h-4 w-4" />;
  }

  return (
    <svg viewBox="0 0 384 512" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

const METHOD_LABEL: Record<AuthMethod, string> = {
  email: 'Continue with Email',
  google: 'Continue with Google',
  apple: 'Continue with Apple',
};

function orderedMethods(lastSignInMethod: AuthMethod | null) {
  const methods: AuthMethod[] = ['email', 'google', 'apple'];
  if (!lastSignInMethod) return methods;

  return [lastSignInMethod, ...methods.filter((method) => method !== lastSignInMethod)];
}

export function AuthMethodList({
  mode,
  loading,
  lastSignInMethod,
  onEmailSelect,
  onProviderSelect,
}: AuthMethodListProps) {
  const methods: AuthMethod[] = mode === 'login' ? orderedMethods(lastSignInMethod) : ['email', 'google', 'apple'];

  return (
    <div className="space-y-3">
      {methods.map((method) => {
        const isRecommended = mode === 'login' && lastSignInMethod === method;
        const handleClick = method === 'email' ? onEmailSelect : () => onProviderSelect(method);

        return (
          <button
            key={method}
            type="button"
            onClick={handleClick}
            disabled={loading}
            className={`glass-button flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/18 disabled:cursor-not-allowed disabled:opacity-60 ${
              isRecommended ? 'border-primary/30 ring-1 ring-primary/20' : ''
            }`}
          >
            <span className="flex items-center gap-3">
              <MethodIcon method={method} />
              {METHOD_LABEL[method]}
            </span>
            {isRecommended && (
              <span className="rounded-full bg-primary/18 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200">
                Last used
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
