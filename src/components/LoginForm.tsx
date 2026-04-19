import React from 'react';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import type { AuthMethod } from './LastLoginMethodHint';

interface LoginFormProps {
  email: string;
  password: string;
  loading: boolean;
  error: string;
  showPassword: boolean;
  lastLoginMethod: AuthMethod | null;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onSubmit: (event: React.FormEvent) => void;
  onForgotPassword: () => void;
  onProviderSelect: (method: 'google' | 'apple') => void;
}

function ProviderButton({
  method,
  loading,
  isRecommended,
  onClick,
}: {
  method: 'google' | 'apple';
  loading: boolean;
  isRecommended: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`glass-button flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/18 disabled:cursor-not-allowed disabled:opacity-60 ${
        isRecommended ? 'border-primary/30 ring-1 ring-primary/20' : ''
      }`}
    >
      <span className="flex items-center gap-3">
        {method === 'google' ? (
          <img src="https://www.google.com/favicon.ico" alt="" className="h-4 w-4" />
        ) : (
          <svg viewBox="0 0 384 512" className="h-4 w-4 fill-current" aria-hidden="true">
            <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
          </svg>
        )}
        {method === 'google' ? 'Continue with Google' : 'Continue with Apple'}
      </span>
      {isRecommended && <span className="rounded-full bg-primary/18 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200">Last used</span>}
    </button>
  );
}

export function LoginForm({
  email,
  password,
  loading,
  error,
  showPassword,
  lastLoginMethod,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
  onForgotPassword,
  onProviderSelect,
}: LoginFormProps) {
  const providerOrder: Array<'google' | 'apple'> = lastLoginMethod === 'apple' ? ['apple', 'google'] : ['google', 'apple'];

  return (
    <form onSubmit={onSubmit} className="space-y-5 text-white">
      {error && <p className="glass-error rounded-2xl px-4 py-3 text-sm text-red-100">{error}</p>}

      <div className="space-y-3">
        {providerOrder.map((method) => (
          <ProviderButton
            key={method}
            method={method}
            loading={loading}
            isRecommended={lastLoginMethod === method}
            onClick={() => onProviderSelect(method)}
          />
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-white/36">or use email</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <div className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-white/86">Email</span>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/44" />
            <input
              type="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              className={`glass-input h-12 w-full rounded-2xl pl-11 pr-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/34 focus:border-white/28 focus:bg-white/12 ${
                lastLoginMethod === 'email' ? 'border-primary/30 ring-1 ring-primary/20' : ''
              }`}
              placeholder="you@domain.com"
              autoComplete="email"
              autoFocus={lastLoginMethod === 'email'}
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

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-white px-4 py-3.5 text-sm font-semibold text-zinc-950 shadow-[0_18px_45px_rgba(0,0,0,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/92 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Logging in...' : 'Log in'}
      </button>
    </form>
  );
}
