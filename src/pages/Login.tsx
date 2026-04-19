import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { auth } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { AuthMethodList } from '../components/AuthMethodList';
import { AuthModeToggle } from '../components/AuthModeToggle';
import { EmailLoginForm } from '../components/EmailLoginForm';
import { EmailSignupForm } from '../components/EmailSignupForm';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm';
import { LastSignInMethodHint, type AuthMethod } from '../components/LastSignInMethodHint';
import { ResetSentState } from '../components/ResetSentState';

type AuthMode = 'create' | 'login';
type AuthSubstep = 'methods' | 'email-form' | 'forgot-password' | 'reset-sent';

const AUTH_MODE_STORAGE_KEY = 'lemonade:last-auth-mode';
const SIGN_IN_METHOD_STORAGE_KEY = 'lemonade:last-sign-in-method';

function readStorageValue<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function Login() {
  const navigate = useNavigate();
  const { user, userProfile, signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithApple, sendPasswordReset } = useAuth();
  const createUser = useMutation(api.users.createUser);
  const updateUserProfileMutation = useMutation(api.users.updateUserProfile);
  const [mode, setMode] = useState<AuthMode>(() => readStorageValue<AuthMode>(AUTH_MODE_STORAGE_KEY, 'login'));
  const [substep, setSubstep] = useState<AuthSubstep>('methods');
  const [lastSignInMethod, setLastSignInMethod] = useState<AuthMethod | null>(() => readStorageValue<AuthMethod | null>(SIGN_IN_METHOD_STORAGE_KEY, null));
  const [createAccountName, setCreateAccountName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setCreateAccountName(userProfile?.displayName || user?.displayName || '');
    setEmail(user?.email || '');
  }, [user?.displayName, user?.email, userProfile?.displayName]);

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [navigate, user]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(AUTH_MODE_STORAGE_KEY, JSON.stringify(mode));
  }, [mode]);

  const persistLastSignInMethod = (method: AuthMethod) => {
    setLastSignInMethod(method);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SIGN_IN_METHOD_STORAGE_KEY, JSON.stringify(method));
    }
  };

  const switchMode = (nextMode: AuthMode) => {
    setError('');
    setMode(nextMode);
    setSubstep('methods');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const finalizeAccount = async (method: AuthMethod, preferredName?: string) => {
    const firebaseUser = auth.currentUser;
    const displayName = preferredName?.trim() || firebaseUser?.displayName || userProfile?.displayName || firebaseUser?.email?.split('@')[0] || 'Lemonade Reader';

    if (!firebaseUser) throw new Error('We could not complete your account. Please try again.');

    await createUser({
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email || email || undefined,
      displayName,
      photoURL: firebaseUser.photoURL || undefined,
    });

    await updateUserProfileMutation({
      firebaseUid: firebaseUser.uid,
      displayName,
      photoURL: firebaseUser.photoURL || undefined,
      acceptedTerms: true,
      onboardingCompleted: true,
    });

    persistLastSignInMethod(method);
    navigate('/', { replace: true });
  };

  const handleProviderAccess = async (method: 'google' | 'apple', activeMode: AuthMode) => {
    setError('');

    try {
      setLoading(true);
      const result = method === 'google' ? await signInWithGoogle() : await signInWithApple();

      if (activeMode === 'create' || result.requiresProfileCompletion) {
        await finalizeAccount(method);
      } else {
        persistLastSignInMethod(method);
        navigate('/', { replace: true });
      }
    } catch (authError: any) {
      setError(authError?.message || `Failed to continue with ${method}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!createAccountName.trim()) {
      setError('Your name helps us set up your account.');
      return;
    }

    if (!email.trim()) {
      setError('A valid email is required.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await signUpWithEmail(email.trim(), password);
      await finalizeAccount('email', createAccountName);
    } catch (authError: any) {
      setError(authError?.message || 'Failed to create your account.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('A valid email is required.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      await signInWithEmail(email.trim(), password);
      persistLastSignInMethod('email');
      navigate('/', { replace: true });
    } catch (authError: any) {
      setError(authError?.message || 'Failed to log in.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('A valid email is required.');
      return;
    }

    try {
      setLoading(true);
      await sendPasswordReset(email.trim());
      setSubstep('reset-sent');
    } catch (authError: any) {
      setError(authError?.message || 'Failed to send reset instructions.');
    } finally {
      setLoading(false);
    }
  };

  const pageCopy = useMemo(() => {
    if (mode === 'create' && substep === 'methods') {
      return {
        heading: 'Create account',
        subtext: 'Start reading on Lemonade with one calm, fast account flow.',
      };
    }

    if (mode === 'login' && substep === 'methods') {
      return {
        heading: 'Welcome back',
        subtext: 'Sign in and continue where you left off.',
      };
    }

    if (mode === 'create' && substep === 'email-form') {
      return {
        heading: 'Create account with email',
        subtext: 'Set up your account in a few quick steps.',
      };
    }

    if (mode === 'login' && substep === 'email-form') {
      return {
        heading: 'Sign in with email',
        subtext: 'Enter your details to continue reading.',
      };
    }

    if (substep === 'forgot-password') {
      return {
        heading: 'Reset password',
        subtext: 'Enter your email and we’ll send a reset link.',
      };
    }

    return {
      heading: 'Check your inbox',
      subtext: 'If that email is connected to an account, we’ve sent reset instructions.',
    };
  }, [mode, substep]);

  const viewKey = `${mode}-${substep}`;

  return (
    <div className="min-h-screen overflow-hidden bg-[#050506]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(158,255,191,0.12),transparent_28%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.08),transparent_24%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10 md:px-8 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-modal w-full max-w-md overflow-hidden rounded-[24px] text-white"
        >
          <section className="relative px-5 py-6 sm:px-6 sm:py-7">
            <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top_left,rgba(158,255,191,0.22),transparent_58%)]" />
            <div className="relative space-y-4">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-emerald-300/88">Lemonade</p>
              <div className="space-y-3">
                <h1 className="text-[clamp(2rem,5vw,3rem)] font-black leading-[0.95] tracking-[-0.05em] text-white">
                  {pageCopy.heading}
                </h1>
                <p className="max-w-md text-sm leading-6 text-white/68 sm:text-[0.95rem]">{pageCopy.subtext}</p>
              </div>

              {(substep === 'methods' || substep === 'email-form') && (
                <div className="flex flex-col items-start gap-3">
                  <AuthModeToggle value={mode} onChange={switchMode} />
                  {mode === 'login' && substep === 'methods' && <LastSignInMethodHint method={lastSignInMethod} />}
                </div>
              )}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={viewKey}
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.22 }}
                className="mt-6"
              >
                {substep === 'methods' && (
                  <AuthMethodList
                    mode={mode}
                    loading={loading}
                    lastSignInMethod={lastSignInMethod}
                    onEmailSelect={() => {
                      setError('');
                      setSubstep('email-form');
                    }}
                    onProviderSelect={(method) => handleProviderAccess(method, mode)}
                  />
                )}

                {mode === 'create' && substep === 'email-form' && (
                  <EmailSignupForm
                    name={createAccountName}
                    email={email}
                    password={password}
                    confirmPassword={confirmPassword}
                    loading={loading}
                    error={error}
                    showPassword={showPassword}
                    showConfirmPassword={showConfirmPassword}
                    onNameChange={setCreateAccountName}
                    onEmailChange={setEmail}
                    onPasswordChange={setPassword}
                    onConfirmPasswordChange={setConfirmPassword}
                    onTogglePassword={() => setShowPassword((current) => !current)}
                    onToggleConfirmPassword={() => setShowConfirmPassword((current) => !current)}
                    onSubmit={handleEmailSignup}
                    onBack={() => {
                      setError('');
                      setSubstep('methods');
                    }}
                  />
                )}

                {mode === 'login' && substep === 'email-form' && (
                  <EmailLoginForm
                    email={email}
                    password={password}
                    loading={loading}
                    error={error}
                    showPassword={showPassword}
                    onEmailChange={setEmail}
                    onPasswordChange={setPassword}
                    onTogglePassword={() => setShowPassword((current) => !current)}
                    onSubmit={handleLogin}
                    onForgotPassword={() => {
                      setError('');
                      setSubstep('forgot-password');
                    }}
                    onBack={() => {
                      setError('');
                      setSubstep('methods');
                    }}
                  />
                )}

                {mode === 'login' && substep === 'forgot-password' && (
                  <ForgotPasswordForm
                    email={email}
                    loading={loading}
                    error={error}
                    onEmailChange={setEmail}
                    onSubmit={handlePasswordReset}
                    onBack={() => {
                      setError('');
                      setSubstep('email-form');
                    }}
                  />
                )}

                {mode === 'login' && substep === 'reset-sent' && (
                  <ResetSentState
                    onBackToLogin={() => {
                      setError('');
                      setSubstep('methods');
                    }}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {mode === 'create' && (
              <p className="mt-5 text-center text-sm text-white/62">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="font-semibold text-white transition hover:text-emerald-200"
                >
                  Log in
                </button>
              </p>
            )}

            {mode === 'login' && substep !== 'forgot-password' && substep !== 'reset-sent' && (
              <p className="mt-5 text-center text-sm text-white/62">
                Need an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('create')}
                  className="font-semibold text-white transition hover:text-emerald-200"
                >
                  Create one
                </button>
              </p>
            )}
          </section>
        </motion.div>
      </div>
    </div>
  );
}
