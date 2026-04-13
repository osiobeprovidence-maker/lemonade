import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Sparkles, ChevronRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// --- Dummy Data Fallback ---
const DUMMY_SERIES = [
  { id: 'd1', title: 'Shango Reborn', genre: 'Mythology', tags: ['Mythology', 'Action'], creator: 'Lemonade', coverImage: 'https://picsum.photos/seed/shango/600/800', viewCount: 1200000, subscriberCount: 45000, createdAt: new Date('2025-01-15').toISOString() },
  { id: 'd2', title: 'Queen Amina', genre: 'Action', tags: ['Action', 'Historical'], creator: 'Lemonade', coverImage: 'https://picsum.photos/seed/amina/600/800', viewCount: 2500000, subscriberCount: 82000, createdAt: new Date('2025-02-01').toISOString() },
  { id: 'd3', title: 'Ancestors', genre: 'Fantasy', tags: ['Fantasy', 'Drama'], creator: 'Lemonade', coverImage: 'https://picsum.photos/seed/ancestors/600/800', viewCount: 450000, subscriberCount: 18000, createdAt: new Date('2025-03-10').toISOString() },
  { id: 'd4', title: 'Solar Punk', genre: 'Sci-Fi', tags: ['Sci-Fi', 'Adventure'], creator: 'Lemonade', coverImage: 'https://picsum.photos/seed/solar/600/800', viewCount: 890000, subscriberCount: 32000, createdAt: new Date('2025-04-05').toISOString() },
  { id: 'd5', title: 'Lagos 2099', genre: 'Sci-Fi', tags: ['Sci-Fi', 'Cyberpunk'], creator: 'Tunde', coverImage: 'https://picsum.photos/seed/lagos/600/800', viewCount: 980000, subscriberCount: 55000, createdAt: new Date('2025-05-20').toISOString() },
  { id: 'd6', title: 'Spirit of Niger', genre: 'Fantasy', tags: ['Fantasy', 'Mystery'], creator: 'Amaka', coverImage: 'https://picsum.photos/seed/spirit/600/800', viewCount: 720000, subscriberCount: 28000, createdAt: new Date('2025-06-12').toISOString() },
  { id: 'd7', title: 'The Last Oba', genre: 'Historical', tags: ['Historical', 'Drama'], creator: 'Bayo', coverImage: 'https://picsum.photos/seed/oba/600/800', viewCount: 650000, subscriberCount: 41000, createdAt: new Date('2025-07-08').toISOString() },
  { id: 'd8', title: 'Naija High', genre: 'Comedy', tags: ['Comedy', 'Romance'], creator: 'Chioma', coverImage: 'https://picsum.photos/seed/school/600/800', viewCount: 1100000, subscriberCount: 62000, createdAt: new Date('2025-08-22').toISOString() },
  { id: 'd9', title: 'Desert Rose', genre: 'Romance', tags: ['Romance', 'Drama'], creator: 'Zainab', coverImage: 'https://picsum.photos/seed/rose/600/800', viewCount: 830000, subscriberCount: 47000, createdAt: new Date('2025-09-14').toISOString() },
  { id: 'd10', title: 'Iron Heart', genre: 'Action', tags: ['Action', 'Thriller'], creator: 'Kofi', coverImage: 'https://picsum.photos/seed/iron/600/800', viewCount: 560000, subscriberCount: 22000, createdAt: new Date('2025-10-01').toISOString() },
  { id: 'd11', title: 'Forest Spirits', genre: 'Mythology', tags: ['Mythology', 'Fantasy'], creator: 'Nature_Gal', coverImage: 'https://picsum.photos/seed/forest/600/800', viewCount: 340000, subscriberCount: 15000, createdAt: new Date('2025-11-05').toISOString() },
  { id: 'd12', title: 'Cyber-Kano', genre: 'Sci-Fi', tags: ['Sci-Fi', 'Action'], creator: 'Techie_B', coverImage: 'https://picsum.photos/seed/kano/600/800', viewCount: 280000, subscriberCount: 12000, createdAt: new Date('2025-12-18').toISOString() },
];

