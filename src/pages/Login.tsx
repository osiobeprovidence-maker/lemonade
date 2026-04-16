import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown, Eye, EyeOff, Info, Lock, Mail } from 'lucide-react';

type AuthView = 'login' | 'signup-choice' | 'signup-email' | 'signup-profile';

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

const DAYS = Array.from({ length: 31 }, (_, index) => index + 1);
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 100 }, (_, index) => CURRENT_YEAR - index);
const PRONOUN_OPTIONS = ['She/Her', 'He/Him', 'They/Them', 'She/They', 'He/They', 'Prefer not to say'];

export function Login() {
  const navigate = useNavigate();
  const { user, userProfile, signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithApple, updateUserProfile } = useAuth();
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!username.trim() && (userProfile?.displayName || user?.displayName)) {
      setUsername(userProfile?.displayName || user?.displayName || '');
    }
  }, [user?.displayName, userProfile?.displayName, username]);

  useEffect(() => {
    if (user && userProfile?.onboardingCompleted && view === 'signup-profile') {
      navigate('/');
    }
  }, [navigate, user, userProfile?.onboardingCompleted, view]);

  const resetError = () => setError('');

  const switchToLogin = () => {
    resetError();
    setView('login');
  };

  const switchToSignup = () => {
    resetError();
    setView('signup-choice');
  };

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      resetError();
      const result = await signInWithGoogle();
      if (view === 'login') {
        navigate('/');
        return;
      }
      if (result.requiresProfileCompletion || !userProfile?.onboardingCompleted) {
        setView('signup-profile');
        return;
      }
      navigate('/');
    } catch (authError: any) {
      console.error('Google auth failed:', authError);
      setError(authError.message || 'Failed to continue with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleAuth = async () => {
    try {
      setLoading(true);
      resetError();
      const result = await signInWithApple();
      if (view === 'login') {
        navigate('/');
        return;
      }
      if (result.requiresProfileCompletion || !userProfile?.onboardingCompleted) {
        setView('signup-profile');
        return;
      }
      navigate('/');
    } catch (authError: any) {
      console.error('Apple auth failed:', authError);
      setError(authError.message || 'Failed to continue with Apple');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    resetError();

    try {
      await signInWithEmail(email, password);
      navigate('/');
    } catch (authError: any) {
      console.error('Email login failed:', authError);
      setError(authError.message || 'Failed to log in');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    resetError();

    try {
      await signUpWithEmail(email, password);
      setView('signup-profile');
    } catch (authError: any) {
      console.error('Email signup failed:', authError);
      setError(authError.message || 'Failed to create your account');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    resetError();

    if (!username.trim()) {
      setError('Please enter a username.');
      return;
    }

    if (!birthMonth || !birthDay || !birthYear) {
      setError('Please complete your birthday.');
      return;
    }

    if (!acceptedTerms) {
      setError('You need to agree to the Terms of Service and Privacy Policy.');
      return;
    }

    try {
      setLoading(true);
      await updateUserProfile({
        displayName: username.trim(),
        birthMonth,
        birthDay: Number(birthDay),
        birthYear: Number(birthYear),
        pronouns: pronouns || undefined,
        marketingEmails,
        acceptedTerms: true,
        onboardingCompleted: true,
      });
      navigate('/');
    } catch (profileError: any) {
      console.error('Profile completion failed:', profileError);
      setError(profileError.message || 'Failed to complete your signup');
    } finally {
      setLoading(false);
    }
  };

  const renderPrimaryButton = (label: string, onClick: () => void, icon: React.ReactNode) => (
    <motion.button
      type="button"
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      disabled={loading}
      className="flex w-full items-center justify-center gap-3 rounded-full border border-zinc-900 bg-white px-6 py-3.5 text-base font-semibold text-zinc-900 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {icon}
      <span>{label}</span>
    </motion.button>
  );

  return (
    <div className="min-h-screen bg-stone-100 px-4 py-10 md:px-8 md:py-16">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.08)] md:grid-cols-[1.05fr_0.95fr]"
        >
          <section className="relative hidden overflow-hidden bg-[linear-gradient(160deg,#fef3c7_0%,#fde68a_38%,#f59e0b_100%)] p-10 text-zinc-900 md:flex md:flex-col md:justify-between">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.75),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(120,53,15,0.18),transparent_30%)]" />
            <div className="relative">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-zinc-800/70">Lemonade</p>
              <h1 className="max-w-sm text-5xl font-black leading-[0.95] tracking-tight">
                Stories worth
                <br />
                staying for.
              </h1>
              <p className="mt-6 max-w-md text-base leading-7 text-zinc-800/80">
                Create your account, set up your reader identity, and jump straight into the next chapter.
              </p>
            </div>
            <div className="relative rounded-[1.75rem] bg-white/70 p-6 backdrop-blur-sm">
              <p className="text-sm font-medium leading-7 text-zinc-700">
                Your signup now finishes with a quick profile step so every new Lemonade account starts with the same onboarding flow, whether you use Google, Apple, or email.
              </p>
            </div>
          </section>

          <section className="flex items-center justify-center p-6 sm:p-8 md:p-10">
            <div className="w-full max-w-md">
              <div className="mb-8 text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-600">Lemonade</p>
                <h2 className="mt-4 text-4xl font-black leading-tight tracking-tight text-zinc-950">
                  {view === 'login' && 'Welcome back'}
                  {view === 'signup-choice' && 'Sign up to join Lemonade'}
                  {view === 'signup-email' && 'Create your email account'}
                  {view === 'signup-profile' && 'Finish your profile'}
                </h2>
                <p className="mt-3 text-sm leading-6 text-zinc-500">
                  {view === 'login' && 'Log in with email, Google, or Apple.'}
                  {view === 'signup-choice' && 'Start with Google, Apple, or email. Then we will collect your profile details next.'}
                  {view === 'signup-email' && 'Step 1 of 2. Set your email and password first.'}
                  {view === 'signup-profile' && 'Step 2 of 2. This follows for every signup method.'}
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                >
                  {error}
                </motion.div>
              )}

              {view === 'login' && (
                <>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-zinc-900">Email</span>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                        <input
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          className="h-14 w-full rounded-2xl border border-stone-300 bg-stone-50 pl-12 pr-4 text-sm outline-none transition focus:border-zinc-900 focus:bg-white"
                          required
                        />
                      </div>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-zinc-900">Password</span>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          className="h-14 w-full rounded-2xl border border-stone-300 bg-stone-50 pl-12 pr-12 text-sm outline-none transition focus:border-zinc-900 focus:bg-white"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((current) => !current)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-zinc-700"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </label>

                    <motion.button
                      type="submit"
                      whileTap={{ scale: 0.985 }}
                      disabled={loading}
                      className="w-full rounded-full bg-zinc-950 px-6 py-4 text-base font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? 'Logging in...' : 'Log in with email'}
                    </motion.button>
                  </form>

                  <div className="my-6 flex items-center gap-4">
                    <div className="h-px flex-1 bg-stone-200" />
                    <span className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-400">Or</span>
                    <div className="h-px flex-1 bg-stone-200" />
                  </div>

                  <div className="space-y-3">
                    {renderPrimaryButton(
                      'Continue with Google',
                      handleGoogleAuth,
                      <img src="https://www.google.com/favicon.ico" alt="Google" className="h-5 w-5" />,
                    )}
                    {renderPrimaryButton(
                      'Continue with Apple',
                      handleAppleAuth,
                      <svg viewBox="0 0 384 512" className="h-5 w-5 fill-current">
                        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                      </svg>,
                    )}
                  </div>

                  <p className="mt-8 text-center text-sm text-zinc-500">
                    Don&apos;t have an account?{' '}
                    <button type="button" onClick={switchToSignup} className="font-semibold text-zinc-950 underline-offset-4 hover:underline">
                      Sign up
                    </button>
                  </p>
                </>
              )}

              {view === 'signup-choice' && (
                <>
                  <div className="space-y-3">
                    {renderPrimaryButton(
                      'Sign up with Google',
                      handleGoogleAuth,
                      <img src="https://www.google.com/favicon.ico" alt="Google" className="h-5 w-5" />,
                    )}
                    {renderPrimaryButton(
                      'Sign up with Apple',
                      handleAppleAuth,
                      <svg viewBox="0 0 384 512" className="h-5 w-5 fill-current">
                        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                      </svg>,
                    )}
                  </div>

                  <div className="my-6 flex items-center gap-4">
                    <div className="h-px flex-1 bg-stone-200" />
                    <span className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-400">Or</span>
                    <div className="h-px flex-1 bg-stone-200" />
                  </div>

                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.985 }}
                    onClick={() => {
                      resetError();
                      setView('signup-email');
                    }}
                    className="w-full rounded-full bg-zinc-950 px-6 py-4 text-base font-semibold text-white transition hover:bg-zinc-800"
                  >
                    Sign up with email
                  </motion.button>

                  <p className="mt-8 text-center text-sm text-zinc-500">
                    I already have an account{' '}
                    <button type="button" onClick={switchToLogin} className="font-semibold text-zinc-950 underline-offset-4 hover:underline">
                      Log in
                    </button>
                  </p>
                </>
              )}

              {view === 'signup-email' && (
                <>
                  <form onSubmit={handleEmailSignup} className="space-y-4">
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-zinc-900">Email</span>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                        <input
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          className="h-14 w-full rounded-2xl border border-stone-300 bg-stone-50 pl-12 pr-4 text-sm outline-none transition focus:border-zinc-900 focus:bg-white"
                          required
                        />
                      </div>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-zinc-900">Password</span>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a password"
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          className="h-14 w-full rounded-2xl border border-stone-300 bg-stone-50 pl-12 pr-12 text-sm outline-none transition focus:border-zinc-900 focus:bg-white"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((current) => !current)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-zinc-700"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </label>

                    <motion.button
                      type="submit"
                      whileTap={{ scale: 0.985 }}
                      disabled={loading}
                      className="w-full rounded-full bg-zinc-950 px-6 py-4 text-base font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? 'Creating account...' : 'Continue'}
                    </motion.button>
                  </form>

                  <p className="mt-8 text-center text-sm text-zinc-500">
                    <button type="button" onClick={switchToSignup} className="font-semibold text-zinc-950 underline-offset-4 hover:underline">
                      Back to signup options
                    </button>
                  </p>
                </>
              )}

              {view === 'signup-profile' && (
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-900">
                      Username
                      <Info size={15} className="text-zinc-500" />
                    </span>
                    <input
                      type="text"
                      placeholder="Enter username"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      className="h-14 w-full rounded-xl border border-zinc-900 bg-white px-4 text-sm outline-none transition focus:border-amber-500"
                      required
                    />
                  </label>

                  <div>
                    <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-900">
                      Birthday
                      <Info size={15} className="text-zinc-500" />
                    </span>
                    <div className="grid grid-cols-3 gap-3">
                      <SelectField value={birthMonth} onChange={setBirthMonth} placeholder="Month" options={MONTHS} />
                      <SelectField value={birthDay} onChange={setBirthDay} placeholder="Day" options={DAYS.map(String)} />
                      <SelectField value={birthYear} onChange={setBirthYear} placeholder="Year" options={YEARS.map(String)} />
                    </div>
                  </div>

                  <div>
                    <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-900">
                      Pronouns (optional)
                      <Info size={15} className="text-zinc-500" />
                    </span>
                    <SelectField value={pronouns} onChange={setPronouns} placeholder="Pronouns (optional)" options={PRONOUN_OPTIONS} />
                  </div>

                  <label className="flex items-start gap-3 rounded-2xl p-1">
                    <input
                      type="checkbox"
                      checked={marketingEmails}
                      onChange={(event) => setMarketingEmails(event.target.checked)}
                      className="mt-1 h-5 w-5 rounded border-stone-300 text-zinc-950 focus:ring-zinc-900"
                    />
                    <span className="text-sm leading-6 text-zinc-700">
                      <span className="font-medium text-zinc-900">Yes, I&apos;d like to receive marketing emails from Lemonade. (optional)</span>
                      <br />
                      Get story recommendations, announcements, offers, and more via email. Unsubscribe anytime.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 rounded-2xl p-1">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(event) => setAcceptedTerms(event.target.checked)}
                      className="mt-1 h-5 w-5 rounded border-stone-300 text-zinc-950 focus:ring-zinc-900"
                      required
                    />
                    <span className="text-sm leading-6 text-zinc-700">
                      <span className="font-medium text-zinc-900">Yes, I have read and agree to Lemonade&apos;s Terms of Service and Privacy Policy.</span>
                    </span>
                  </label>

                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.985 }}
                    disabled={loading}
                    className="w-full rounded-full bg-zinc-950 px-6 py-4 text-base font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? 'Finishing signup...' : 'Sign up'}
                  </motion.button>
                </form>
              )}
            </div>
          </section>
        </motion.div>
      </div>
    </div>
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
        className="h-14 w-full appearance-none rounded-xl border border-stone-200 bg-stone-50 px-4 pr-10 text-sm text-zinc-900 outline-none transition focus:border-zinc-900 focus:bg-white"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
    </div>
  );
}
