import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Ticket, Gift, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, handleFirestoreError } from '../lib/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';

export function PromoCode() {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !code.trim()) return;

    setStatus('loading');
    try {
      // Mock promo code logic
      if (code.toUpperCase() === 'LEMONADE2026') {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          coins: increment(100)
        });
        setStatus('success');
        setMessage('Successfully redeemed 100 coins!');
      } else {
        setStatus('error');
        setMessage('Invalid or expired promo code.');
      }
    } catch (error) {
      handleFirestoreError(error, 'UPDATE', `users/${user.uid}`);
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-white shadow-2xl flex flex-col relative overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md px-4 h-16 flex items-center justify-between border-b border-zinc-50">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <ChevronLeft size={24} className="text-black" />
          </button>
          <h1 className="text-xl font-black tracking-tight">Promo Code</h1>
        </div>
      </header>

      <main className="flex-grow p-6 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-brand-yellow/10 text-brand-yellow rounded-[2rem] flex items-center justify-center mb-8">
          <Ticket size={48} />
        </div>

        <h2 className="text-2xl font-black tracking-tight mb-2">Redeem Your Code</h2>
        <p className="text-sm text-zinc-400 font-bold mb-10 px-8">Enter your promotional code below to unlock special rewards and coins.</p>

        <form onSubmit={handleRedeem} className="w-full space-y-6">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Enter promo code"
              className="w-full p-5 rounded-2xl bg-zinc-50 border-2 border-transparent focus:border-brand-yellow outline-none text-center text-lg font-black tracking-widest uppercase placeholder:text-zinc-200 transition-all"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={status === 'loading' || status === 'success'}
            />
          </div>

          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest"
              >
                <CheckCircle2 size={16} />
                {message}
              </motion.div>
            ) : status === 'error' ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest"
              >
                <AlertCircle size={16} />
                {message}
              </motion.div>
            ) : null}
          </AnimatePresence>

          {status !== 'success' && (
            <button 
              type="submit"
              disabled={status === 'loading' || !code.trim()}
              className="w-full py-4 bg-brand-yellow text-black rounded-2xl font-black text-sm tracking-widest shadow-xl shadow-brand-yellow/20 disabled:opacity-50"
            >
              {status === 'loading' ? 'REDEEMING...' : 'REDEEM CODE'}
            </button>
          )}

          {status === 'success' && (
            <button 
              type="button"
              onClick={() => navigate('/wallet')}
              className="w-full py-4 bg-black text-white rounded-2xl font-black text-sm tracking-widest shadow-xl shadow-zinc-200"
            >
              VIEW WALLET
            </button>
          )}
        </form>

        <div className="mt-12 p-6 bg-zinc-50 rounded-[2rem] border border-zinc-100 w-full">
          <div className="flex items-center gap-3 mb-3">
            <Gift size={18} className="text-brand-yellow" />
            <h4 className="text-xs font-black uppercase tracking-widest">Current Offer</h4>
          </div>
          <p className="text-xs text-zinc-400 font-bold text-left">Use code <span className="text-brand-yellow">LEMONADE2026</span> for 100 free coins on your first redemption!</p>
        </div>
      </main>

      {/* Footer Tagline */}
      <footer className="py-12 px-6 text-center border-t border-zinc-50">
        <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-[0.2em]">
          LEMONADE • Every story has a taste
        </p>
      </footer>
    </div>
  );
}
