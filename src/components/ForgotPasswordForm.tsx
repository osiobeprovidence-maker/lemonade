import React from 'react';
import { Mail } from 'lucide-react';

interface ForgotPasswordFormProps {
  email: string;
  loading: boolean;
  error: string;
  onEmailChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
}

export function ForgotPasswordForm({
  email,
  loading,
  error,
  onEmailChange,
  onSubmit,
}: ForgotPasswordFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5 text-white">
      {error && <p className="glass-error rounded-2xl px-4 py-3 text-sm text-red-100">{error}</p>}

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-white/86">Email</span>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/44" />
          <input
            type="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            className="glass-input h-12 w-full rounded-2xl pl-11 pr-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/34 focus:border-white/28 focus:bg-white/12"
            placeholder="Enter your account email"
            autoComplete="email"
            autoFocus
            required
          />
        </div>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-white px-4 py-3.5 text-sm font-semibold text-zinc-950 shadow-[0_18px_45px_rgba(0,0,0,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/92 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Sending link...' : 'Send reset link'}
      </button>
    </form>
  );
}
