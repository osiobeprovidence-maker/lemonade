import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { auth } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { AuthMethodList } from './AuthMethodList';
import { AuthModeToggle } from './AuthModeToggle';
import { EmailLoginForm } from './EmailLoginForm';
import { EmailSignupForm } from './EmailSignupForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { LastSignInMethodHint, type AuthMethod } from './LastSignInMethodHint';
import { ResetSentState } from './ResetSentState';

type AuthMode = 'create' | 'login';
type AuthSubstep = 'methods' | 'email-form' | 'forgot-password' | 'reset-sent';

const AUTH_MODE_STORAGE_KEY = 'lemonade:last-auth-mode';
const SIGN_IN_METHOD_STORAGE_KEY = 'lemonade:last-sign-in-method';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultView?: 'create-account' | 'login';
}

function readStorageValue<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function inferInitialMode(defaultView?: 'create-account' | 'login', hasLastSignInMethod?: boolean): AuthMode {
  if (defaultView === 'create-account') return 'create';
  if (defaultView === 'login') return 'login';

  const storedMode = readStorageValue<AuthMode | null>(AUTH_MODE_STORAGE_KEY, null);
  if (storedMode === 'create' || storedMode === 'login') return storedMode;

  return hasLastSignInMethod ? 'login' : 'create';
}

export function AuthModal({ open, onClose, onSuccess, defaultView }: AuthModalProps) {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithApple, sendPasswordReset, user, userProfile } = useAuth();
  const createUser = useMutation(api.users.createUser);
  const updateUserProfileMutation = useMutation(api.users.updateUserProfile);
  const [mode, setMode] = useState<AuthMode>('create');
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
    if (!open) return;

    const nextMode = inferInitialMode(defaultView, Boolean(lastSignInMethod));
    setMode(nextMode);
    setSubstep('methods');
    setCreateAccountName(userProfile?.displayName || user?.displayName || '');
    setEmail(user?.email || '');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setLoading(false);
    setError('');
  }, [defaultView, lastSignInMethod, open, user?.displayName, user?.email, userProfile?.displayName]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  useEffect(() => {
    if (!open || typeof window === 'undefined') return;
    window.localStorage.setItem(AUTH_MODE_STORAGE_KEY, JSON.stringify(mode));
  }, [mode, open]);

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
    onSuccess();
    onClose();
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
        onSuccess();
        onClose();
      }
    } catch (providerError: any) {
      setError(providerError?.message || `Could not continue with ${method}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (event: React.FormEvent) => {
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
    } catch (signupError: any) {
      setError(signupError?.message || 'Could not create your account.');
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
      onSuccess();
      onClose();
    } catch (loginError: any) {
      setError(loginError?.message || 'Could not sign you in.');
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
    } catch (resetError: any) {
      setError(resetError?.message || 'Could not send a reset link right now.');
    } finally {
      setLoading(false);
    }
  };

  const panelCopy = useMemo(() => {
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
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-md"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(158,255,191,0.12),transparent_28%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.08),transparent_24%)]" />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className="glass-modal relative max-h-[90vh] w-full max-w-md overflow-hidden rounded-[24px] text-white"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-heading"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close account access modal"
              className="glass-button absolute right-4 top-4 z-10 rounded-full p-2 text-white/72 transition-all duration-200 hover:scale-105 hover:bg-white/18 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top_left,rgba(158,255,191,0.22),transparent_58%)]" />
            <div className="max-h-[90vh] overflow-y-auto px-5 py-6 sm:px-6 sm:py-7">
              <div className="space-y-4">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-emerald-300/88">Lemonade</p>
                <div className="space-y-3">
                  <h2 id="auth-modal-heading" className="text-[clamp(2rem,5vw,3rem)] font-black leading-[0.95] tracking-[-0.05em] text-white">
                    {panelCopy.heading}
                  </h2>
                  <p className="max-w-md text-sm leading-6 text-white/68 sm:text-[0.95rem]">{panelCopy.subtext}</p>
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
                      onSubmit={handleCreateAccount}
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
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
