import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useMutation } from 'convex/react';
import { updatePassword } from 'firebase/auth';
import { api } from '../../convex/_generated/api';
import { auth } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { uploadProfilePhoto } from '../lib/profilePhoto';
import { SignupOptions } from './SignupOptions';
import { EmailSignupForm } from './EmailSignupForm';
import { ProfileCompletionForm } from './ProfileCompletionForm';

type SignupStep = 'options' | 'auth' | 'profile';
type AuthMethod = 'email' | 'google' | 'apple';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ open, onClose, onSuccess }: AuthModalProps) {
  const { signUpWithEmail, signInWithGoogle, signInWithApple, user, userProfile } = useAuth();
  const createUserProfile = useMutation(api.users.createUserProfile);
  const [step, setStep] = useState<SignupStep>('options');
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setStep('options');
      setAuthMethod('email');
      setEmail('');
      setUsername('');
      setBirthMonth('');
      setBirthDay('');
      setBirthYear('');
      setPronouns('');
      setProfilePhotoUrl('');
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setLoading(false);
      setIsUploadingPhoto(false);
      setError('');
    }
  }, [open]);

  useEffect(() => {
    if (!open || step !== 'profile') return;

    setEmail(user?.email || email);
    setUsername((current) => current || userProfile?.displayName || user?.displayName || '');
    setProfilePhotoUrl((current) => current || userProfile?.photoURL || user?.photoURL || '');
  }, [email, open, step, user?.displayName, user?.email, user?.photoURL, userProfile?.displayName, userProfile?.photoURL]);

  const handleProfilePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !auth.currentUser) return;

    try {
      setError('');
      setIsUploadingPhoto(true);
      const photoURL = await uploadProfilePhoto(auth.currentUser, file);
      setProfilePhotoUrl(photoURL);
    } catch (photoError: any) {
      setError(photoError?.message || 'Could not upload your profile photo.');
    } finally {
      setIsUploadingPhoto(false);
      event.target.value = '';
    }
  };

  const birthdayIso = useMemo(() => {
    if (!birthMonth || !birthDay || !birthYear) return '';
    const monthIndex = String(
      [
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
      ].indexOf(birthMonth) + 1,
    ).padStart(2, '0');

    return `${birthYear}-${monthIndex}-${String(birthDay).padStart(2, '0')}`;
  }, [birthDay, birthMonth, birthYear]);

  const handleProviderSelect = async (method: AuthMethod) => {
    setError('');

    if (method === 'email') {
      setAuthMethod('email');
      setStep('auth');
      return;
    }

    try {
      setLoading(true);
      setAuthMethod(method);

      if (method === 'google') {
        await signInWithGoogle();
      } else {
        await signInWithApple();
      }

      setEmail(auth.currentUser?.email || '');
      setStep('profile');
    } catch (providerError: any) {
      setError(providerError?.message || `Could not continue with ${method}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignup = async (event: React.FormEvent) => {
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

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await signUpWithEmail(email.trim(), password);
      setStep('profile');
    } catch (signupError: any) {
      setError(signupError?.message || 'Could not create your account.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!user?.uid) {
      setError('We could not confirm your account yet. Please try again.');
      return;
    }

    if (!email.trim()) {
      setError('A valid email is required.');
      return;
    }

    if (!username.trim()) {
      setError('Username is required.');
      return;
    }

    if (!birthdayIso) {
      setError('Please complete your birthday.');
      return;
    }

    if (isUploadingPhoto) {
      setError('Please wait for your profile photo to finish uploading.');
      return;
    }

    if (authMethod === 'email') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    try {
      setLoading(true);

      if (authMethod === 'email' && auth.currentUser) {
        await updatePassword(auth.currentUser, password);
      }

      await createUserProfile({
        userId: user.uid,
        email: email.trim(),
        username: username.trim(),
        birthday: birthdayIso,
        pronouns: pronouns || undefined,
        photoURL: profilePhotoUrl || undefined,
      });

      onSuccess();
      onClose();
    } catch (profileError: any) {
      setError(profileError?.message || 'Could not save your profile.');
    } finally {
      setLoading(false);
    }
  };

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
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="glass-button absolute right-4 top-4 z-10 rounded-full p-2 text-white/72 transition-all duration-200 hover:scale-105 hover:bg-white/18 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top_left,rgba(158,255,191,0.22),transparent_58%)]" />
            <div className="max-h-[90vh] overflow-y-auto px-5 py-6 sm:px-6 sm:py-7">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.22 }}
                >
                  {step === 'options' && (
                    <SignupOptions
                      loading={loading}
                      onSelect={handleProviderSelect}
                      onBack={onClose}
                    />
                  )}

                  {step === 'auth' && (
                    <EmailSignupForm
                      email={email}
                      password={password}
                      confirmPassword={confirmPassword}
                      loading={loading}
                      error={error}
                      showPassword={showPassword}
                      showConfirmPassword={showConfirmPassword}
                      onEmailChange={setEmail}
                      onPasswordChange={setPassword}
                      onConfirmPasswordChange={setConfirmPassword}
                      onTogglePassword={() => setShowPassword((current) => !current)}
                      onToggleConfirmPassword={() => setShowConfirmPassword((current) => !current)}
                      onSubmit={handleEmailSignup}
                      onBack={() => {
                        setError('');
                        setStep('options');
                      }}
                    />
                  )}

                  {step === 'profile' && (
                    <ProfileCompletionForm
                      email={email}
                      username={username}
                      birthMonth={birthMonth}
                      birthDay={birthDay}
                      birthYear={birthYear}
                      pronouns={pronouns}
                      profilePhotoUrl={profilePhotoUrl}
                      isUploadingPhoto={isUploadingPhoto}
                      password={password}
                      confirmPassword={confirmPassword}
                      isEmailSignup={authMethod === 'email'}
                      showPassword={showPassword}
                      showConfirmPassword={showConfirmPassword}
                      loading={loading}
                      error={error}
                      onUsernameChange={setUsername}
                      onBirthMonthChange={setBirthMonth}
                      onBirthDayChange={setBirthDay}
                      onBirthYearChange={setBirthYear}
                      onPronounsChange={setPronouns}
                      onProfilePhotoChange={handleProfilePhotoChange}
                      onPasswordChange={setPassword}
                      onConfirmPasswordChange={setConfirmPassword}
                      onTogglePassword={() => setShowPassword((current) => !current)}
                      onToggleConfirmPassword={() => setShowConfirmPassword((current) => !current)}
                      onBack={() => {
                        setError('');
                        setStep('options');
                      }}
                      onSubmit={handleProfileSubmit}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
