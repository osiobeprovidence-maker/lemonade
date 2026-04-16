import React from 'react';
import { ArrowLeft, Eye, EyeOff, Lock, Mail } from 'lucide-react';

interface EmailSignupFormProps {
  email: string;
  password: string;
  confirmPassword: string;
  loading: boolean;
  error: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
  onSubmit: (event: React.FormEvent) => void;
  onBack: () => void;
}

export function EmailSignupForm({
  email,
  password,
  confirmPassword,
  loading,
  error,
  showPassword,
  showConfirmPassword,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onTogglePassword,
  onToggleConfirmPassword,
  onSubmit,
  onBack,
}: EmailSignupFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Lemonade</p>
        <h2 className="text-3xl font-black tracking-tight text-zinc-950">Create your account</h2>
      </div>

      {error && <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-zinc-900">Email</span>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              className="h-12 w-full rounded-md border border-gray-300 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-500"
              placeholder="Enter your email"
              required
            />
          </div>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-zinc-900">Password</span>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              className="h-12 w-full rounded-md border border-gray-300 pl-11 pr-16 text-sm outline-none transition focus:border-emerald-500"
              placeholder="Create a password"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-zinc-900">Re-enter Password</span>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(event) => onConfirmPasswordChange(event.target.value)}
              className="h-12 w-full rounded-md border border-gray-300 pl-11 pr-16 text-sm outline-none transition focus:border-emerald-500"
              placeholder="Re-enter your password"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={onToggleConfirmPassword}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </label>
      </div>

      <div className="space-y-3">
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Creating account...' : 'Continue'}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all signup options
        </button>
      </div>
    </form>
  );
}
