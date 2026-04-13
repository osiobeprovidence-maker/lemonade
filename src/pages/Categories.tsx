import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, LayoutGrid, Zap, Ghost, Sword, Heart, Music, Camera, History, Landmark } from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORIES = [
  { name: 'Action', icon: Sword, color: 'bg-red-500', count: 124 },
  { name: 'Fantasy', icon: Zap, color: 'bg-purple-500', count: 89 },
  { name: 'Sci-Fi', icon: Ghost, color: 'bg-blue-500', count: 56 },
  { name: 'Slice of Life', icon: Heart, color: 'bg-pink-500', count: 210 },
  { name: 'Comedy', icon: Music, color: 'bg-yellow-500', count: 145 },
  { name: 'Mythology', icon: Landmark, color: 'bg-orange-500', count: 34 },
  { name: 'Historical', icon: History, color: 'bg-amber-700', count: 42 },
  { name: 'Romance', icon: Heart, color: 'bg-rose-400', count: 178 },
  { name: 'Drama', icon: Camera, color: 'bg-zinc-800', count: 95 },
];

export function Categories() {
  const navigate = useNavigate();

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
          <h1 className="text-xl font-black tracking-tight">Categories</h1>
        </div>
        <div className="p-2 bg-zinc-50 text-zinc-400 rounded-xl">
          <LayoutGrid size={20} />
        </div>
      </header>

      <main className="flex-grow p-6">
        <div className="grid grid-cols-2 gap-4">
          {CATEGORIES.map((cat, i) => (
            <motion.button
              key={cat.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate('/browse', { state: { category: cat.name } })}
              className="relative aspect-square rounded-[2.5rem] overflow-hidden group active:scale-95 transition-all"
            >
              <div className={`absolute inset-0 ${cat.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
              <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center">
                <div className={`w-12 h-12 rounded-2xl ${cat.color} text-white flex items-center justify-center mb-4 shadow-lg shadow-black/5`}>
                  <cat.icon size={24} />
                </div>
                <h3 className="text-sm font-black tracking-tight mb-1">{cat.name}</h3>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{cat.count} Stories</p>
              </div>
            </motion.button>
          ))}
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
