import { ChevronLeft, ChevronRight, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ReaderChapter, ReaderTheme } from './novel-reader-data';

interface ChapterNavigationProps {
  theme: ReaderTheme;
  previousChapter?: ReaderChapter;
  nextChapter?: ReaderChapter;
  onPrevious: () => void;
  onNext: () => void;
  onBackToToc: () => void;
}

export function ChapterNavigation({
  theme,
  previousChapter,
  nextChapter,
  onPrevious,
  onNext,
  onBackToToc,
}: ChapterNavigationProps) {
  const shellClass = theme === 'night'
    ? 'border-white/10 bg-white/[0.025]'
    : 'border-black/10 bg-white/68';
  const secondaryClass = theme === 'night'
    ? 'border-white/12 bg-white/5 text-white hover:bg-white/10'
    : 'border-black/10 bg-white/75 text-zinc-900 hover:bg-white';

  return (
    <section className={`rounded-[28px] border px-5 py-6 sm:px-8 ${shellClass}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className={`text-[0.68rem] font-semibold uppercase tracking-[0.32em] ${theme === 'night' ? 'text-white/45' : 'text-zinc-500'}`}>
            Continue Reading
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight">Keep your place and move through the story cleanly.</h3>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={onBackToToc}
          className={`rounded-full px-5 font-semibold ${secondaryClass}`}
        >
          <List className="mr-2 h-4 w-4" />
          Back to contents
        </Button>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          disabled={!previousChapter}
          className={`h-auto min-h-20 justify-start rounded-[22px] px-4 py-4 text-left font-normal ${secondaryClass}`}
        >
          <ChevronLeft className="mr-3 h-5 w-5 shrink-0" />
          <span className="min-w-0">
            <span className={`block text-[0.68rem] font-semibold uppercase tracking-[0.28em] ${theme === 'night' ? 'text-white/45' : 'text-zinc-500'}`}>
              Previous chapter
            </span>
            <span className="mt-1 block truncate text-sm font-semibold">
              {previousChapter ? previousChapter.title : 'You are at the beginning'}
            </span>
          </span>
        </Button>

        <Button
          type="button"
          onClick={onNext}
          disabled={!nextChapter}
          className="h-auto min-h-20 justify-between rounded-[22px] px-4 py-4 text-left"
        >
          <span className="min-w-0">
            <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-primary-foreground/70">
              {nextChapter ? 'Continue reading' : 'Story progress'}
            </span>
            <span className="mt-1 block truncate text-sm font-semibold">
              {nextChapter ? nextChapter.title : 'You are caught up'}
            </span>
          </span>
          <ChevronRight className="ml-3 h-5 w-5 shrink-0" />
        </Button>
      </div>
    </section>
  );
}
