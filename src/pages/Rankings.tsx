import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trophy, TrendingUp, Heart, Eye, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';

export function Rankings() {
  const navigate = useNavigate();
  const [series, setSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    const q = query(
      collection(db, 'series'),
      where('status', '==', 'published'),
      orderBy('viewCount', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSeries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, 'LIST', 'series');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [timeframe]);

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
          <h1 className="text-xl font-black tracking-tight">Rankings</h1>
        </div>
        <div className="p-2 bg-brand-yellow/10 text-brand-yellow rounded-xl">
          <Trophy size={20} />
        </div>
      </header>

      <main className="flex-grow p-6">
        {/* Timeframe Selector */}
        <div className="flex gap-2 mb-8 bg-zinc-50 p-1.5 rounded-2xl">
          {(['daily', 'weekly', 'monthly'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                timeframe === t ? 'bg-white text-brand-yellow shadow-sm' : 'text-zinc-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex gap-4 p-4 bg-zinc-50 rounded-2xl">
                <div className="w-12 h-12 bg-zinc-100 rounded-xl" />
                <div className="flex-grow space-y-2">
                  <div className="h-3 bg-zinc-100 rounded w-3/4" />
                  <div className="h-2 bg-zinc-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : series.length > 0 ? (
          <div className="space-y-4">
            {series.map((s, index) => (
              <motion.div 
                key={s.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/series/${s.id}`)}
                className="flex items-center gap-4 p-4 bg-white rounded-[2rem] border border-zinc-100 shadow-sm active:scale-98 transition-all"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${
                  index === 0 ? 'bg-yellow-400 text-white' : 
                  index === 1 ? 'bg-zinc-300 text-white' : 
                  index === 2 ? 'bg-orange-400 text-white' : 'text-zinc-300'
                }`}>
                  {index + 1}
                </div>
                
                <div className="w-16 h-20 rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0">
                  <img src={s.coverImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>

                <div className="flex-grow min-w-0">
                  <h3 className="text-sm font-black truncate mb-1">{s.title}</h3>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-2">{s.creatorName}</p>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[10px] font-black text-zinc-400">
                      <Eye size={12} className="text-zinc-300" />
                      {s.viewCount?.toLocaleString() || 0}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-black text-zinc-400">
                      <Heart size={12} className="text-red-400" />
                      {s.likeCount?.toLocaleString() || 0}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1 text-green-500">
                    <TrendingUp size={14} />
                    <span className="text-[10px] font-black">+{s.trendPercent || Math.floor(Math.random() * 30 + 10)}%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-zinc-50 rounded-[2.5rem] border border-dashed border-zinc-200">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-200">
              <Trophy size={32} />
            </div>
            <h3 className="text-sm font-black mb-1">No rankings yet</h3>
            <p className="text-xs text-zinc-400">Check back later for the top stories.</p>
          </div>
        )}
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
