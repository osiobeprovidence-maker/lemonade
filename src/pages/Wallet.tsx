import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, handleFirestoreError } from '../lib/firebase';
import { doc, onSnapshot, updateDoc, increment } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { ChevronLeft, CreditCard, Zap, ShieldCheck, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const COIN_PACKS = [
  { id: 'pack_50', coins: 50, price: '₦500', bonus: 0, total: 50 },
  { id: 'pack_120', coins: 120, price: '₦1,000', bonus: 20, total: 140 },
  { id: 'pack_300', coins: 300, price: '₦2,500', bonus: 50, total: 350 },
  { id: 'pack_700', coins: 700, price: '₦5,000', bonus: 150, total: 850 },
];

export function Wallet() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [giftCode, setGiftCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!user) return;

    const profileRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserProfile(docSnap.data());
      }
    }, (error) => {
      handleFirestoreError(error, 'GET', `users/${user.uid}`);
    });

    return () => unsubscribe();
  }, [user]);

  const handlePurchase = async (pack: typeof COIN_PACKS[0]) => {
    if (!user) return;
    setIsProcessing(true);

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        coins: increment(pack.total)
      });
    } catch (error) {
      handleFirestoreError(error, 'UPDATE', `users/${user.uid}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRedeem = async () => {
    if (!user || !giftCode.trim()) return;
    setIsProcessing(true);

    try {
      if (giftCode.toUpperCase() === 'LEMONADE2026') {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          coins: increment(100)
        });
        setGiftCode('');
      }
    } catch (error) {
      handleFirestoreError(error, 'UPDATE', `users/${user.uid}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    return (
      <div className="w-full md:max-w-4xl mx-auto min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 mb-6">
          <CreditCard size={40} />
        </div>
        <h2 className="text-2xl font-black tracking-tight mb-2">Your Wallet</h2>
        <p className="text-zinc-500 text-sm mb-8">Please sign in to manage your coins and unlock premium content.</p>
        <button 
          onClick={() => navigate('/login')} 
          className="w-full py-4 bg-brand-yellow text-black rounded-2xl font-black text-sm tracking-widest shadow-xl shadow-brand-yellow/20"
        >
          SIGN IN
        </button>
      </div>
    );
  }

  return (
    <div className="w-full md:max-w-4xl mx-auto min-h-screen bg-white shadow-2xl flex flex-col relative overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100 px-4 h-16 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 hover:bg-zinc-100 rounded-full transition-colors"
        >
          <ChevronLeft size={24} className="text-black" />
        </button>
        <h1 className="text-sm font-black tracking-widest uppercase text-black">Wallet</h1>
        <div className="w-10" />
      </header>

      <main className="flex-grow overflow-y-auto no-scrollbar pb-20">
        {/* Balance Card */}
        <section className="px-6 py-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-brand-yellow text-black rounded-[2.5rem] p-8 shadow-2xl shadow-brand-yellow/20 relative overflow-hidden"
          >
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Available Balance</p>
              <h2 className="text-5xl font-black mb-6">{userProfile?.coins || 0} <span className="text-lg opacity-60">Coins</span></h2>
              
              <div className="flex gap-3">
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                  <ShieldCheck size={12} />
                  Secure
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                  <Zap size={12} />
                  Instant
                </div>
              </div>
            </div>
            
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          </motion.div>
        </section>

        {/* Coin Packs */}
        <section className="px-6 py-4">
          <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6">Top Up Coins</h3>
          <div className="grid grid-cols-1 gap-4">
            {COIN_PACKS.map((pack, i) => (
              <motion.button 
                key={i}
                whileTap={{ scale: 0.98 }}
                onClick={() => !isProcessing && handlePurchase(pack)}
                className="flex items-center justify-between p-6 bg-white rounded-[2rem] border border-zinc-100 shadow-sm hover:border-brand-yellow/20 transition-all text-left group"
              >
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black tracking-tighter">{pack.coins}</span>
                    <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Coins</span>
                  </div>
                  {pack.bonus > 0 && (
                    <span className="text-[9px] font-black uppercase tracking-widest text-brand-yellow mt-1 block">
                      +{pack.bonus} Bonus
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-black tracking-tight">{pack.price}</p>
                  <p className="text-[10px] font-black text-brand-yellow uppercase tracking-widest group-hover:translate-x-1 transition-transform">Buy →</p>
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Gift Code */}
        <section className="px-6 py-8 mt-4">
          <div className="p-8 bg-black rounded-[3rem] text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-brand-yellow text-black rounded-2xl flex items-center justify-center shadow-lg shadow-brand-yellow/20">
                  <Gift size={24} />
                </div>
                <h4 className="text-xl font-black tracking-tight">Have a gift code?</h4>
              </div>
              <p className="text-sm text-zinc-400 mb-8 leading-relaxed">Redeem your promotional code here to add coins to your account instantly.</p>
              
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  placeholder="Enter code"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-5 pr-32 py-4 text-sm outline-none focus:ring-2 focus:ring-brand-yellow transition-all text-white placeholder:text-zinc-600 font-bold"
                  value={giftCode}
                  onChange={(e) => setGiftCode(e.target.value)}
                />
                <button 
                  onClick={handleRedeem}
                  disabled={isProcessing || !giftCode.trim()}
                  className="absolute right-2 bg-brand-yellow text-black px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 shadow-lg shadow-brand-yellow/20"
                >
                  {isProcessing ? '...' : 'Redeem'}
                </button>
              </div>
            </div>
            
            {/* Decorative element */}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-brand-yellow/10 rounded-full blur-2xl" />
          </div>
        </section>
      </main>

      {/* Footer Tagline */}
      <footer className="py-8 px-4 text-center border-t border-zinc-50">
        <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-[0.2em]">
          LEMONADE • Every story has a taste
        </p>
      </footer>
    </div>
  );
}
