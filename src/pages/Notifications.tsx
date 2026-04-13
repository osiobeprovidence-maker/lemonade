import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Bell, MessageSquare, Heart, Star, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, handleFirestoreError } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';

export function Notifications() {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, 'LIST', 'notifications');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'comment': return <MessageSquare size={16} className="text-blue-500" />;
      case 'like': return <Heart size={16} className="text-red-500" />;
      case 'update': return <Zap size={16} className="text-brand-yellow" />;
      case 'milestone': return <Star size={16} className="text-yellow-500" />;
      default: return <Bell size={16} className="text-zinc-400" />;
    }
  };

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
          <h1 className="text-xl font-black tracking-tight">Notifications</h1>
        </div>
      </header>

      <main className="flex-grow p-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex gap-4 p-4 bg-zinc-50 rounded-2xl">
                <div className="w-10 h-10 bg-zinc-100 rounded-xl" />
                <div className="flex-grow space-y-2">
                  <div className="h-3 bg-zinc-100 rounded w-3/4" />
                  <div className="h-2 bg-zinc-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <motion.div 
                key={notif.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 rounded-2xl flex gap-4 items-start transition-colors ${notif.read ? 'bg-white border border-zinc-50' : 'bg-brand-yellow/5 border border-brand-yellow/10'}`}
              >
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-bold leading-tight mb-1">{notif.message}</p>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                    {notif.createdAt?.toDate().toLocaleDateString()}
                  </p>
                </div>
                {!notif.read && (
                  <div className="w-2 h-2 bg-brand-yellow rounded-full mt-2" />
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-zinc-50 rounded-[2.5rem] border border-dashed border-zinc-200">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-200">
              <Bell size={32} />
            </div>
            <h3 className="text-sm font-black mb-1">No notifications</h3>
            <p className="text-xs text-zinc-400">We'll let you know when something happens.</p>
          </div>
        )}
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
