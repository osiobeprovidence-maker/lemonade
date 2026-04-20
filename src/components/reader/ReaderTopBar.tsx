import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, MoreVertical, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReaderTopBarProps {
  storyTitle: string;
  chapterTitle?: string;
  isVisible: boolean;
  onBack: () => void;
  onOpenMenu: () => void;
  isLiked?: boolean;
  onToggleLike?: () => void;
}

export function ReaderTopBar({
  storyTitle,
  chapterTitle,
  isVisible,
  onBack,
  onOpenMenu,
  isLiked = false,
  onToggleLike
}: ReaderTopBarProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: '-100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-4"
        >
          {/* Background with blur */}
          <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50" />
          
          {/* Content */}
          <div className="relative z-10 flex items-center gap-4 w-full">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="shrink-0 text-zinc-400 hover:text-white rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="flex-1 min-w-0 overflow-hidden line-clamp-1">
              <span className="text-sm font-medium text-zinc-200 select-none">
                {storyTitle}
                {chapterTitle && <span className="text-zinc-500 ml-2 hidden sm:inline">| {chapterTitle}</span>}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleLike}
                className="text-zinc-400 hover:text-rose-500 rounded-full transition-colors"
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onOpenMenu}
                className="text-zinc-400 hover:text-white rounded-full"
              >
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
