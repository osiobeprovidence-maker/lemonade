import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, handleFirestoreError } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Plus, LayoutDashboard, BookPlus, Settings, BarChart3, Sparkles, Megaphone } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

import { StudioLayout } from '../components/StudioLayout';

export function Studio() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [series, setSeries] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [newSeries, setNewSeries] = useState({
    title: '',
    description: '',
    coverImage: '',
    tags: ''
  });

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setUserProfile(docSnap.data());
    };
    fetchProfile();

    const q = query(collection(db, 'series'), where('creatorId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSeries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, 'LIST', 'series'));

    return () => unsubscribe();
  }, [user]);

  const handleCreateSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await addDoc(collection(db, 'series'), {
        ...newSeries,
        tags: newSeries.tags.split(',').map(t => t.trim()),
        creatorId: user.uid,
        creatorName: user.displayName,
        status: 'draft',
        subscriberCount: 0,
        viewCount: 0,
        createdAt: serverTimestamp()
      });
      setIsCreating(false);
      setNewSeries({ title: '', description: '', coverImage: '', tags: '' });
    } catch (error) {
      handleFirestoreError(error, 'CREATE', 'series');
    }
  };

  const handleBecomeCreator = async () => {
    if (!user) return;
    setIsUpgrading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { role: 'creator' });
      setUserProfile((prev: any) => ({ ...prev, role: 'creator' }));
    } catch (error) {
      handleFirestoreError(error, 'UPDATE', `users/${user.uid}`);
    } finally {
      setIsUpgrading(false);
    }
  };

  if (!user) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 mb-6 mx-auto">
            <LayoutDashboard size={40} />
          </div>
          <h2 className="text-2xl font-black tracking-tight mb-2">Creator Studio</h2>
          <p className="text-zinc-400 text-sm mb-8">Please sign in to access your studio and manage your content.</p>
          <motion.button
            onClick={() => navigate('/login')}
            whileTap={{ scale: 0.98 }}
            className="w-full max-w-xs py-3.5 text-white rounded-xl font-black text-sm tracking-widest transition-all hover:opacity-90"
            style={{ backgroundColor: '#4ade80' }}
          >
            SIGN IN
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (userProfile && userProfile.role === 'fan') {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col">
        <main className="flex-grow px-4 md:px-8 py-12 max-w-2xl mx-auto w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4" style={{ color: '#4ade80' }}>
              LEMONADE
            </h1>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-none mb-4">Share your stories with the world.</h2>
            <p className="text-zinc-400 text-sm mb-12 leading-relaxed">
              Join our community of African creators and start earning from your passion. Lemonade provides the tools you need to publish and grow.
            </p>

            <div className="space-y-6 mb-12">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookPlus size={20} style={{ color: '#4ade80' }} />
                </div>
                <div>
                  <h3 className="text-sm font-bold mb-1">Publish</h3>
                  <p className="text-xs text-zinc-400">Upload your manga or webtoons easily.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BarChart3 size={20} style={{ color: '#4ade80' }} />
                </div>
                <div>
                  <h3 className="text-sm font-bold mb-1">Grow</h3>
                  <p className="text-xs text-zinc-400">Build a global fanbase for your work.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles size={20} style={{ color: '#4ade80' }} />
                </div>
                <div>
                  <h3 className="text-sm font-bold mb-1">Earn</h3>
                  <p className="text-xs text-zinc-400">Monetize your content with Lemonade Coins.</p>
                </div>
              </div>
            </div>

            <motion.button
              onClick={handleBecomeCreator}
              disabled={isUpgrading}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 text-white rounded-xl font-black text-sm tracking-widest transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#4ade80' }}
            >
              {isUpgrading ? 'UPGRADING...' : 'START CREATING NOW'}
            </motion.button>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <StudioLayout>
      <div className="px-4 md:px-8 py-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black tracking-tight">Hello, {user.displayName?.split(' ')[0]}</h1>
            <p className="text-xs text-zinc-400 font-medium mt-1">Creator Dashboard</p>
          </div>
          <motion.button
            onClick={() => setIsCreating(true)}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all hover:opacity-90"
            style={{ backgroundColor: '#4ade80' }}
          >
            <Plus size={22} />
          </motion.button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-10">
          <div className="p-5 bg-zinc-50 rounded-xl">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Total Reads</p>
            <h3 className="text-xl font-black">124.5K</h3>
          </div>
          <div className="p-5 bg-zinc-50 rounded-xl">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Subscribers</p>
            <h3 className="text-xl font-black">8.2K</h3>
          </div>
          <div className="col-span-2 p-5 rounded-xl text-white" style={{ backgroundColor: '#1a1a1a' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Total Earnings</p>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black">₦45,000</h3>
              <button className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full transition-all hover:opacity-80" style={{ backgroundColor: '#4ade8020', color: '#4ade80' }}>
                Withdraw
              </button>
            </div>
          </div>
        </div>

        {/* Series List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Your Series</h2>
          </div>

          {series.length === 0 ? (
            <div className="text-center py-16 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-200">
                <BookPlus size={32} />
              </div>
              <h3 className="text-sm font-bold mb-1">No series yet</h3>
              <p className="text-xs text-zinc-400 mb-6">Start your journey today.</p>
              <motion.button
                onClick={() => setIsCreating(true)}
                whileTap={{ scale: 0.98 }}
                className="text-xs font-black uppercase tracking-widest px-6 py-2 rounded-full transition-all hover:opacity-80"
                style={{ backgroundColor: '#4ade8020', color: '#4ade80' }}
              >
                Create Series
              </motion.button>
            </div>
          ) : (
            <div className="space-y-3">
              {series.map(s => (
                <motion.div
                  key={s.id}
                  whileHover={{ backgroundColor: '#fafafa' }}
                  className="flex items-center gap-4 p-4 bg-white rounded-xl border border-zinc-100 transition-colors"
                >
                  <div className="w-14 h-20 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0">
                    <img src={s.coverImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="text-sm font-bold truncate">{s.title}</h4>
                    <p className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: '#4ade80' }}>{s.status}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link
                      to={`/studio/series/${s.id}/add-chapter`}
                      className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors"
                    >
                      <Plus size={18} />
                    </Link>
                    <Link to={`/series/${s.id}`} className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors">
                      <LayoutDashboard size={18} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            className="w-full bg-white rounded-t-3xl p-6 md:p-8 pb-10 md:pb-12 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black tracking-tight">New Series</h2>
              <button onClick={() => setIsCreating(false)} className="text-zinc-400 font-medium text-sm hover:text-zinc-600 transition-colors">Cancel</button>
            </div>
            <form onSubmit={handleCreateSeries} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Title</label>
                <input
                  type="text"
                  required
                  className="w-full p-3.5 rounded-xl bg-zinc-50 border border-zinc-100 focus:bg-white focus:border-green-400/30 focus:ring-4 focus:ring-green-400/5 outline-none text-sm transition-all placeholder:text-zinc-300"
                  value={newSeries.title}
                  onChange={e => setNewSeries({...newSeries, title: e.target.value})}
                  placeholder="e.g. Lagos 2099"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Description</label>
                <textarea
                  required
                  className="w-full p-3.5 rounded-xl bg-zinc-50 border border-zinc-100 focus:bg-white focus:border-green-400/30 focus:ring-4 focus:ring-green-400/5 outline-none text-sm resize-none transition-all placeholder:text-zinc-300"
                  value={newSeries.description}
                  onChange={e => setNewSeries({...newSeries, description: e.target.value})}
                  placeholder="What is your story about?"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Cover Image URL</label>
                <input
                  type="url"
                  required
                  className="w-full p-3.5 rounded-xl bg-zinc-50 border border-zinc-100 focus:bg-white focus:border-green-400/30 focus:ring-4 focus:ring-green-400/5 outline-none text-sm transition-all placeholder:text-zinc-300"
                  value={newSeries.coverImage}
                  onChange={e => setNewSeries({...newSeries, coverImage: e.target.value})}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Tags</label>
                <input
                  type="text"
                  className="w-full p-3.5 rounded-xl bg-zinc-50 border border-zinc-100 focus:bg-white focus:border-green-400/30 focus:ring-4 focus:ring-green-400/5 outline-none text-sm transition-all placeholder:text-zinc-300"
                  value={newSeries.tags}
                  onChange={e => setNewSeries({...newSeries, tags: e.target.value})}
                  placeholder="Action, Sci-Fi, Romance"
                />
              </div>

              <motion.button
                type="submit"
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 text-white rounded-xl font-black text-sm tracking-widest transition-all hover:opacity-90 mt-2"
                style={{ backgroundColor: '#4ade80' }}
              >
                CREATE SERIES
              </motion.button>
            </form>
          </motion.div>
        </div>
      )}
    </StudioLayout>
  );
}
