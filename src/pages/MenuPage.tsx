import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Library,
  Bell,
  BarChart3,
  Wallet,
  Upload,
  LayoutGrid,
  Sparkles,
  Trophy,
  Settings,
  Ticket,
  HelpCircle,
  LogOut,
  ChevronRight,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../lib/firebase';

interface MenuItemProps {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  highlight?: boolean;
}

const MenuItem = ({ icon: Icon, title, subtitle, onClick, highlight }: MenuItemProps) => (
  <motion.button
    whileTap={{ backgroundColor: 'rgba(0, 0, 0, 0.03)' }}
    onClick={onClick}
    className="w-full flex items-center justify-between px-4 md:px-0 py-4 transition-colors group"
  >
    <div className="flex items-center gap-4">
      <div className={`p-2.5 rounded-xl ${highlight ? 'text-green-500 bg-green-50' : 'text-zinc-400 bg-zinc-50'}`}>
        <Icon size={18} strokeWidth={1.5} />
      </div>
      <div className="text-left">
        <p className={`text-sm font-semibold leading-tight ${highlight ? 'text-green-600' : 'text-zinc-800'}`}>
          {title}
        </p>
        {subtitle && (
          <p className="text-[11px] text-zinc-400 mt-0.5 font-medium">
            {subtitle}
          </p>
        )}
      </div>
    </div>
    <ChevronRight size={16} className="text-zinc-200 group-hover:text-zinc-400 transition-colors" />
  </motion.button>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="px-4 md:px-0 pt-6 pb-2 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
    {children}
  </p>
);

export function MenuPage() {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);

  const handleLogout = () => {
    auth.signOut();
    navigate('/');
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col">
      {/* Close Button */}
      <div className="flex justify-end px-4 md:px-0 pt-4 max-w-md mx-auto w-full">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-zinc-50 rounded-full transition-colors"
        >
          <X size={20} className="text-zinc-400" />
        </button>
      </div>

      {/* User Profile Header */}
      <motion.div
        whileTap={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
        onClick={() => navigate('/profile')}
        className="px-4 md:px-0 py-6 flex items-center gap-4 cursor-pointer border-b border-zinc-50 max-w-md mx-auto w-full"
      >
        <div className="w-14 h-14 rounded-full bg-zinc-50 overflow-hidden flex-shrink-0 flex items-center justify-center">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User size={24} className="text-zinc-300" />
          )}
        </div>
        <div>
          <h2 className="text-lg font-black tracking-tight leading-none text-zinc-800">
            {user?.displayName || 'Guest User'}
          </h2>
          <p className="text-xs font-bold mt-1.5 flex items-center gap-1" style={{ color: '#4ade80' }}>
            View Profile <ChevronRight size={12} />
          </p>
        </div>
      </motion.div>

      {/* Menu Content */}
      <div className="flex-grow overflow-y-auto no-scrollbar pb-24">
        <div className="max-w-md mx-auto px-4 md:px-0">
          <SectionLabel>Account</SectionLabel>
          <MenuItem icon={User} title="Profile" subtitle="Personal info & preferences" onClick={() => navigate('/profile')} />
          <MenuItem icon={Library} title="My Library" subtitle="Reading list & history" onClick={() => navigate('/')} />
          <MenuItem icon={Bell} title="Notifications" subtitle="Updates on your series" onClick={() => navigate('/notifications')} />

          <div className="h-px bg-zinc-50 mt-2" />

          <SectionLabel>Creator</SectionLabel>
          <MenuItem
            icon={BarChart3}
            title="Ads Manager"
            subtitle="Monetize your content"
            highlight
            onClick={() => navigate('/studio/ads')}
          />
          <MenuItem icon={Wallet} title="Earnings / Wallet" subtitle="Check your balance" onClick={() => navigate('/wallet')} />
          <MenuItem icon={Upload} title="Upload Content" subtitle="Share your stories" onClick={() => navigate('/studio')} />

          <div className="h-px bg-zinc-50 mt-2" />

          <SectionLabel>Discover</SectionLabel>
          <MenuItem icon={LayoutGrid} title="Categories" onClick={() => navigate('/categories')} />
          <MenuItem icon={Sparkles} title="New Releases" onClick={() => navigate('/new-releases')} />
          <MenuItem icon={Trophy} title="Rankings" onClick={() => navigate('/rankings')} />

          <div className="h-px bg-zinc-50 mt-2" />

          <SectionLabel>System</SectionLabel>
          <MenuItem icon={Settings} title="Settings" onClick={() => navigate('/studio/settings')} />
          <MenuItem icon={Ticket} title="Promo Code" onClick={() => navigate('/promo')} />
          <MenuItem icon={HelpCircle} title="Help & Support" onClick={() => navigate('/help')} />
        </div>
      </div>

      {/* Logout Button */}
      <div className="p-4 md:p-6 bg-white border-t border-zinc-50">
        <div className="max-w-md mx-auto">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full py-3.5 bg-zinc-900 text-white rounded-xl font-black text-sm tracking-widest flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all"
          >
            <LogOut size={16} />
            LOG OUT
          </motion.button>
        </div>
      </div>
    </div>
  );
}
