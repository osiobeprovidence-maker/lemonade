import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithApple } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithGoogle();
      navigate('/');
    } catch (error: any) {
      console.error('Login failed:', error);
      setError(error.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithApple();
      navigate('/');
    } catch (error: any) {
      console.error('Apple login failed:', error);
      setError(error.message || 'Failed to sign in with Apple');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isSignUp) {
        if (!displayName.trim()) {
          setError('Please enter a display name');
          return;
        }
        await signUpWithEmail(email, password, displayName);
      } else {
        await signInWithEmail(email, password);
      }
      navigate('/');
    } catch (error: any) {
      console.error('Auth failed:', error);
      setError(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-background flex flex-col">
      <main className="flex-grow flex items-start justify-center px-4 md:px-8 pt-12 md:pt-20 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm md:max-w-md"
        >
          {/* Brand */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-primary">
              LEMONADE
            </h1>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-none mb-3">
              {isSignUp ? 'Create an Account' : 'Welcome back.'}
            </h2>
            <p className="text-muted-foreground text-sm">
              Every story has a taste — sweet, sour, or both.
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 bg-red-50 dark:bg-red-950/30 text-red-500 text-xs font-bold rounded-xl text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Email Form */}
          <form onSubmit={handleEmailAuth} className="flex flex-col gap-3 mb-6">
            {isSignUp && (
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="Display Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-muted border border-border focus:bg-background focus:border-primary/30 focus:ring-4 focus:ring-primary/10 outline-none text-sm transition-all placeholder:text-muted-foreground"
                  required
                />
              </div>
            )}
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-muted border border-border focus:bg-background focus:border-primary/30 focus:ring-4 focus:ring-primary/10 outline-none text-sm transition-all placeholder:text-muted-foreground"
                required
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-muted border border-border focus:bg-background focus:border-primary/30 focus:ring-4 focus:ring-primary/10 outline-none text-sm transition-all placeholder:text-muted-foreground"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <motion.button
              type="submit"
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full py-3.5 text-white rounded-xl font-black text-xs tracking-widest transition-all hover:opacity-90 disabled:opacity-50 bg-primary"
            >
              {loading ? 'Loading...' : (isSignUp ? 'SIGN UP WITH EMAIL' : 'LOG IN WITH EMAIL')}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px bg-border flex-grow"></div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">or continue with</span>
            <div className="h-px bg-border flex-grow"></div>
          </div>

          {/* Social Buttons */}
          <div className="flex flex-col gap-3 mb-6">
            <motion.button
              onClick={handleGoogleLogin}
              type="button"
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full py-3.5 bg-background border border-border rounded-xl font-bold text-xs tracking-wide flex items-center justify-center gap-3 hover:bg-muted transition-all disabled:opacity-50"
            >
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
              CONTINUE WITH GOOGLE
            </motion.button>
            <motion.button
              onClick={handleAppleLogin}
              type="button"
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full py-3.5 bg-background border border-border rounded-xl font-bold text-xs tracking-wide flex items-center justify-center gap-3 hover:bg-muted transition-all disabled:opacity-50"
            >
              <svg viewBox="0 0 384 512" className="w-4 h-4" fill="currentColor">
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
              </svg>
              CONTINUE WITH APPLE
            </motion.button>
          </div>

          {/* Toggle Sign Up/Log In */}
          <div className="text-center mb-6">
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isSignUp ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
            </button>
          </div>

          {/* Terms */}
          <p className="text-center text-[10px] text-muted-foreground leading-relaxed">
            By continuing, you agree to Lemonade's<br />
            <span className="hover:text-foreground cursor-pointer">Terms of Service</span> and <span className="hover:text-foreground cursor-pointer">Privacy Policy</span>.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
