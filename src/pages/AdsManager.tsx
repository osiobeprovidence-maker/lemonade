import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, handleFirestoreError } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Plus, Megaphone, Trash2, ExternalLink, Play, Pause } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { StudioLayout } from '../components/StudioLayout';

export function AdsManager() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [ads, setAds] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newAd, setNewAd] = useState({
    title: '',
    imageUrl: '',
    targetUrl: '',
    type: 'native',
    budget: 1000
  });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'ads'), where('creatorId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, 'LIST', 'ads'));
    return () => unsubscribe();
  }, [user]);

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await addDoc(collection(db, 'ads'), {
        ...newAd,
        creatorId: user.uid,
        status: 'active',
        impressions: 0,
        clicks: 0,
        createdAt: serverTimestamp()
      });
      setIsCreating(false);
      setNewAd({ title: '', imageUrl: '', targetUrl: '', type: 'native', budget: 1000 });
    } catch (error) {
      handleFirestoreError(error, 'CREATE', 'ads');
    }
  };

  const toggleAdStatus = async (adId: string, currentStatus: string) => {
    try {
      await updateDoc(doc(db, 'ads', adId), { status: currentStatus === 'active' ? 'paused' : 'active' });
    } catch (error) {
      handleFirestoreError(error, 'UPDATE', `ads/${adId}`);
    }
  };

  const handleDeleteAd = async (adId: string) => {
    if (!confirm('Delete this campaign?')) return;
    try { await deleteDoc(doc(db, 'ads', adId)); } catch (error) {
      handleFirestoreError(error, 'DELETE', `ads/${adId}`);
    }
  };

  if (!user) return null;

  return (
    <StudioLayout>
      <div className="px-4 md:px-8 py-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-zinc-800">Ads Manager</h1>
            <p className="text-xs text-zinc-400 mt-1">Promote your content</p>
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

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-10">
          <div className="p-5 bg-zinc-50 rounded-xl">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Impressions</p>
            <h3 className="text-xl font-bold text-zinc-800">
              {ads.reduce((acc, ad) => acc + (ad.impressions || 0), 0).toLocaleString()}
            </h3>
          </div>
          <div className="p-5 bg-zinc-50 rounded-xl">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Clicks</p>
            <h3 className="text-xl font-bold text-zinc-800">
              {ads.reduce((acc, ad) => acc + (ad.clicks || 0), 0).toLocaleString()}
            </h3>
          </div>
          <div className="col-span-2 p-5 rounded-xl text-white" style={{ backgroundColor: '#1a1a1a' }}>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Average CTR</p>
            <h3 className="text-2xl font-bold">
              {ads.length > 0
                ? ((ads.reduce((acc, ad) => acc + (ad.clicks || 0), 0) / Math.max(1, ads.reduce((acc, ad) => acc + (ad.impressions || 0), 0))) * 100).toFixed(2)
                : '0.00'}%
            </h3>
          </div>
        </div>

        {/* Campaigns */}
        <div>
          <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-6">Your Campaigns</h2>

          {ads.length === 0 ? (
            <div className="text-center py-16 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-200">
                <Megaphone size={32} />
              </div>
              <h3 className="text-sm font-bold text-zinc-600 mb-1">No campaigns</h3>
              <p className="text-xs text-zinc-400 mb-6">Reach more readers today.</p>
              <motion.button
                onClick={() => setIsCreating(true)}
                whileTap={{ scale: 0.98 }}
                className="text-xs font-bold uppercase tracking-wider px-6 py-2 rounded-full bg-green-50 text-green-600 hover:opacity-80 transition-all"
              >
                Create Campaign
              </motion.button>
            </div>
          ) : (
            <div className="space-y-3">
              {ads.map(ad => (
                <motion.div
                  key={ad.id}
                  whileHover={{ backgroundColor: '#fafafa' }}
                  className="p-5 bg-white rounded-xl border border-zinc-100 transition-colors"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0">
                      <img src={ad.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="text-sm font-bold text-zinc-800 truncate">{ad.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          ad.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-zinc-100 text-zinc-400'
                        }`}>
                          {ad.status}
                        </span>
                        <span className="text-[8px] font-bold uppercase tracking-wider bg-green-50 text-green-600 px-2 py-0.5 rounded">
                          {ad.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-4 border-t border-zinc-50 mb-4">
                    <div>
                      <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Imps</p>
                      <p className="text-xs font-bold text-zinc-800">{ad.impressions || 0}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Clicks</p>
                      <p className="text-xs font-bold text-zinc-800">{ad.clicks || 0}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Budget</p>
                      <p className="text-xs font-bold text-zinc-800">₦{ad.budget?.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleAdStatus(ad.id, ad.status)} className="p-2 text-zinc-400 hover:text-green-500 transition-colors">
                        {ad.status === 'active' ? <Pause size={18} /> : <Play size={18} />}
                      </button>
                      <a href={ad.targetUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors">
                        <ExternalLink size={18} />
                      </a>
                    </div>
                    <button onClick={() => handleDeleteAd(ad.id)} className="p-2 text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 size={18} />
                    </button>
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
              <h2 className="text-xl font-black tracking-tight text-zinc-800">New Campaign</h2>
              <button onClick={() => setIsCreating(false)} className="text-zinc-400 font-medium text-sm hover:text-zinc-600 transition-colors">Cancel</button>
            </div>
            <form onSubmit={handleCreateAd} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Campaign Title</label>
                <input
                  type="text" required
                  className="w-full p-3.5 rounded-xl bg-zinc-50 border border-zinc-100 focus:bg-white focus:border-green-400/30 focus:ring-4 focus:ring-green-400/5 outline-none text-sm transition-all placeholder:text-zinc-300"
                  value={newAd.title} onChange={e => setNewAd({...newAd, title: e.target.value})}
                  placeholder="e.g. Lagos 2099 Launch"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Ad Type</label>
                  <select
                    className="w-full p-3.5 rounded-xl bg-zinc-50 border border-zinc-100 focus:bg-white focus:border-green-400/30 outline-none text-sm"
                    value={newAd.type} onChange={e => setNewAd({...newAd, type: e.target.value})}
                  >
                    <option value="native">Native Story</option>
                    <option value="interstitial">Interstitial</option>
                    <option value="banner">Banner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Budget (₦)</label>
                  <input type="number" required
                    className="w-full p-3.5 rounded-xl bg-zinc-50 border border-zinc-100 focus:bg-white focus:border-green-400/30 outline-none text-sm"
                    value={newAd.budget} onChange={e => setNewAd({...newAd, budget: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Image URL</label>
                <input type="url" required
                  className="w-full p-3.5 rounded-xl bg-zinc-50 border border-zinc-100 focus:bg-white focus:border-green-400/30 outline-none text-sm transition-all placeholder:text-zinc-300"
                  value={newAd.imageUrl} onChange={e => setNewAd({...newAd, imageUrl: e.target.value})} placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Target URL</label>
                <input type="url" required
                  className="w-full p-3.5 rounded-xl bg-zinc-50 border border-zinc-100 focus:bg-white focus:border-green-400/30 outline-none text-sm transition-all placeholder:text-zinc-300"
                  value={newAd.targetUrl} onChange={e => setNewAd({...newAd, targetUrl: e.target.value})} placeholder="https://..."
                />
              </div>
              <motion.button type="submit" whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 text-white rounded-xl font-black text-sm tracking-widest hover:opacity-90 transition-all mt-2"
                style={{ backgroundColor: '#4ade80' }}
              >
                LAUNCH CAMPAIGN
              </motion.button>
            </form>
          </motion.div>
        </div>
      )}
    </StudioLayout>
  );
}
