import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, HelpCircle, MessageCircle, Mail, FileText, ChevronRight, Search, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export function HelpSupport() {
  const navigate = useNavigate();

  const faqs = [
    { q: "How do I earn coins?", a: "You can purchase coins in the wallet or earn them through daily rewards and special events." },
    { q: "Can I publish my own manga?", a: "Yes! Use the Studio section to upload your series and start building your audience." },
    { q: "Is Lemonade free to use?", a: "Most content is free, but some premium chapters require coins to unlock." },
    { q: "How do I contact support?", a: "You can reach us via email or through our social media channels." }
  ];

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
          <h1 className="text-xl font-black tracking-tight">Help & Support</h1>
        </div>
      </header>

      <main className="flex-grow p-6">
        {/* Search Bar */}
        <div className="relative mb-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
          <input 
            type="text" 
            placeholder="Search for help..."
            className="w-full pl-11 pr-4 py-4 rounded-2xl bg-zinc-50 border-none focus:ring-2 focus:ring-brand-yellow outline-none text-sm font-bold"
          />
        </div>

        {/* Contact Options */}
        <div className="grid grid-cols-2 gap-4 mb-12">
          <button className="p-6 bg-zinc-50 rounded-[2rem] border border-zinc-100 flex flex-col items-center text-center group active:scale-95 transition-all">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-yellow shadow-sm mb-4 group-hover:bg-brand-yellow group-hover:text-white transition-colors">
              <MessageCircle size={24} />
            </div>
            <p className="text-xs font-black uppercase tracking-widest">Live Chat</p>
          </button>
          <button className="p-6 bg-zinc-50 rounded-[2rem] border border-zinc-100 flex flex-col items-center text-center group active:scale-95 transition-all">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-yellow shadow-sm mb-4 group-hover:bg-brand-yellow group-hover:text-white transition-colors">
              <Mail size={24} />
            </div>
            <p className="text-xs font-black uppercase tracking-widest">Email Us</p>
          </button>
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6 px-2">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-5 bg-white rounded-[2rem] border border-zinc-100 shadow-sm"
              >
                <h3 className="text-sm font-black mb-2">{faq.q}</h3>
                <p className="text-xs text-zinc-400 font-bold leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div className="mt-12 space-y-3">
          <button className="w-full flex items-center justify-between p-5 bg-zinc-50 rounded-2xl group">
            <div className="flex items-center gap-4">
              <FileText size={20} className="text-zinc-400 group-hover:text-brand-yellow transition-colors" />
              <span className="text-sm font-black">Terms of Service</span>
            </div>
            <ChevronRight size={18} className="text-zinc-300" />
          </button>
          <button className="w-full flex items-center justify-between p-5 bg-zinc-50 rounded-2xl group">
            <div className="flex items-center gap-4">
              <Shield size={20} className="text-zinc-400 group-hover:text-brand-yellow transition-colors" />
              <span className="text-sm font-black">Privacy Policy</span>
            </div>
            <ChevronRight size={18} className="text-zinc-300" />
          </button>
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
