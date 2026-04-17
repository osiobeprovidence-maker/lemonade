import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Smartphone, Sparkles, Plus, Home, Compass, Palette, User } from 'lucide-react';
import { motion } from 'framer-motion';

// --- Types ---
type Tab = 'HOME' | 'ORIGINALS' | 'CANVAS' | 'MY';

interface Series {
  id: string;
  title: string;
  genre: string;
  creator: string;
  coverEmoji: string;
  rank?: number;
  trend?: number;
  chapters?: number;
  reads?: string;
  status?: 'Ongoing' | 'Hiatus' | 'Up to date' | 'New chapter';
  progress?: string;
}

// --- Mock Data ---
const TRENDING_SERIES = [
  { id: '1', title: 'Lagos 2099', genre: 'Sci-Fi', creator: 'Tunde', coverImage: 'https://picsum.photos/seed/lagos/600/800', rank: 1, trend: 12 },
  { id: '2', title: 'Spirit of Niger', genre: 'Fantasy', creator: 'Amaka', coverImage: 'https://picsum.photos/seed/spirit/600/800', rank: 2, trend: 5 },
  { id: '3', title: 'The Last Oba', genre: 'Historical', creator: 'Bayo', coverImage: 'https://picsum.photos/seed/oba/600/800', rank: 3, trend: -2 },
  { id: '4', title: 'Naija High', genre: 'Comedy', creator: 'Chioma', coverImage: 'https://picsum.photos/seed/school/600/800', rank: 4, trend: 8 },
  { id: '5', title: 'Desert Rose', genre: 'Romance', creator: 'Zainab', coverImage: 'https://picsum.photos/seed/rose/600/800', rank: 5, trend: 1 },
  { id: '6', title: 'Iron Heart', genre: 'Action', creator: 'Kofi', coverImage: 'https://picsum.photos/seed/iron/600/800', rank: 6, trend: 3 },
];

const ORIGINALS_SERIES = [
  { id: 'o1', title: 'Shango Reborn', genre: 'Mythology', creator: 'Lemonade', coverImage: 'https://picsum.photos/seed/shango/600/800', chapters: 45, reads: '1.2M', status: 'Ongoing' },
  { id: 'o2', title: 'Queen Amina', genre: 'Action', creator: 'Lemonade', coverImage: 'https://picsum.photos/seed/amina/600/800', chapters: 82, reads: '2.5M', status: 'Ongoing' },
  { id: 'o3', title: 'Ancestors', genre: 'Fantasy', creator: 'Lemonade', coverImage: 'https://picsum.photos/seed/ancestors/600/800', chapters: 12, reads: '450K', status: 'Hiatus' },
  { id: 'o4', title: 'Solar Punk', genre: 'Sci-Fi', creator: 'Lemonade', coverImage: 'https://picsum.photos/seed/solar/600/800', chapters: 30, reads: '890K', status: 'Ongoing' },
];

const CANVAS_SERIES = [
  { id: 'c1', title: 'My Lagos Life', genre: 'Slice of Life', creator: 'Jide_Art', coverImage: 'https://picsum.photos/seed/lagoslife/600/800', reads: '12K' },
  { id: 'c2', title: 'Cyber-Kano', genre: 'Sci-Fi', creator: 'Techie_B', coverImage: 'https://picsum.photos/seed/kano/600/800', reads: '8K' },
  { id: 'c3', title: 'Forest Spirits', genre: 'Mythology', creator: 'Nature_Gal', coverImage: 'https://picsum.photos/seed/forest/600/800', reads: '15K' },
];

const MY_LIST = [
  { id: '1', title: 'Lagos 2099', genre: 'Sci-Fi', creator: 'Tunde', coverImage: 'https://picsum.photos/seed/lagos/600/800', progress: 'Ch. 14 of 18', status: 'New chapter' },
  { id: 'o2', title: 'Queen Amina', genre: 'Action', creator: 'Lemonade', coverImage: 'https://picsum.photos/seed/amina/600/800', progress: 'Ch. 82 of 82', status: 'Up to date' },
  { id: 'o3', title: 'Ancestors', genre: 'Fantasy', creator: 'Lemonade', coverImage: 'https://picsum.photos/seed/ancestors/600/800', progress: 'Ch. 5 of 12', status: 'Hiatus' },
];

// --- Components ---

