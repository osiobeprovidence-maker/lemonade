import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';
import { motion, useScroll, useSpring, useMotionValue, useTransform } from 'motion/react';
import { ChevronLeft, ChevronRight, Menu, MessageSquare, Share2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Comments } from '../components/Comments';
import { ReaderAd } from '../components/ReaderAd';
import { ShareModal } from '../components/ShareModal';

export function Reader() {
  const { seriesId, chapterId } = useParams();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  // Zoom State
  const [scale, setScale] = useState(1);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTouchDistance = useRef<number | null>(null);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      lastTouchDistance.current = distance;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastTouchDistance.current !== null) {
      const distance = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      
      const delta = distance / lastTouchDistance.current;
      const newScale = Math.min(Math.max(scale * delta, 1), 3);
      
      // Calculate midpoint for zoom origin
      const midX = (e.touches[0].pageX + e.touches[1].pageX) / 2;
      const midY = (e.touches[0].pageY + e.touches[1].pageY) / 2;
      
      setScale(newScale);
      setOrigin({ x: midX, y: midY });
      lastTouchDistance.current = distance;
    }
  };

  const handleTouchEnd = () => {
    lastTouchDistance.current = null;
  };

  const resetZoom = () => {
    setScale(1);
  };

  useEffect(() => {
    if (!seriesId || !chapterId) return;

    const fetchChapter = async () => {
      try {
        const docRef = doc(db, 'series', seriesId, 'chapters', chapterId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setChapter({ id: docSnap.id, ...docSnap.data() });
        } else {
          // Mock fallback
          setChapter({
            id: chapterId,
            title: 'The Awakening',
            chapterNumber: 1,
            pages: [
              'https://picsum.photos/seed/page1/800/1200',
              'https://picsum.photos/seed/page2/800/1200',
              'https://picsum.photos/seed/page3/800/1200',
              'https://picsum.photos/seed/page4/800/1200',
              'https://picsum.photos/seed/page5/800/1200'
            ]
          });
        }
        setLoading(false);
      } catch (error) {
        handleFirestoreError(error, 'GET', `series/${seriesId}/chapters/${chapterId}`);
      }
    };

    fetchChapter();
    window.scrollTo(0, 0);
  }, [seriesId, chapterId]);

  if (loading || !chapter) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="bg-brand-dark min-h-screen">
      {/* Reader Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-brand-yellow z-[60] origin-left" 
        style={{ scaleX }}
      />

      {/* Reader Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-brand-dark/90 backdrop-blur-md border-b border-white/10 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link to={`/series/${seriesId}`} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <div className="text-white">
            <h1 className="text-sm font-bold truncate max-w-[150px] sm:max-w-xs">{chapter.title}</h1>
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-black">Chapter {chapter.chapterNumber}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsShareModalOpen(true)}
            className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"
          >
            <Share2 size={20} />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
            <Menu size={20} />
          </button>
        </div>
      </header>

      <ShareModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={`Reading ${chapter.title} - Chapter ${chapter.chapterNumber} on Lemonade!`}
        url={window.location.href}
      />

      {/* Pages Container */}
      <div 
        ref={containerRef}
        className="pt-14 pb-24 flex flex-col items-center overflow-hidden touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <motion.div 
          className="max-w-3xl w-full origin-center transition-transform duration-100 ease-out"
          style={{ 
            scale,
            cursor: scale > 1 ? 'grab' : 'default'
          }}
        >
          {chapter.pages.map((page: string, index: number) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "200px" }}
              className="w-full"
            >
              <img 
                src={page} 
                alt={`Page ${index + 1}`} 
                className="w-full h-auto block select-none"
                referrerPolicy="no-referrer"
                draggable={false}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Zoom Controls Overlay */}
        {scale > 1 && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={resetZoom}
            className="fixed bottom-20 right-4 bg-brand-yellow text-black p-3 rounded-full shadow-lg z-[70] flex items-center gap-2"
          >
            <RotateCcw size={20} />
            <span className="text-xs font-bold">Reset Zoom</span>
          </motion.button>
        )}
        
        {/* End of Chapter */}
        <div className="mt-20 text-center px-4">
          <div className="w-20 h-1 bg-brand-yellow mx-auto mb-8 rounded-full" />
          
          <ReaderAd />

          <h2 className="text-3xl font-serif font-black text-white mb-4 mt-12">End of Chapter {chapter.chapterNumber}</h2>
          <p className="text-white/60 mb-12">What did you think of this chapter? Leave a comment below!</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <button className="btn-primary flex-1 py-4">Next Chapter</button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="max-w-3xl w-full px-4 mt-20 pb-20 border-t border-white/10 pt-12 text-white">
          <Comments targetId={chapterId!} type="chapter" />
        </div>
      </div>

      {/* Reader Footer Controls */}
      <footer className="fixed bottom-0 left-0 right-0 h-16 bg-brand-dark/90 backdrop-blur-md border-t border-white/10 z-50 flex items-center justify-around px-4">
        <button className="flex flex-col items-center gap-1 text-white/60 hover:text-brand-yellow transition-colors">
          <ChevronLeft size={20} />
          <span className="text-[10px] font-bold uppercase">Prev</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-white/60 hover:text-brand-yellow transition-colors">
          <MessageSquare size={20} />
          <span className="text-[10px] font-bold uppercase">Chat</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-white/60 hover:text-brand-yellow transition-colors">
          <ChevronRight size={20} />
          <span className="text-[10px] font-bold uppercase">Next</span>
        </button>
      </footer>
    </div>
  );
}
