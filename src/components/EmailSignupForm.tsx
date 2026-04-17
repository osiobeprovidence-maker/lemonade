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
    <form onSubmit={onSubmit} className="space-y-6 text-white">
      <div className="space-y-3">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-emerald-300/88">Lemonade</p>
        <h2 className="text-[clamp(2rem,5vw,3rem)] font-black leading-[0.95] tracking-[-0.05em] text-white">Create your account</h2>
      </div>

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
              placeholder="Enter your email"
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
              placeholder="Create a password"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-white/54 transition hover:text-white"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-white/86">Re-enter Password</span>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/44" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(event) => onConfirmPasswordChange(event.target.value)}
              className="glass-input h-12 w-full rounded-2xl pl-11 pr-16 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/34 focus:border-white/28 focus:bg-white/12"
              placeholder="Re-enter your password"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={onToggleConfirmPassword}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-white/54 transition hover:text-white"
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
          className="w-full rounded-2xl bg-white px-4 py-3.5 text-sm font-semibold text-zinc-950 shadow-[0_18px_45px_rgba(0,0,0,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/92 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Creating account...' : 'Continue'}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-white/62 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all signup options
        </button>
      </div>
    </form>
  );
}
