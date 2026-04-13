import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu as MenuIcon, Search, X } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../lib/firebase';
import { Logo } from './Logo';

const SELF_CONTAINED_PAGES = ['/login', '/menu', '/profile', '/notifications', '/rankings', '/help', '/promo', '/categories', '/new-releases', '/wallet'];

export function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useAuthState(auth);
  const [activeTab, setActiveTab] = React.useState<string>('ORIGINALS');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const isSelfContained = SELF_CONTAINED_PAGES.some(p => location.pathname.startsWith(p));

  React.useEffect(() => {
    if (location.pathname === '/') setActiveTab('ORIGINALS');
    else if (location.pathname.includes('/studio')) setActiveTab('CANVAS');
    else if (location.pathname === '/profile') setActiveTab('PROFILE');
    else setActiveTab('ORIGINALS');
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:flex sticky top-0 z-50 bg-white border-b border-zinc-200 px-6 lg:px-12 h-16 items-center justify-between">
        <div className="flex items-center gap-10">
          <Logo />
          <nav className="flex items-center gap-6">
            <button
              onClick={() => navigate('/browse')}
              className={`text-xs font-bold tracking-wide uppercase transition-colors ${activeTab === 'ORIGINALS' ? 'text-black border-b-2 border-black pb-1' : 'text-zinc-400 hover:text-black'}`}
            >
              ORIGINALS
            </button>
            <button
              onClick={() => navigate('/studio')}
              className={`text-xs font-bold tracking-wide uppercase transition-colors ${activeTab === 'CANVAS' ? 'text-black border-b-2 border-black pb-1' : 'text-zinc-400 hover:text-black'}`}
            >
              CANVAS
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stories..."
                className="w-64 px-4 py-2 rounded-full bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-green-400/30 outline-none text-sm transition-all"
                autoFocus
              />
              <button type="submit" className="p-2 text-zinc-400 hover:text-black transition-colors">
                <Search size={16} />
              </button>
              <button type="button" onClick={() => { setSearchOpen(false); setSearchQuery(''); }} className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors">
                <X size={16} />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-zinc-400 hover:text-black hover:bg-zinc-50 rounded-full transition-all"
            >
              <Search size={18} />
            </button>
          )}
          {user ? (
            <button
              onClick={() => navigate('/profile')}
              className="text-xs font-bold text-zinc-600 hover:text-black px-4 py-2 rounded-full border border-zinc-200 hover:border-zinc-300 transition-all"
            >
              My Account
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="text-xs font-bold text-white px-5 py-2 rounded-full hover:opacity-90 transition-all"
              style={{ backgroundColor: '#1DB954' }}
            >
              Log In
            </button>
          )}
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 bg-white/90 backdrop-blur-md px-4 border-b border-zinc-100">
        <div className="flex justify-between items-center h-14">
          {isSelfContained ? (
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 hover:bg-zinc-50 rounded-full transition-colors"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-700">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
          ) : (
            <Logo />
          )}

          <div className="flex items-center gap-1">
            {!isSelfContained && (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 hover:bg-zinc-50 rounded-full transition-colors"
              >
                <Search size={20} className="text-zinc-500" />
              </button>
            )}
            <button
              onClick={() => navigate('/menu')}
              className="p-2 hover:bg-zinc-50 rounded-full transition-colors"
            >
              <MenuIcon size={22} className="text-zinc-700" />
            </button>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        {searchOpen && (
          <div className="pb-3 pt-1">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stories..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-green-400/30 outline-none text-sm"
                autoFocus
              />
              <button type="submit" className="px-4 py-2.5 text-white text-xs font-bold rounded-xl" style={{ backgroundColor: '#1DB954' }}>
                Search
              </button>
              <button type="button" onClick={() => { setSearchOpen(false); setSearchQuery(''); }} className="p-2 text-zinc-400">
                <X size={18} />
              </button>
            </form>
          </div>
        )}
      </header>
    </>
  );
}
