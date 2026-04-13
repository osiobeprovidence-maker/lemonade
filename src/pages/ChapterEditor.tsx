import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, handleFirestoreError } from '../lib/firebase';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'motion/react';
import { ChevronLeft, Plus, Trash2, Save, Image as ImageIcon, List } from 'lucide-react';

export function ChapterEditor() {
  const { seriesId } = useParams();
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [series, setSeries] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [chapterData, setChapterData] = useState({
    title: '',
    chapterNumber: 1,
    isPremium: false,
    coinCost: 0,
    pages: ['']
  });

  useEffect(() => {
    if (!seriesId || !user) return;

    const fetchSeries = async () => {
      try {
        const docRef = doc(db, 'series', seriesId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.creatorId !== user.uid) {
            navigate('/studio');
            return;
          }
          setSeries({ id: docSnap.id, ...data });
        }
        setLoading(false);
      } catch (error) {
        handleFirestoreError(error, 'GET', `series/${seriesId}`);
      }
    };

    fetchSeries();
  }, [seriesId, user]);

  const handleAddPage = () => {
    setChapterData({ ...chapterData, pages: [...chapterData.pages, ''] });
  };

  const handleRemovePage = (index: number) => {
    const newPages = chapterData.pages.filter((_, i) => i !== index);
    setChapterData({ ...chapterData, pages: newPages });
  };

  const handlePageChange = (index: number, value: string) => {
    const newPages = [...chapterData.pages];
    newPages[index] = value;
    setChapterData({ ...chapterData, pages: newPages });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seriesId) return;

    try {
      await addDoc(collection(db, 'series', seriesId, 'chapters'), {
        ...chapterData,
        publishDate: serverTimestamp(),
        createdAt: serverTimestamp()
      });
      navigate(`/series/${seriesId}`);
    } catch (error) {
      handleFirestoreError(error, 'CREATE', `series/${seriesId}/chapters`);
    }
  };

  if (loading || !series) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

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
          <h1 className="text-xl font-black tracking-tight">Add Chapter</h1>
        </div>
      </header>

      <main className="flex-grow p-6">
        <div className="mb-8">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Series</p>
          <h2 className="text-lg font-black truncate">{series.title}</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Chapter Title</label>
              <input 
                type="text" 
                required
                className="w-full p-4 rounded-2xl bg-zinc-50 border-none focus:ring-2 focus:ring-brand-yellow outline-none text-sm font-bold"
                value={chapterData.title}
                onChange={e => setChapterData({...chapterData, title: e.target.value})}
                placeholder="e.g. The Beginning"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Chapter Number</label>
              <input 
                type="number" 
                required
                min="1"
                className="w-full p-4 rounded-2xl bg-zinc-50 border-none focus:ring-2 focus:ring-brand-yellow outline-none text-sm font-bold"
                value={chapterData.chapterNumber}
                onChange={e => setChapterData({...chapterData, chapterNumber: parseInt(e.target.value)})}
              />
            </div>

            <div className="p-5 bg-zinc-50 rounded-[2rem] border border-zinc-100">
              <label className="flex items-center justify-between cursor-pointer mb-4">
                <span className="text-xs font-black uppercase tracking-widest">Premium Chapter</span>
                <input 
                  type="checkbox" 
                  className="w-6 h-6 accent-brand-yellow rounded-lg"
                  checked={chapterData.isPremium}
                  onChange={e => setChapterData({...chapterData, isPremium: e.target.checked})}
                />
              </label>
              
              {chapterData.isPremium && (
                <div className="flex items-center justify-between pt-4 border-t border-zinc-200">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Coin Cost</span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      className="w-20 p-2 rounded-xl bg-white border border-zinc-200 focus:ring-2 focus:ring-brand-yellow outline-none text-center text-sm font-black"
                      value={chapterData.coinCost}
                      onChange={e => setChapterData({...chapterData, coinCost: parseInt(e.target.value)})}
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Coins</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Chapter Pages</h2>
              <button 
                type="button"
                onClick={handleAddPage}
                className="text-[10px] font-black text-brand-yellow uppercase tracking-widest flex items-center gap-1"
              >
                <Plus size={14} /> Add Page
              </button>
            </div>

            <div className="space-y-4">
              {chapterData.pages.map((page, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <span className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center text-[10px] font-black text-zinc-400 flex-shrink-0">
                    {index + 1}
                  </span>
                  <input 
                    type="url" 
                    required
                    placeholder="Image URL..."
                    className="flex-grow p-3.5 rounded-2xl bg-zinc-50 border-none focus:ring-2 focus:ring-brand-yellow outline-none text-xs font-bold"
                    value={page}
                    onChange={e => handlePageChange(index, e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={() => handleRemovePage(index)}
                    className="p-2 text-zinc-300 hover:text-red-500 transition-colors"
                    disabled={chapterData.pages.length === 1}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={() => navigate(-1)}
              className="flex-1 py-4 bg-zinc-100 text-zinc-400 rounded-2xl font-black text-xs tracking-widest"
            >
              DISCARD
            </button>
            <button 
              type="submit" 
              className="flex-1 py-4 bg-brand-yellow text-black rounded-2xl font-black text-xs tracking-widest shadow-xl shadow-brand-yellow/20 flex items-center justify-center gap-2"
            >
              <Save size={18} />
              PUBLISH
            </button>
          </div>
        </form>
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
