import React from 'react';
import { ArrowLeft, Eye, EyeOff, Lock, Mail } from 'lucide-react';

interface EmailLoginFormProps {
  email: string;
  password: string;
  loading: boolean;
  error: string;
  showPassword: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onSubmit: (event: React.FormEvent) => void;
  onForgotPassword: () => void;
  onBack: () => void;
}

export function EmailLoginForm({
  email,
  password,
  loading,
  error,
  showPassword,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
  onForgotPassword,
  onBack,
}: EmailLoginFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5 text-white">
      {error && <p className="glass-error rounded-2xl px-4 py-3 text-sm text-red-100">{error}</p>}

      <div className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-white/86">Email</span>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/44" />
            <input
              type="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              className="glass-input h-12 w-full rounded-2xl pl-11 pr-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/34 focus:border-white/28 focus:bg-white/12"
              placeholder="you@domain.com"
              autoComplete="email"
              autoFocus
              required
            />
          </div>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-white/86">Password</span>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/44" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              className="glass-input h-12 w-full rounded-2xl pl-11 pr-16 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/34 focus:border-white/28 focus:bg-white/12"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/54 transition hover:text-white"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </label>
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm font-medium text-white/62 transition hover:text-white"
        >
          Forgot password?
        </button>
      </div>

      <div className="space-y-3">
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-white px-4 py-3.5 text-sm font-semibold text-zinc-950 shadow-[0_18px_45px_rgba(0,0,0,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/92 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-white/62 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to methods
        </button>
      </div>
    </form>
  );
}
