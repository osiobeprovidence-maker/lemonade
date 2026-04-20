import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Chapter, Story } from './novel-reader-data';
import { X, ChevronRight } from 'lucide-react';

interface TableOfContentsSidebarProps {
  story: Story;
  currentChapterId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectChapter: (chapterId: string) => void;
}

export function TableOfContentsSidebar({
  story,
  currentChapterId,
  isOpen,
  onClose,
  onSelectChapter
}: TableOfContentsSidebarProps) {
  // Desktop sticky behavior or mobile drawer behavior handled via classes
  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-zinc-950/80 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.div
        className={`fixed inset-y-0 left-0 z-50 w-[280px] sm:w-[320px] bg-zinc-950 border-r border-zinc-800/50 flex flex-col pt-16 lg:pt-20 transition-transform lg:transform-none lg:static lg:h-[calc(100vh-80px)] lg:bg-transparent lg:border-none ${isOpen ? 'translate-x-[0%]' : '-translate-x-[100%]'} shrink-0`}
        initial={false}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between px-4 pb-4 lg:hidden">
          <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-widest">Table of Contents</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-zinc-400">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block px-6 pb-6">
          <div className="w-16 h-24 mb-4 rounded-md overflow-hidden bg-zinc-800 shrink-0 shadow-lg">
             <img src={story.cover} alt="cover" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-lg font-bold text-zinc-100">{story.title}</h2>
          <p className="text-sm text-zinc-500 mt-1">{story.author}</p>
        </div>

        <ScrollArea className="flex-1 px-2 lg:px-6">
          <div className="flex flex-col pb-20">
            {story.chapters.map((chapter) => {
              const isActive = chapter.id === currentChapterId;
              return (
                <button
                  key={chapter.id}
                  onClick={() => {
                    onSelectChapter(chapter.id);
                    onClose();
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between group transition-colors ${
                    isActive ? 'bg-primary/10' : 'hover:bg-zinc-900/50'
                  }`}
                >
                  <div className="flex flex-col min-w-0 pr-4">
                    <span className={`text-sm font-medium truncate ${isActive ? 'text-primary' : 'text-zinc-300 group-hover:text-white'}`}>
                      {chapter.number}. {chapter.title}
                    </span>
                    <span className="text-xs text-zinc-500 mt-0.5">
                      {chapter.createdAt} • {chapter.readTime}
                    </span>
                  </div>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </motion.div>
    </>
  );
}
