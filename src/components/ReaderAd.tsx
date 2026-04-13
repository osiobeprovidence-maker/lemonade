import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, limit, onSnapshot, updateDoc, doc, increment } from 'firebase/firestore';
import { ExternalLink, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ReaderAd() {
  const [ad, setAd] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'ads'),
      where('status', '==', 'active'),
      where('type', '==', 'interstitial'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const adData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        setAd(adData);
        // Record impression
        updateDoc(doc(db, 'ads', adData.id), {
          impressions: increment(1)
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleClick = async () => {
    if (!ad) return;
    try {
      await updateDoc(doc(db, 'ads', ad.id), {
        clicks: increment(1)
      });
    } catch (e) {
      console.error('Failed to record click', e);
    }
    window.open(ad.targetUrl, '_blank');
  };

  if (!ad || !isVisible) return null;

  return (
    <div className="w-full max-w-2xl mx-auto my-12">
      <div className="glass-card rounded-[2.5rem] p-8 border-2 border-brand-yellow/20 relative overflow-hidden group">
        <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
          <div className="w-full md:w-48 aspect-video md:aspect-square rounded-2xl overflow-hidden bg-white/5">
            <img 
              src={ad.imageUrl} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              referrerPolicy="no-referrer"
              alt={ad.title}
            />
          </div>
          <div className="flex-grow text-center md:text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-yellow mb-2 block">Sponsored Message</span>
            <h4 className="text-2xl font-serif font-black text-white mb-4">{ad.title}</h4>
            <button 
              onClick={handleClick}
              className="btn-primary py-3 px-8 flex items-center gap-2 mx-auto md:mx-0"
            >
              Learn More <ExternalLink size={18} />
            </button>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-yellow/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
