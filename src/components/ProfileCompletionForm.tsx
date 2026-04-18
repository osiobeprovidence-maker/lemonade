import React from 'react';
import { ArrowLeft, ChevronDown, Eye, EyeOff, ImagePlus } from 'lucide-react';

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
  profilePhotoUrl: string;
  isUploadingPhoto: boolean;
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
  onProfilePhotoChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
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
  profilePhotoUrl,
  isUploadingPhoto,
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
  onProfilePhotoChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onTogglePassword,
  onToggleConfirmPassword,
  onBack,
  onSubmit,
}: ProfileCompletionFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6 text-white">
      <div className="space-y-3">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-emerald-300/88">Lemonade</p>
        <h2 className="text-[clamp(2rem,5vw,3rem)] font-black leading-[0.95] tracking-[-0.05em] text-white">Complete your profile</h2>
      </div>

      {error && <p className="glass-error rounded-2xl px-4 py-3 text-sm text-red-100">{error}</p>}

      <div className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-white/86">Profile Photo (optional)</span>
          <label className="glass-button flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed p-4 transition-all duration-200 hover:bg-white/18">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-white/10">
              {profilePhotoUrl ? (
                <img src={profilePhotoUrl} alt="Profile preview" className="h-full w-full object-cover" />
              ) : (
                <ImagePlus className="h-5 w-5 text-white/48" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white">
                {isUploadingPhoto ? 'Uploading photo...' : 'Upload a profile photo'}
              </p>
              <p className="text-xs text-white/58">JPG, PNG, or WebP up to 100MB.</p>
            </div>
            <input type="file" accept="image/*" onChange={onProfilePhotoChange} className="hidden" />
          </label>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-white/86">Email</span>
          <input
            type="email"
            value={email}
            readOnly
            className="glass-input h-12 w-full rounded-2xl px-4 text-sm text-white/72 outline-none"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-white/86">Username</span>
          <input
            type="text"
            value={username}
            onChange={(event) => onUsernameChange(event.target.value)}
            className="glass-input h-12 w-full rounded-2xl px-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/34 focus:border-white/28 focus:bg-white/12"
            placeholder="Enter username"
            required
          />
        </label>

        <div className="space-y-2">
          <span className="text-sm font-semibold text-white/86">Birthday</span>
          <div className="grid grid-cols-3 gap-3">
            <SelectField value={birthMonth} onChange={onBirthMonthChange} placeholder="Month" options={MONTHS} required />
            <SelectField value={birthDay} onChange={onBirthDayChange} placeholder="Day" options={DAYS} required />
            <SelectField value={birthYear} onChange={onBirthYearChange} placeholder="Year" options={YEARS} required />
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-sm font-semibold text-white/86">Pronouns (optional)</span>
          <SelectField value={pronouns} onChange={onPronounsChange} placeholder="Select pronouns" options={PRONOUNS} />
        </div>

        {isEmailSignup && (
          <>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-white/86">Password</span>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => onPasswordChange(event.target.value)}
                  className="glass-input h-12 w-full rounded-2xl px-4 pr-16 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/34 focus:border-white/28 focus:bg-white/12"
                  placeholder="Password"
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
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => onConfirmPasswordChange(event.target.value)}
                  className="glass-input h-12 w-full rounded-2xl px-4 pr-16 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/34 focus:border-white/28 focus:bg-white/12"
                  placeholder="Re-enter password"
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
          </>
        )}
      </div>

      <div className="space-y-3">
        <button
          type="submit"
          disabled={loading || isUploadingPhoto}
          className="w-full rounded-2xl bg-white px-4 py-3.5 text-sm font-semibold text-zinc-950 shadow-[0_18px_45px_rgba(0,0,0,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/92 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Saving profile...' : 'Finish signup'}
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

function SelectField({
  value,
  onChange,
  placeholder,
  options,
  required = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: string[];
  required?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="glass-input h-12 w-full appearance-none rounded-2xl bg-transparent px-4 pr-10 text-sm text-white outline-none transition-all duration-200 focus:border-white/28 focus:bg-white/12 invalid:text-white/34"
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option} className="bg-zinc-900">
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/44" />
    </div>
  );
}