const SeriesCard = ({ series, type = 'grid-3', showRank = false, rankNum }: { series: any, type?: 'grid-3' | 'grid-2' | 'row', showRank?: boolean, rankNum?: number }) => {
  const navigate = useNavigate();
  
  return (
    <div 
      onClick={() => navigate(`/series/${series.id}`)}
      className={`flex flex-col gap-2 cursor-pointer group ${type === 'grid-3' ? 'w-full' : ''}`}
    >
      <div className="relative aspect-[3/4] bg-zinc-900 rounded-2xl overflow-hidden shadow-sm border border-white/5 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_12px_30px_rgba(30,215,96,0.15)] group-hover:border-primary/30">
        <img src={series.coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {showRank && rankNum && (
          <div 
            className="absolute -bottom-2 -left-2 text-[70px] md:text-[80px] font-black leading-none text-transparent drop-shadow-xl" 
            style={{ WebkitTextStroke: '2px rgba(255,255,255,0.8)' }}
          >
            {rankNum}
          </div>
        )}
        {series.status === 'New chapter' && (
          <div className="absolute top-2 left-2 bg-primary text-black text-[9px] font-black px-2 py-1 rounded shadow-sm uppercase tracking-wide">
            New
          </div>
        )}
      </div>
      <div className="flex flex-col px-1 mt-2">
        <h3 className="text-sm font-black line-clamp-1 leading-tight text-white group-hover:text-primary transition-colors">{series.title}</h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{series.genre}</span>
          {series.trend !== undefined && (
            <span className={`text-[10px] font-bold ${series.trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {series.trend >= 0 ? '▲' : '▼'}{Math.abs(series.trend)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export function LemonadeMobile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('HOME');
  const [homeSubTab, setHomeSubTab] = useState<'Trending' | 'Popular'>('Trending');
  const [genreFilter, setGenreFilter] = useState('All');

  const genres = ['All', 'Action', 'Romance', 'Fantasy', 'Sci-Fi', 'Mythology', 'Comedy'];

  const renderHome = () => (
    <div className="animate-in fade-in duration-500 w-full max-w-[1200px] mx-auto pb-12">
      {/* Featured Banner */}
      <section className="relative w-full h-[65vh] min-h-[480px]">
        <img 
          src="https://picsum.photos/seed/lemonade-hero/1200/600" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end items-start">
          <div className="flex gap-2 mb-3">
            <span className="bg-primary text-primary-foreground text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-sm shadow shadow-primary/20">Featured</span>
            <span className="bg-white/10 backdrop-blur-sm text-white text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-sm border border-white/20">Mythology</span>
          </div>
          <h2 className="text-white text-5xl font-black leading-[0.9] tracking-tighter mb-4 drop-shadow-xl">SHANGO<br />REBORN</h2>
          <p className="text-white/80 text-sm line-clamp-2 max-w-[90%] mb-6 font-medium leading-relaxed">The God of Thunder returns to a modern world that has forgotten its roots.</p>
          <div className="flex w-full gap-3 mt-2">
            <button className="flex-1 bg-primary text-primary-foreground py-4 rounded-[16px] font-black shadow-[0_4px_20px_rgba(30,215,96,0.3)] flex justify-center items-center gap-2 transform active:scale-95 transition-all text-[15px]" onClick={() => navigate('/series/o1')}>
              <span className="w-4 h-4 flex justify-center items-center"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span> Read
            </button>
            <button className="flex-1 bg-white/10 text-white border border-white/20 py-4 rounded-[16px] font-black backdrop-blur-md flex justify-center items-center gap-2 transform active:scale-95 transition-all text-[15px]">
              <Plus size={18} /> Library
            </button>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-4 px-4">
          <h2 className="text-xl font-black tracking-tighter text-white flex items-center gap-2">Explore <Sparkles className="w-5 h-5 text-primary"/></h2>
        </div>
        <div className="flex gap-3 px-4 overflow-x-auto pb-4 no-scrollbar">
          {genres.map(genre => {
            const isActive = genreFilter === genre;
            return (
              <button
                key={genre}
                onClick={() => setGenreFilter(genre)}
                className={`px-6 py-2.5 rounded-full text-[13px] font-black tracking-wide whitespace-nowrap transition-all duration-300 ${isActive ? 'bg-primary text-black shadow-lg shadow-primary/20 scale-105' : 'bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white'}`}
              >
                {genre}
              </button>
            );
          })}
        </div>
      </section>

      {/* Trending Mobile (Swipeable Horizontal) */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-6 px-4">
          <h2 className="text-2xl font-black tracking-tighter text-white">Trending Now</h2>
          <button className="text-xs font-black text-zinc-400 flex items-center uppercase tracking-widest gap-1" onClick={() => navigate('/rankings')}>View <ChevronRight size={14}/></button>
        </div>
        <div className="flex gap-4 overflow-x-auto px-4 pb-6 pt-2 no-scrollbar snap-x">
          {TRENDING_SERIES.map((s, idx) => (
            <div key={s.id} className="min-w-[80vw] snap-center relative" onClick={() => navigate(`/series/${s.id}`)}>
              <div 
                className="absolute -left-3 -top-4 z-20 text-[80px] font-black leading-none drop-shadow-2xl text-transparent"
                style={{ WebkitTextStroke: '2px rgba(255,255,255,0.8)' }}
              >
                {idx + 1}
              </div>
              <div className="relative aspect-[4/5] bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden shadow-2xl ml-8">
                <img src={s.coverImage} className="w-full h-full object-cover opacity-90" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 p-5 w-full">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest backdrop-blur-md">{s.genre}</span>
                  </div>
                  <h3 className="text-white font-black text-2xl leading-tight line-clamp-1">{s.title}</h3>
                  <p className="text-zinc-400 text-xs font-bold mt-1 tracking-wide">by {s.creator}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* New Releases Mobile */}
      <section className="mt-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black tracking-tighter text-white">New Drops</h2>
          <span className="text-xs font-black text-zinc-400 uppercase tracking-widest cursor-pointer">All</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {ORIGINALS_SERIES.map((s) => (
            <SeriesCard key={s.id} series={s} />
          ))}
        </div>
      </section>
    </div>
  );

  const renderOriginals = () => (
    <div className="animate-in fade-in duration-500 w-full max-w-[1200px] mx-auto px-4 md:px-0 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-2">
            Lemonade Originals
            <Sparkles size={24} className="text-brand-yellow" />
          </h2>
          <p className="text-sm text-zinc-500 mt-1 font-bold">Exclusive stories you won't find anywhere else.</p>
        </div>
      </div>
      
      {/* Genre Filters */}
      <div className="flex gap-2 overflow-x-auto py-3 mb-6 no-scrollbar border-b border-white/5 sticky top-0 bg-zinc-950/80 backdrop-blur-md z-20">
        {genres.map(genre => (
          <button
            key={genre}
            onClick={() => setGenreFilter(genre)}
            className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
              genreFilter === genre ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-10">
        {ORIGINALS_SERIES.map((s) => (
          <div 
            key={s.id} 
            onClick={() => navigate(`/series/${s.id}`)}
            className="flex flex-col gap-3 cursor-pointer active:scale-95 transition-transform group"
          >
            <div className="relative aspect-[3/4] bg-zinc-900 rounded-[2rem] overflow-hidden shadow-sm border border-white/5 shadow-black/20 group-hover:border-primary/30 transition-all">
              <img src={s.coverImage} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
              <div className="absolute top-0 left-0 bg-primary text-primary-foreground text-[8px] font-black px-3 py-1.5 rounded-br-2xl uppercase tracking-widest">
                Original
              </div>
            </div>
            <div className="px-1">
              <h3 className="text-sm font-black leading-tight line-clamp-1 tracking-tight text-white group-hover:text-primary transition-colors">{s.title}</h3>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">{s.genre}</p>
              <div className="flex items-center gap-2 mt-2 text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                <span>{s.reads} Reads</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCanvas = () => (
    <div className="animate-in fade-in duration-500 w-full max-w-[1200px] mx-auto px-4 md:px-0 py-8">
      {/* Submit Banner */}
      <section className="py-6">
        <div className="bg-primary rounded-[2.5rem] p-8 text-primary-foreground relative overflow-hidden shadow-2xl shadow-primary/20">
          <div className="relative z-10">
            <h2 className="text-2xl font-black mb-2 leading-tight tracking-tighter">SUBMIT YOUR WORK</h2>
            <p className="text-primary-foreground/80 text-[10px] font-bold uppercase tracking-widest mb-6 max-w-[200px]">Share your stories with the world.</p>
            <button 
              onClick={() => navigate('/studio')}
              className="bg-zinc-950 text-white hover:text-primary px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl transition-colors"
            >
              <Plus size={16} /> Start Uploading
            </button>
          </div>
          <div className="absolute right-[-20px] bottom-[-20px] opacity-10 rotate-12">
            <Smartphone size={160} />
          </div>
        </div>
      </section>

      <div className="py-8">
        <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-6">Community Works</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-10">
          {CANVAS_SERIES.map((s) => (
            <div 
              key={s.id} 
              onClick={() => navigate(`/series/${s.id}`)}
              className="flex flex-col gap-3 cursor-pointer active:scale-95 transition-transform group"
            >
              <div className="aspect-[3/4] bg-zinc-900 rounded-[2rem] overflow-hidden border border-white/5 shadow-sm shadow-black/20 group-hover:border-primary/30 transition-all">
                <img src={s.coverImage} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
              </div>
              <div className="px-1 text-white">
                <h3 className="text-sm font-black line-clamp-1 tracking-tight group-hover:text-primary transition-colors">{s.title}</h3>
                <p className="text-[10px] text-zinc-500 font-bold mt-1 uppercase tracking-widest">by {s.creator}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMy = () => (
    <div className="animate-in fade-in duration-500 w-full max-w-[1200px] mx-auto px-4 md:px-0 py-8">
      <div className="flex items-center justify-between mb-8 px-2">
        <h2 className="text-2xl md:text-3xl font-black tracking-tighter">My Library</h2>
        <button className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Edit</button>
      </div>

      <div className="space-y-6">
        {MY_LIST.map((s) => (
          <div 
            key={s.id} 
            onClick={() => navigate(`/series/${s.id}`)}
            className="flex gap-4 items-center p-4 bg-zinc-900 rounded-[2rem] border border-white/5 cursor-pointer active:scale-98 transition-all shadow-lg hover:border-primary/20 group"
          >
            <div className="relative w-20 md:w-32 h-24 md:h-40 bg-zinc-800 rounded-2xl flex-shrink-0 overflow-hidden shadow-sm group-hover:shadow-primary/10 transition-shadow">
              <img src={s.coverImage} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
              {s.status === 'New chapter' && (
                <div className="absolute top-2 right-2 w-3 h-3 bg-primary rounded-full border-2 border-zinc-950 shadow-lg" />
              )}
            </div>
            <div className="flex-grow min-w-0">
              <div className="flex items-center justify-between text-white group-hover:text-primary transition-colors">
                <h3 className="font-black text-sm md:text-xl truncate tracking-tight">{s.title}</h3>
                <ChevronRight size={16} />
              </div>
              <p className="text-[10px] md:text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">{s.genre}</p>
              <p className="text-[10px] md:text-sm text-zinc-500 mt-2 font-black uppercase tracking-widest">{s.progress}</p>
              <p className={`text-[9px] md:text-xs mt-2 font-black uppercase tracking-widest ${
                s.status === 'New chapter' ? 'text-primary' : 
                s.status === 'Up to date' ? 'text-green-500' : 'text-zinc-500'
              }`}>
                {s.status}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 p-8 bg-zinc-900 rounded-[2.5rem] border border-white/5 text-center shadow-lg">
        <p className="text-[10px] md:text-xs font-black text-zinc-500 uppercase tracking-widest mb-6">Want to see more?</p>
        <button 
          onClick={() => setActiveTab('ORIGINALS')}
          className="w-full md:w-auto md:px-12 py-4 bg-primary border-none rounded-2xl text-[10px] font-black uppercase tracking-widest text-primary-foreground shadow-[0_4px_20px_rgba(30,215,96,0.2)] active:scale-95 transition-all hover:bg-primary/90"
        >
          Browse Originals
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-zinc-950 text-white flex flex-col min-h-screen dark">
      {/* Main Content Area */}
      <main className="flex-grow pb-24">
        {activeTab === 'HOME' && renderHome()}
        {activeTab === 'ORIGINALS' && renderOriginals()}
        {activeTab === 'CANVAS' && renderCanvas()}
        {activeTab === 'MY' && renderMy()}
      </main>

      {/* Bottom Tab Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/90 backdrop-blur-xl border-t border-white/5 z-50 md:hidden">
        <div className="flex justify-around items-center h-20 max-w-[430px] mx-auto pb-2">
          {([
            { id: 'HOME' as Tab, label: 'Home', icon: Home },
            { id: 'ORIGINALS' as Tab, label: 'Originals', icon: Compass },
            { id: 'CANVAS' as Tab, label: 'Canvas', icon: Palette },
            { id: 'MY' as Tab, label: 'My', icon: User },
          ]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors relative ${
                activeTab === id ? 'text-primary' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon size={24} strokeWidth={activeTab === id ? 2.5 : 2} className="mb-1" />
              <span className="text-[9px] font-black uppercase tracking-widest leading-none">{label}</span>
              {activeTab === id && (
                <motion.div layoutId="mobile-nav-indicator" className="w-1.5 h-1.5 bg-primary rounded-full absolute -top-1" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
