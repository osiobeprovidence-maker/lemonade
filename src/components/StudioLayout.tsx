import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Megaphone,
  BarChart3,
  Settings,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StudioLayoutProps {
  children: React.ReactNode;
}

export function StudioLayout({ children }: StudioLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/studio' },
    { icon: Megaphone, label: 'Ads Manager', path: '/studio/ads' },
    { icon: BarChart3, label: 'Analytics', path: '/studio/analytics' },
    { icon: Settings, label: 'Settings', path: '/studio/settings' },
  ];

  const currentItem = menuItems.find(item => item.path === location.pathname) || menuItems[0];

  return (
    <div className="w-full min-h-screen bg-white flex flex-col">
      {/* Studio Header */}
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-zinc-100 px-4 md:px-8 h-14 flex items-center justify-between">
        <h1 className="text-sm font-black tracking-tight">Studio</h1>

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-50 rounded-full border border-zinc-100 hover:bg-zinc-100 transition-all"
          >
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#4ade80' }}>
              {currentItem.label}
            </span>
            <ChevronDown size={14} className={`text-zinc-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsDropdownOpen(false)}
                  className="fixed inset-0 z-[-1]"
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-zinc-100 overflow-hidden py-2"
                >
                  {menuItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsDropdownOpen(false)}
                      className={`flex items-center gap-3 px-5 py-3 transition-colors ${
                        location.pathname === item.path
                          ? 'bg-green-50 text-green-600'
                          : 'text-zinc-500 hover:bg-zinc-50'
                      }`}
                    >
                      <item.icon size={16} />
                      <span className="text-xs font-semibold">
                        {item.label}
                      </span>
                    </Link>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}
