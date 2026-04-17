import React from 'react';
import { Mail, ArrowLeft } from 'lucide-react';

type AuthMethod = 'email' | 'google' | 'apple';

interface SignupOptionsProps {
  loading: boolean;
  onSelect: (method: AuthMethod) => void;
  onBack: () => void;
}

export function SignupOptions({ loading, onSelect, onBack }: SignupOptionsProps) {
  return (
    <div className="space-y-6 text-white">
      <div className="space-y-3">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-emerald-300/88">Lemonade</p>
        <h2 className="text-[clamp(2rem,5vw,3rem)] font-black leading-[0.95] tracking-[-0.05em] text-white">Sign up</h2>
        <p className="max-w-md text-sm leading-6 text-white/68 sm:text-[0.95rem]">Create your account without leaving the page. Pick your preferred path and finish setup in one lightweight flow.</p>
      </div>

      <div className="space-y-3.5">
        <button
          type="button"
          onClick={() => onSelect('email')}
          disabled={loading}
          className="glass-button flex w-full items-center justify-center gap-3 rounded-2xl px-4 py-4 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.01] hover:bg-white/18 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Mail className="h-4 w-4" />
          Continue with Email
        </button>
        <button
          type="button"
          onClick={() => onSelect('google')}
          disabled={loading}
          className="glass-button flex w-full items-center justify-center gap-3 rounded-2xl px-4 py-4 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.01] hover:bg-white/18 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="h-4 w-4" />
          Continue with Google
        </button>
        <button
          type="button"
          onClick={() => onSelect('apple')}
          disabled={loading}
          className="glass-button flex w-full items-center justify-center gap-3 rounded-2xl px-4 py-4 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.01] hover:bg-white/18 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg viewBox="0 0 384 512" className="h-4 w-4 fill-current">
            <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
          </svg>
          Continue with Apple
        </button>
      </div>

      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-white/62 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to all signup options
      </button>
    </div>
  );
}
