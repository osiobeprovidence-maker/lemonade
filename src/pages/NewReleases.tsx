import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Sparkles, Calendar, Clock, Filter } from 'lucide-react';
import { motion } from 'motion/react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';
import { SeriesCard } from '../components/SeriesCard';

export function NewReleases() {
  const navigate = useNavigate();
  const [series, setSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'series'),
      where('status', '==', 'published'),
      orderBy('createdAt', 'desc'),
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
  }, []);

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
          <h1 className="text-xl font-black tracking-tight">New Releases</h1>
        </div>
        <div className="p-2 bg-brand-yellow/10 text-brand-yellow rounded-xl">
          <Sparkles size={20} />
        </div>
      </header>

      <main className="flex-grow p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
            <Calendar size={14} />
            <span>Updated Today</span>
          </div>
          <button className="p-2 bg-zinc-50 rounded-xl text-zinc-400">
            <Filter size={16} />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-zinc-100 rounded-2xl mb-3" />
                <div className="h-3 bg-zinc-100 rounded w-3/4 mb-2" />
                <div className="h-2 bg-zinc-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : series.length > 0 ? (
          <div className="grid grid-cols-2 gap-6">
            {series.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative"
              >
                <SeriesCard series={s} />
                <div className="absolute top-2 right-2 bg-brand-yellow text-black text-[8px] font-black px-1.5 py-0.5 rounded uppercase flex items-center gap-1 shadow-lg shadow-brand-yellow/20">
                  <Clock size={8} />
                  New
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-zinc-50 rounded-[2.5rem] border border-dashed border-zinc-200">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-200">
              <Sparkles size={32} />
            </div>
            <h3 className="text-sm font-black mb-1">No new releases</h3>
            <p className="text-xs text-zinc-400">Check back later for fresh content.</p>
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
