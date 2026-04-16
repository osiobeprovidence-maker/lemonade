import React from 'react';
import { ArrowLeft, ChevronDown, Eye, EyeOff } from 'lucide-react';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DAYS = Array.from({ length: 31 }, (_, index) => String(index + 1));
const YEARS = Array.from({ length: 100 }, (_, index) => String(new Date().getFullYear() - index));
const PRONOUNS = ['She/Her', 'He/Him', 'They/Them', 'She/They', 'He/They', 'Prefer not to say'];

interface ProfileCompletionFormProps {
  email: string;
  username: string;
  birthMonth: string;
  birthDay: string;
  birthYear: string;
  pronouns: string;
  password: string;
  confirmPassword: string;
  isEmailSignup: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
  loading: boolean;
  error: string;
  onUsernameChange: (value: string) => void;
  onBirthMonthChange: (value: string) => void;
  onBirthDayChange: (value: string) => void;
  onBirthYearChange: (value: string) => void;
  onPronounsChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
  onBack: () => void;
  onSubmit: (event: React.FormEvent) => void;
}

export function ProfileCompletionForm({
  email,
  username,
  birthMonth,
  birthDay,
  birthYear,
  pronouns,
  password,
  confirmPassword,
  isEmailSignup,
  showPassword,
  showConfirmPassword,
  loading,
  error,
  onUsernameChange,
  onBirthMonthChange,
  onBirthDayChange,
  onBirthYearChange,
  onPronounsChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onTogglePassword,
  onToggleConfirmPassword,
  onBack,
  onSubmit,
}: ProfileCompletionFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Lemonade</p>
        <h2 className="text-3xl font-black tracking-tight text-zinc-950">Complete your profile</h2>
      </div>

      {error && <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-zinc-900">Email</span>
          <input
            type="email"
            value={email}
            readOnly
            className="h-12 w-full rounded-md border border-gray-300 bg-zinc-50 px-4 text-sm text-zinc-600 outline-none"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-zinc-900">Username</span>
          <input
            type="text"
            value={username}
            onChange={(event) => onUsernameChange(event.target.value)}
            className="h-12 w-full rounded-md border border-gray-300 px-4 text-sm outline-none transition focus:border-emerald-500"
            placeholder="Enter username"
            required
          />
        </label>

        <div className="space-y-2">
          <span className="text-sm font-semibold text-zinc-900">Birthday</span>
          <div className="grid grid-cols-3 gap-3">
            <SelectField value={birthMonth} onChange={onBirthMonthChange} placeholder="Month" options={MONTHS} />
            <SelectField value={birthDay} onChange={onBirthDayChange} placeholder="Day" options={DAYS} />
            <SelectField value={birthYear} onChange={onBirthYearChange} placeholder="Year" options={YEARS} />
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-sm font-semibold text-zinc-900">Pronouns (optional)</span>
          <SelectField value={pronouns} onChange={onPronounsChange} placeholder="Select pronouns" options={PRONOUNS} />
        </div>

        {isEmailSignup && (
          <>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-zinc-900">Password</span>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => onPasswordChange(event.target.value)}
                  className="h-12 w-full rounded-md border border-gray-300 px-4 pr-16 text-sm outline-none transition focus:border-emerald-500"
                  placeholder="Password"
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
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => onConfirmPasswordChange(event.target.value)}
                  className="h-12 w-full rounded-md border border-gray-300 px-4 pr-16 text-sm outline-none transition focus:border-emerald-500"
                  placeholder="Re-enter password"
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
          </>
        )}
      </div>

      <div className="space-y-3">
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Saving profile...' : 'Finish signup'}
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

function SelectField({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full appearance-none rounded-md border border-gray-300 bg-white px-4 pr-10 text-sm outline-none transition focus:border-emerald-500"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
    </div>
  );
}
