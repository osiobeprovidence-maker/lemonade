import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Twitter, Facebook, MessageCircle, Link as LinkIcon } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
}

export function ShareModal({ isOpen, onClose, title, url }: ShareModalProps) {
  const [copied, setCopied] = React.useState(false);

  const shareOptions = [
    { 
      name: 'Twitter', 
      icon: Twitter, 
      color: 'bg-[#1DA1F2]', 
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}` 
    },
    { 
      name: 'Facebook', 
      icon: Facebook, 
      color: 'bg-[#1877F2]', 
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` 
    },
    { 
      name: 'WhatsApp', 
      icon: MessageCircle, 
      color: 'bg-[#25D366]', 
      href: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}` 
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0"
          />
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="w-full max-w-[430px] bg-white rounded-t-[3rem] p-8 pb-12 shadow-2xl relative z-10"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black tracking-tight">Share Story</h2>
              <button onClick={onClose} className="p-2 bg-zinc-100 rounded-full">
                <X size={20} className="text-zinc-400" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-10">
              {shareOptions.map((option) => (
                <a
                  key={option.name}
                  href={option.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className={`w-14 h-14 ${option.color} text-white rounded-2xl flex items-center justify-center shadow-lg transition-transform group-active:scale-90`}>
                    <option.icon size={24} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{option.name}</span>
                </a>
              ))}
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Or copy link</p>
              <div className="flex items-center gap-2 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                <LinkIcon size={16} className="text-zinc-300 flex-shrink-0" />
                <span className="text-xs font-bold text-zinc-500 truncate flex-grow">{url}</span>
                <button 
                  onClick={handleCopy}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    copied ? 'bg-green-500 text-white' : 'bg-brand-yellow text-black'
                  }`}
                >
                  {copied ? 'COPIED' : 'COPY'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
