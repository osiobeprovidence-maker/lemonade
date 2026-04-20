import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, List } from 'lucide-react';
import { Chapter } from './novel-reader-data';

interface ChapterNavigationProps {
  currentChapter: Chapter;
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onOpenTOC: () => void;
  width?: 'narrow' | 'medium' | 'wide';
}

export function ChapterNavigation({
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  onOpenTOC,
  width = 'medium'
}: ChapterNavigationProps) {
  
  const widthClasses = {
    narrow: 'max-w-2xl',
    medium: 'max-w-3xl',
    wide: 'max-w-4xl'
  };

  return (
    <div className={`mx-auto px-6 mt-16 sm:mt-24 mb-32 ${widthClasses[width]}`}>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 py-8 border-t border-zinc-800/50">
        
        <div className="flex-1">
          <Button 
            variant="ghost" 
            className="w-full sm:w-auto flex items-center justify-center gap-2 group text-zinc-400 hover:text-white h-12"
            onClick={onPrevious}
            disabled={!hasPrevious}
          >
            <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            Previous Chapter
          </Button>
        </div>

        <div className="flex-1 flex justify-center shrink-0 order-first sm:order-none">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto h-12 gap-2 border-zinc-800 hover:bg-zinc-800 text-zinc-300"
            onClick={onOpenTOC}
          >
            <List className="w-4 h-4" />
            Table of Contents
          </Button>
        </div>

        <div className="flex-1 flex justify-end">
          <Button 
            className="w-full sm:w-auto h-12 flex items-center justify-center gap-2 group bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={onNext}
            disabled={!hasNext}
          >
            Next Chapter
            <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

      </div>
    </div>
  );
}
