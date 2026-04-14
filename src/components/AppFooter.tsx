import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { Logo } from './Logo';

export function AppFooter() {
  return (
    <footer className="bg-zinc-50 pt-16 pb-12 px-8 border-t border-zinc-100">
      <div className="flex flex-col items-center gap-10">
        {/* Logo & Tagline */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-3">
            <Logo />
          </div>
          <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] leading-relaxed">
            Every story has a taste<br />sweet, sour, or both.
          </p>
        </div>

        {/* Social Links */}
        <div className="flex gap-8 text-zinc-300">
          <Facebook size={18} className="hover:text-brand-yellow cursor-pointer transition-colors" />
          <Twitter size={18} className="hover:text-brand-yellow cursor-pointer transition-colors" />
          <Instagram size={18} className="hover:text-brand-yellow cursor-pointer transition-colors" />
          <Youtube size={18} className="hover:text-brand-yellow cursor-pointer transition-colors" />
        </div>

        {/* Platform Links */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-[9px] font-black text-zinc-400 uppercase tracking-widest">
          <Link to="/help" className="hover:text-black transition-colors">About</Link>
          <Link to="/studio" className="hover:text-black transition-colors">Creators</Link>
          <Link to="/help" className="hover:text-black transition-colors">Terms</Link>
          <Link to="/help" className="hover:text-black transition-colors">Privacy</Link>
        </div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">
            © {new Date().getFullYear()} LEMONADE
          </p>
        </div>
      </div>
    </footer>
  );
}