export function Browse() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [series, setSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'popularity' | 'likes' | 'date'>('popularity');
  const [useDummy, setUseDummy] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [searchFocused, setSearchFocused] = useState(false);

  // Sync URL params to local search state
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearchQuery(q);
  }, [searchParams]);

  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    if (value) {
      navigate(`/browse?q=${encodeURIComponent(value)}`, { replace: true });
    } else {
      navigate('/browse', { replace: true });
    }
  };

  useEffect(() => {
    let q = query(
      collection(db, 'series'),
      where('status', '==', 'published'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const realData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Always merge real data with dummy data for a rich experience
      const merged = [...DUMMY_SERIES, ...realData.filter((r: any) =>
        !DUMMY_SERIES.some((d: any) => d.id === r.id)
      )];
      setSeries(merged);
      setUseDummy(true);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, 'LIST', 'series');
      setUseDummy(true);
      setSeries(DUMMY_SERIES);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const sortedSeries = [...series].sort((a, b) => {
    if (sortBy === 'popularity') return (b.viewCount || 0) - (a.viewCount || 0);
    if (sortBy === 'likes') return (b.subscriberCount || 0) - (a.subscriberCount || 0);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const filteredSeries = searchQuery
    ? sortedSeries.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.genre?.toLowerCase().includes(searchQuery.toLowerCase()))
    : sortedSeries;

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
    return count.toLocaleString();
  };

  const featured = sortedSeries[0];
  const topSeries = sortedSeries.slice(0, 6);

  return (
    <div className="w-full min-h-screen bg-white flex flex-col">
      {/* Hero Banner */}
      {featured && !searchQuery && (
        <section className="relative h-72 md:h-96 overflow-hidden">
          <img
            src={featured.coverImage}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end px-4 md:px-12 pb-8 md:pb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl"
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-green-400" />
                <span className="text-green-400 text-[10px] font-black uppercase tracking-widest">Featured</span>
              </div>
              <h2 className="text-white text-3xl md:text-5xl font-black leading-tight mb-3">{featured.title}</h2>
              <p className="text-white/70 text-sm md:text-base mb-4 line-clamp-2">
                {featured.tags?.join(' · ')} · {formatCount(featured.viewCount || 0)} reads
              </p>
              <button
                onClick={() => navigate(`/series/${featured.id}`)}
                className="text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all"
              >
                Read Now <ChevronRight size={16} />
              </button>
            </motion.div>
          </div>
        </section>
      )}

      {/* Search Bar */}
      <div className={`px-4 md:px-12 ${featured && !searchQuery ? 'py-6' : 'pt-6 pb-3'}`}>
        <div className="relative max-w-md">
          <Search size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${searchFocused ? 'text-green-500' : 'text-zinc-300'}`} />
          <input
            type="text"
            placeholder="Search stories..."
            value={searchQuery}
            onChange={(e) => handleSearchInput(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-zinc-50 border border-zinc-100 focus:bg-white focus:border-green-400/30 focus:ring-4 focus:ring-green-400/5 outline-none text-sm transition-all placeholder:text-zinc-300"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600 font-medium"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Sort Controls */}
      {!searchQuery && (
        <div className="px-4 md:px-12 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#4ade80' }}>
                {filteredSeries.length} series
              </h2>
              {useDummy && (
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-50 px-2 py-1 rounded-full">
                  Demo Content
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs">
              {(['popularity', 'likes', 'date'] as const).map(sort => (
                <React.Fragment key={sort}>
                  <button
                    onClick={() => setSortBy(sort)}
                    className={`font-medium transition-colors capitalize ${sortBy === sort ? 'text-black border-b-2 border-black pb-1' : 'text-zinc-400 hover:text-black'}`}
                  >
                    {sort}
                  </button>
                  {sort !== 'date' && <span className="text-zinc-200">|</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Series Grid */}
      <main className="flex-grow px-4 md:px-12 pb-12">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
            >
              {[...Array(12)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-zinc-100 rounded-xl mb-3" />
                  <div className="h-3 bg-zinc-100 rounded-full w-3/4 mb-2" />
                  <div className="h-2 bg-zinc-100 rounded-full w-1/2" />
                </div>
              ))}
            </motion.div>
          ) : filteredSeries.length > 0 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
            >
              {filteredSeries.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="group cursor-pointer"
                  onClick={() => navigate(`/series/${s.id}`)}
                >
                  <div className="aspect-[3/4] overflow-hidden rounded-xl bg-zinc-100 mb-3 relative">
                    <img
                      src={s.coverImage}
                      alt={s.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    {i < 3 && !searchQuery && (
                      <div className="absolute top-2 left-2 text-[10px] font-black text-white bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md uppercase">
                        Top {i + 1}
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-black leading-tight mb-1 line-clamp-2 group-hover:text-green-500 transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mb-1">{s.tags?.[0] || 'Genre'}</p>
                  <p className="text-xs font-medium" style={{ color: '#4ade80' }}>
                    {formatCount(s.viewCount || 0)} reads
                  </p>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-zinc-400 text-sm">
                {searchQuery ? `No results for "${searchQuery}"` : 'No series found'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
