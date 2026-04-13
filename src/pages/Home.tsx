import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, limit, onSnapshot, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';
import { SeriesCard } from '../components/SeriesCard';
import { motion } from 'framer-motion';
import { TrendingUp, Sparkles, Clock, ChevronRight, Smartphone } from 'lucide-react';

const MOCK_SERIES = [
  {
    id: '1',
    title: 'Lagos 2099',
    creatorName: 'Tunde Dev',
    coverImage: 'https://picsum.photos/seed/lagos/600/800',
    subscriberCount: 1200,
    viewCount: 45000,
    tags: ['Sci-Fi', 'Action']
  },
  {
    id: '2',
    title: 'Spirit of the Niger',
    creatorName: 'Amaka Art',
    coverImage: 'https://picsum.photos/seed/spirit/600/800',
    subscriberCount: 800,
    viewCount: 12000,
    tags: ['Fantasy', 'Mythology']
  },
  {
    id: '3',
    title: 'The Last Oba',
    creatorName: 'Bayo Comics',
    coverImage: 'https://picsum.photos/seed/oba/600/800',
    subscriberCount: 2500,
    viewCount: 89000,
    tags: ['Historical', 'Drama']
  },
  {
    id: '4',
    title: 'Naija High',
    creatorName: 'Chioma Webtoons',
    coverImage: 'https://picsum.photos/seed/school/600/800',
    subscriberCount: 1500,
    viewCount: 32000,
    tags: ['Slice of Life', 'Comedy']
  }
];

export function Home() {
  const [series, setSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'trending' | 'popular'>('trending');

  useEffect(() => {
    const q = query(
      collection(db, 'series'),
      where('status', '==', 'published'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSeries(data.length > 0 ? data : MOCK_SERIES);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, 'LIST', 'series');
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="w-full md:max-w-7xl mx-auto min-h-screen bg-white shadow-2xl flex flex-col relative overflow-hidden pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md px-4 h-16 flex items-center justify-between border-b border-zinc-50">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-serif font-black tracking-tighter text-brand-yellow">LEMONADE</h1>
        </div>
        <Link to="/menu" className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
          <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
            <Smartphone size={18} />
          </div>
        </Link>
      </header>

      <main className="flex-grow overflow-y-auto no-scrollbar">
        {/* Hero Banner */}
        <section className="px-4 py-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative h-48 rounded-[2.5rem] overflow-hidden bg-black group cursor-pointer shadow-2xl shadow-black/10"
          >
            <img 
              src="https://picsum.photos/seed/promo/800/400" 
              className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
              <div className="flex gap-4 mb-3 opacity-80">
                <span className="text-white font-black text-xs italic tracking-tighter">Disney</span>
                <span className="text-white font-black text-xs italic tracking-tighter">MARVEL</span>
                <span className="text-white font-black text-xs italic tracking-tighter">STAR WARS</span>
              </div>
              <h2 className="text-white text-lg font-black mb-1 leading-tight">Stories that move you.</h2>
              <p className="text-white/40 text-[8px] font-bold uppercase tracking-widest">Only on Lemonade</p>
            </div>
          </motion.div>
        </section>

        {/* Categories Quick Access */}
        <section className="px-4 py-2">
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4">
            {['Action', 'Fantasy', 'Romance', 'Comedy', 'Drama'].map((cat) => (
              <Link 
                key={cat}
                to="/browse"
                state={{ category: cat }}
                className="px-5 py-2.5 bg-zinc-50 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-400 whitespace-nowrap border border-zinc-100 hover:border-brand-yellow/20 transition-all"
              >
                {cat}
              </Link>
            ))}
          </div>
        </section>

        {/* Trending Section */}
        <section className="px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
              Trending Now
              <TrendingUp size={18} className="text-brand-yellow" />
            </h2>
            <Link to="/rankings" className="text-[10px] font-black text-brand-yellow uppercase tracking-widest">View All</Link>
          </div>
          
          <div className="flex gap-6 overflow-x-auto no-scrollbar pb-6">
            {series.slice(0, 5).map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="w-40 flex-shrink-0"
              >
                <SeriesCard series={s} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* New Releases */}
        <section className="px-4 py-8 bg-zinc-50/50">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
              New Releases
              <Sparkles size={18} className="text-brand-yellow" />
            </h2>
            <Link to="/new-releases" className="text-[10px] font-black text-brand-yellow uppercase tracking-widest">View All</Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {series.slice(0, 4).map((s) => (
              <Link 
                key={s.id} 
                to={`/series/${s.id}`}
                className="flex gap-4 p-4 bg-white rounded-[2rem] border border-zinc-100 shadow-sm active:scale-98 transition-all"
              >
                <div className="w-20 h-24 flex-shrink-0 rounded-2xl overflow-hidden shadow-sm">
                  <img src={s.coverImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <h3 className="font-black text-sm mb-1 truncate">{s.title}</h3>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-2">{s.tags?.[0] || 'Story'}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-[9px] font-black text-zinc-300">
                      <Clock size={10} />
                      Just Now
                    </div>
                  </div>
                </div>
                <div className="ml-auto flex items-center">
                  <ChevronRight size={18} className="text-zinc-200" />
                </div>
              </Link>
            ))}
          </div>
        </section>
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
