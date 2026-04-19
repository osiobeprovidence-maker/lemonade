import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { auth } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { AuthToggle } from './AuthToggle';
import { CreateAccountForm } from './CreateAccountForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { LastLoginMethodHint, type AuthMethod } from './LastLoginMethodHint';
import { LoginForm } from './LoginForm';

type AuthView = 'create-account' | 'login' | 'forgot-password' | 'reset-sent';

const AUTH_VIEW_STORAGE_KEY = 'lemonade:last-auth-view';
const LOGIN_METHOD_STORAGE_KEY = 'lemonade:last-login-method';

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

function inferInitialView(defaultView?: 'create-account' | 'login', hasLastLoginMethod?: boolean) {
  if (defaultView) return defaultView;

  const storedView = readStorageValue<AuthView | null>(AUTH_VIEW_STORAGE_KEY, null);
  if (storedView === 'create-account' || storedView === 'login') return storedView;

  return hasLastLoginMethod ? 'login' : 'create-account';
}

export function AuthModal({ open, onClose, onSuccess, defaultView }: AuthModalProps) {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithApple, sendPasswordReset, user, userProfile } = useAuth();
  const createUser = useMutation(api.users.createUser);
  const updateUserProfileMutation = useMutation(api.users.updateUserProfile);
  const [currentView, setCurrentView] = useState<AuthView>('create-account');
  const [lastLoginMethod, setLastLoginMethod] = useState<AuthMethod | null>(() => readStorageValue<AuthMethod | null>(LOGIN_METHOD_STORAGE_KEY, null));
  const [createAccountName, setCreateAccountName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successEmail, setSuccessEmail] = useState('');

  useEffect(() => {
    if (!open) return;

    const nextView = inferInitialView(defaultView, Boolean(lastLoginMethod));
    setCurrentView(nextView);
    setEmail(user?.email || '');
    setCreateAccountName(userProfile?.displayName || user?.displayName || '');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setLoading(false);
    setError('');
    setSuccessEmail('');
  }, [defaultView, lastLoginMethod, open, user?.displayName, user?.email, userProfile?.displayName]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  useEffect(() => {
    if (!open || (currentView !== 'create-account' && currentView !== 'login')) return;
    if (typeof window === 'undefined') return;

    window.localStorage.setItem(AUTH_VIEW_STORAGE_KEY, JSON.stringify(currentView));
  }, [currentView, open]);

  const persistLastLoginMethod = (method: AuthMethod) => {
    setLastLoginMethod(method);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LOGIN_METHOD_STORAGE_KEY, JSON.stringify(method));
    }
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

    persistLastLoginMethod(method);
    onSuccess();
    onClose();
  };

  const handleProviderAccess = async (method: 'google' | 'apple', mode: 'create-account' | 'login') => {
    setError('');

    try {
      setLoading(true);
      const result = method === 'google' ? await signInWithGoogle() : await signInWithApple();

      if (mode === 'create-account' || result.requiresProfileCompletion) {
        await finalizeAccount(method);
      } else {
        persistLastLoginMethod(method);
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
      persistLastLoginMethod('email');
      onSuccess();
      onClose();
    } catch (loginError: any) {
      setError(loginError?.message || 'Could not log you in.');
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
      setSuccessEmail(email.trim());
      setCurrentView('reset-sent');
    } catch (resetError: any) {
      setError(resetError?.message || 'Could not send a reset link right now.');
    } finally {
      setLoading(false);
    }
  };

  const panelCopy = useMemo(() => {
    if (currentView === 'create-account') {
      return {
        heading: 'Create account',
        subtext: 'Start reading on Lemonade with one calm, fast account flow.',
      };
    }

    if (currentView === 'login') {
      return {
        heading: 'Welcome back',
        subtext: 'Pick up your reading list and continue where you left off.',
      };
    }

    if (currentView === 'forgot-password') {
      return {
        heading: 'Reset password',
        subtext: 'Enter your account email and we will send a reset link right away.',
      };
    }

    return {
      heading: 'Check your inbox',
      subtext: `If ${successEmail} is registered, a reset link is on the way.`,
    };
  }, [currentView, successEmail]);

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

                {(currentView === 'create-account' || currentView === 'login') && (
                  <div className="flex flex-col items-start gap-3">
                    <AuthToggle
                      value={currentView}
                      onChange={(value) => {
                        setError('');
                        setCurrentView(value);
                      }}
                    />
                    <LastLoginMethodHint method={lastLoginMethod} />
                  </div>
                )}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentView}
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.22 }}
                  className="mt-6"
                >
                  {currentView === 'create-account' && (
                    <CreateAccountForm
                      name={createAccountName}
                      email={email}
                      password={password}
                      confirmPassword={confirmPassword}
                      loading={loading}
                      error={error}
                      showPassword={showPassword}
                      showConfirmPassword={showConfirmPassword}
                      lastLoginMethod={lastLoginMethod}
                      onNameChange={setCreateAccountName}
                      onEmailChange={setEmail}
                      onPasswordChange={setPassword}
                      onConfirmPasswordChange={setConfirmPassword}
                      onTogglePassword={() => setShowPassword((current) => !current)}
                      onToggleConfirmPassword={() => setShowConfirmPassword((current) => !current)}
                      onSubmit={handleCreateAccount}
                      onProviderSelect={(method) => handleProviderAccess(method, 'create-account')}
                    />
                  )}

                  {currentView === 'login' && (
                    <LoginForm
                      email={email}
                      password={password}
                      loading={loading}
                      error={error}
                      showPassword={showPassword}
                      lastLoginMethod={lastLoginMethod}
                      onEmailChange={setEmail}
                      onPasswordChange={setPassword}
                      onTogglePassword={() => setShowPassword((current) => !current)}
                      onSubmit={handleLogin}
                      onForgotPassword={() => {
                        setError('');
                        setCurrentView('forgot-password');
                      }}
                      onProviderSelect={(method) => handleProviderAccess(method, 'login')}
                    />
                  )}

                  {currentView === 'forgot-password' && (
                    <ForgotPasswordForm
                      email={email}
                      loading={loading}
                      error={error}
                      onEmailChange={setEmail}
                      onSubmit={handlePasswordReset}
                    />
                  )}

                  {currentView === 'reset-sent' && (
                    <div className="space-y-5 text-white">
                      <div className="rounded-[28px] border border-white/10 bg-white/6 p-5">
                        <div className="flex items-start gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/16 text-primary">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-base font-semibold text-white">Reset link sent</p>
                            <p className="mt-2 text-sm leading-6 text-white/68">
                              Use the link in your inbox to choose a new password. You can return and log in once it is done.
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setError('');
                          setCurrentView('login');
                        }}
                        className="w-full rounded-2xl bg-white px-4 py-3.5 text-sm font-semibold text-zinc-950 shadow-[0_18px_45px_rgba(0,0,0,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/92"
                      >
                        Return to log in
                      </button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {currentView === 'create-account' && (
                <p className="mt-5 text-center text-sm text-white/62">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setCurrentView('login');
                    }}
                    className="font-semibold text-white transition hover:text-emerald-200"
                  >
                    Log in
                  </button>
                </p>
              )}

              {currentView === 'login' && (
                <p className="mt-5 text-center text-sm text-white/62">
                  Need an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setCurrentView('create-account');
                    }}
                    className="font-semibold text-white transition hover:text-emerald-200"
                  >
                    Create one
                  </button>
                </p>
              )}

              {currentView === 'forgot-password' && (
                <p className="mt-5 text-center text-sm text-white/62">
                  Remembered it?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setCurrentView('login');
                    }}
                    className="font-semibold text-white transition hover:text-emerald-200"
                  >
                    Back to log in
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
