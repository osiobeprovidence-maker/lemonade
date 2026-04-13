import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';
import { motion } from 'motion/react';
import { ChevronLeft, Play, Plus, Share2, Info, List, User, Star, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Comments } from '../components/Comments';
import { ShareModal } from '../components/ShareModal';

export function SeriesDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [series, setSeries] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchSeries = async () => {
      try {
        const docRef = doc(db, 'series', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSeries({ id: docSnap.id, ...docSnap.data() });
        } else {
          // Mock fallback for demo
          setSeries({
            id,
            title: 'Lagos 2099',
            description: 'In a neon-drenched future Lagos, a young street urchin discovers a forgotten tech that could change the continent forever. As corporations fight for control, he must decide whether to sell out or lead a revolution.',
            creatorName: 'Tunde Dev',
            coverImage: 'https://picsum.photos/seed/lagos/600/800',
            subscriberCount: 1200,
            viewCount: 45000,
            tags: ['Sci-Fi', 'Action', 'Cyberpunk'],
            status: 'published'
          });
        }
      } catch (error) {
        handleFirestoreError(error, 'GET', `series/${id}`);
      }
    };

    fetchSeries();

    const q = query(
      collection(db, 'series', id, 'chapters'),
      orderBy('chapterNumber', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChapters(data.length > 0 ? data : [
        { id: 'c1', chapterNumber: 1, title: 'The Awakening', publishDate: new Date().toISOString(), isPremium: false },
        { id: 'c2', chapterNumber: 2, title: 'Neon Streets', publishDate: new Date().toISOString(), isPremium: false },
        { id: 'c3', chapterNumber: 3, title: 'The Heist', publishDate: new Date().toISOString(), isPremium: true, coinCost: 10 }
      ]);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, 'LIST', `series/${id}/chapters`);
    });

    return () => unsubscribe();
  }, [id]);

  if (loading || !series) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="w-full md:max-w-4xl mx-auto min-h-screen bg-white shadow-2xl flex flex-col relative overflow-hidden">
      {/* Sticky Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 h-16 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 bg-white/10 backdrop-blur-md rounded-full transition-colors pointer-events-auto"
        >
          <ChevronLeft size={24} className="text-white" />
        </button>
        <div className="flex gap-2 pointer-events-auto">
          <button 
            onClick={() => setIsShareModalOpen(true)}
            className="p-2 bg-white/10 backdrop-blur-md rounded-full transition-colors"
          >
            <Share2 size={20} className="text-white" />
          </button>
        </div>
      </header>

      <ShareModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={`Check out ${series.title} on Lemonade!`}
        url={window.location.href}
      />

      <main className="flex-grow overflow-y-auto no-scrollbar pb-24">
        {/* Hero Section */}
        <section className="relative aspect-[3/4] w-full">
          <img 
            src={series.coverImage} 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {series.tags.map((tag: string) => (
                <span key={tag} className="text-[9px] font-black uppercase tracking-widest bg-brand-yellow text-black px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-4xl font-black tracking-tighter leading-none mb-2">
              {series.title}
            </h1>
            <p className="text-sm font-bold text-zinc-600 flex items-center gap-2">
              <User size={14} className="text-brand-yellow" />
              {series.creatorName}
            </p>
          </div>
        </section>

        {/* Stats & Actions */}
        <section className="px-6 py-6 border-b border-zinc-50">
          <div className="flex justify-between items-center mb-8">
            <div className="text-center">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Views</p>
              <p className="text-lg font-black">{series.viewCount.toLocaleString()}</p>
            </div>
            <div className="h-8 w-px bg-zinc-100" />
            <div className="text-center">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Subs</p>
              <p className="text-lg font-black">{series.subscriberCount.toLocaleString()}</p>
            </div>
            <div className="h-8 w-px bg-zinc-100" />
            <div className="text-center">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Status</p>
              <p className="text-lg font-black text-brand-yellow uppercase">{series.status}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="flex-grow py-4 bg-brand-yellow text-black rounded-2xl font-black text-sm tracking-widest shadow-xl shadow-brand-yellow/20 flex items-center justify-center gap-2">
              <Plus size={18} />
              SUBSCRIBE
            </button>
            <Link 
              to={`/read/${id}/${chapters[0]?.id || '1'}`} 
              className="flex-grow py-4 bg-black text-white rounded-2xl font-black text-sm tracking-widest flex items-center justify-center gap-2"
            >
              <Play size={18} fill="currentColor" />
              READ NOW
            </Link>
          </div>
        </section>

        {/* Description */}
        <section className="px-6 py-8">
          <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Synopsis</h3>
          <p className="text-sm leading-relaxed text-zinc-600">
            {series.description}
          </p>
        </section>

        {/* Chapters */}
        <section className="px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Chapters ({chapters.length})</h3>
            <button className="text-[10px] font-black text-brand-yellow uppercase tracking-widest">Sort Newest</button>
          </div>

          <div className="space-y-4">
            {chapters.map((chapter) => (
              <Link 
                key={chapter.id} 
                to={`/read/${id}/${chapter.id}`}
                className="flex items-center gap-4 p-3 rounded-2xl hover:bg-zinc-50 transition-colors group"
              >
                <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center text-xl font-black text-zinc-300 group-hover:text-brand-yellow/40 transition-colors">
                  {chapter.chapterNumber}
                </div>
                <div className="flex-grow">
                  <h4 className="text-sm font-bold group-hover:text-brand-yellow transition-colors">{chapter.title}</h4>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase flex items-center gap-2 mt-1">
                    <Clock size={10} />
                    {format(new Date(chapter.publishDate), 'MMM dd, yyyy')}
                  </p>
                </div>
                {chapter.isPremium && (
                  <div className="px-2 py-1 bg-brand-yellow/10 text-brand-yellow text-[8px] font-black uppercase rounded">
                    {chapter.coinCost} Coins
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>

        {/* Comments */}
        <section className="px-6 py-8 border-t border-zinc-50">
          <Comments targetId={id!} type="series" />
        </section>
      </main>

      {/* Footer Tagline */}
      <footer className="py-8 px-4 text-center border-t border-zinc-50 bg-zinc-50">
        <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-[0.2em]">
          LEMONADE • Every story has a taste
        </p>
      </footer>
    </div>
  );
}
