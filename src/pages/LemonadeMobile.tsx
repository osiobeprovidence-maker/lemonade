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
      <div className="relative aspect-[3/4] bg-zinc-100 rounded-lg overflow-hidden shadow-sm border border-zinc-200 group-hover:shadow-md transition-all">
        <img src={series.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
        {showRank && rankNum && (
          <div 
            className="absolute -bottom-2 -left-1 text-[60px] md:text-[80px] font-black leading-none text-black" 
            style={{ WebkitTextStroke: '2px white' }}
          >
            {rankNum}
          </div>
        )}
        {series.status === 'New chapter' && (
          <div className="absolute top-2 right-2 bg-brand-yellow text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase shadow-lg shadow-brand-yellow/20">
            New
          </div>
        )}
      </div>
      <div className="flex flex-col px-1 mt-2">
        <h3 className="text-sm font-bold line-clamp-1 leading-tight">{series.title}</h3>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-xs text-zinc-500">{series.genre}</span>
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
    <div className="animate-in fade-in duration-500 w-full max-w-[1200px] mx-auto">
      {/* Featured Banner */}
      <section className="px-4 md:px-0 py-4 md:py-8">
        <div className="relative h-48 md:h-[400px] rounded-xl overflow-hidden bg-zinc-900 group cursor-pointer">
          <img 
            src="https://picsum.photos/seed/lemonade-hero/1200/600" 
            className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
            <span className="text-brand-yellow text-[10px] md:text-xs font-black tracking-widest uppercase mb-2">Featured Original</span>
            <h2 className="text-white text-2xl md:text-5xl font-black leading-tight mb-3">SHANGO REBORN</h2>
            <p className="text-white/80 text-xs md:text-base line-clamp-2 max-w-2xl">The God of Thunder returns to a modern world that has forgotten its roots.</p>
          </div>
        </div>
      </section>

      {/* Trending & Popular */}
      <section className="px-4 md:px-0 mt-8 md:mt-12">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">Trending & Popular Series</h2>
          <button onClick={() => navigate('/rankings')} className="text-sm font-bold text-zinc-500 hover:text-black flex items-center gap-1">View all <ChevronRight size={16}/></button>
        </div>
        
        <div className="flex gap-2 mb-8">
          {(['Trending', 'Popular'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setHomeSubTab(tab)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                homeSubTab === tab ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 md:grid-cols-5 gap-x-4 gap-y-10">
          {TRENDING_SERIES.map((s, idx) => (
            <SeriesCard key={s.id} series={s} showRank rankNum={idx + 1} />
          ))}
        </div>
      </section>

      {/* New Releases Row */}
      <section className="mt-12 pb-12 px-4 md:px-0">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">New Releases</h2>
          <span className="text-sm font-bold text-brand-yellow cursor-pointer hover:underline">View All</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {TRENDING_SERIES.map((s) => (
            <SeriesCard key={`new-${s.id}`} series={s} />
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
      <div className="flex gap-2 overflow-x-auto py-3 mb-6 no-scrollbar border-b border-zinc-50 sticky top-0 bg-white/80 backdrop-blur-md z-20">
        {genres.map(genre => (
          <button
            key={genre}
            onClick={() => setGenreFilter(genre)}
            className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
              genreFilter === genre ? 'bg-brand-yellow text-black shadow-lg shadow-brand-yellow/20' : 'bg-zinc-50 text-zinc-400 hover:bg-zinc-100'
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
            className="flex flex-col gap-3 cursor-pointer active:scale-95 transition-transform"
          >
            <div className="relative aspect-[3/4] bg-zinc-100 rounded-[2rem] overflow-hidden shadow-sm border border-zinc-50">
              <img src={s.coverImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute top-0 left-0 bg-black text-white text-[8px] font-black px-3 py-1.5 rounded-br-2xl uppercase tracking-widest">
                Original
              </div>
            </div>
            <div className="px-1">
              <h3 className="text-sm font-black leading-tight line-clamp-1 tracking-tight">{s.title}</h3>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">{s.genre}</p>
              <div className="flex items-center gap-2 mt-2 text-[10px] text-zinc-300 font-black uppercase tracking-widest">
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
        <div className="bg-brand-yellow rounded-[2.5rem] p-8 text-black relative overflow-hidden shadow-2xl shadow-brand-yellow/20">
          <div className="relative z-10">
            <h2 className="text-2xl font-black mb-2 leading-tight tracking-tighter">SUBMIT YOUR WORK</h2>
            <p className="text-black/80 text-[10px] font-bold uppercase tracking-widest mb-6 max-w-[200px]">Share your stories with the world.</p>
            <button 
              onClick={() => navigate('/studio')}
              className="bg-white text-brand-yellow px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl"
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
              className="flex flex-col gap-3 cursor-pointer active:scale-95 transition-transform"
            >
              <div className="aspect-[3/4] bg-zinc-100 rounded-[2rem] overflow-hidden border border-zinc-50 shadow-sm">
                <img src={s.coverImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="px-1">
                <h3 className="text-sm font-black line-clamp-1 tracking-tight">{s.title}</h3>
                <p className="text-[10px] text-zinc-400 font-bold mt-1 uppercase tracking-widest">by {s.creator}</p>
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
            className="flex gap-4 items-center p-4 bg-zinc-50 rounded-[2rem] border border-zinc-100 cursor-pointer active:scale-98 transition-all"
          >
            <div className="w-20 md:w-32 h-24 md:h-40 bg-zinc-200 rounded-2xl flex-shrink-0 overflow-hidden shadow-sm">
              <img src={s.coverImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              {s.status === 'New chapter' && (
                <div className="absolute top-2 right-2 w-3 h-3 bg-brand-yellow rounded-full border-2 border-white shadow-lg" />
              )}
            </div>
            <div className="flex-grow min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm md:text-xl truncate tracking-tight">{s.title}</h3>
                <ChevronRight size={16} className="text-zinc-300" />
              </div>
              <p className="text-[10px] md:text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">{s.genre}</p>
              <p className="text-[10px] md:text-sm text-zinc-500 mt-2 font-black uppercase tracking-widest">{s.progress}</p>
              <p className={`text-[9px] md:text-xs mt-2 font-black uppercase tracking-widest ${
                s.status === 'New chapter' ? 'text-brand-yellow' : 
                s.status === 'Up to date' ? 'text-green-500' : 'text-zinc-300'
              }`}>
                {s.status}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 p-8 bg-zinc-50 rounded-[2.5rem] border border-zinc-100 text-center">
        <p className="text-[10px] md:text-xs font-black text-zinc-300 uppercase tracking-widest mb-6">Want to see more?</p>
        <button 
          onClick={() => setActiveTab('ORIGINALS')}
          className="w-full md:w-auto md:px-12 py-4 bg-white border border-zinc-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-brand-yellow shadow-sm active:scale-95 transition-all"
        >
          Browse Originals
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-white flex flex-col min-h-screen">
      {/* Main Content Area */}
      <main className="flex-grow pb-20">
        {activeTab === 'HOME' && renderHome()}
        {activeTab === 'ORIGINALS' && renderOriginals()}
        {activeTab === 'CANVAS' && renderCanvas()}
        {activeTab === 'MY' && renderMy()}
      </main>

      {/* Bottom Tab Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 z-50 md:hidden">
        <div className="flex justify-around items-center h-16 max-w-[430px] mx-auto">
          {([
            { id: 'HOME' as Tab, label: 'Home', icon: Home },
            { id: 'ORIGINALS' as Tab, label: 'Originals', icon: Compass },
            { id: 'CANVAS' as Tab, label: 'Canvas', icon: Palette },
            { id: 'MY' as Tab, label: 'My', icon: User },
          ]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
                activeTab === id ? 'text-brand-yellow' : 'text-zinc-400'
              }`}
            >
              <Icon size={22} strokeWidth={activeTab === id ? 2.5 : 1.5} />
              <span className="text-[10px] font-bold mt-1 uppercase tracking-wide">{label}</span>
              {activeTab === id && (
                <div className="w-1 h-1 bg-brand-yellow rounded-full mt-0.5" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
