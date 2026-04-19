import { ChevronRight, Heart, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ReaderTheme } from './novel-reader-data';

interface ReaderTopBarProps {
  theme: ReaderTheme;
  visible: boolean;
  storyTitle: string;
  chapterTitle: string;
  chapterLabel: string;
  onBack: () => void;
  onToggleFavorite: () => void;
  onOpenMenu: () => void;
  isFavorite: boolean;
}

export function ReaderTopBar({
  theme,
  visible,
  storyTitle,
  chapterTitle,
  chapterLabel,
  onBack,
  onToggleFavorite,
  onOpenMenu,
  isFavorite,
}: ReaderTopBarProps) {
  const shellClass = theme === 'night'
    ? 'border-white/10 bg-black/70 text-white shadow-[0_16px_40px_rgba(0,0,0,0.28)]'
    : 'border-black/8 bg-[rgba(250,246,239,0.9)] text-zinc-950 shadow-[0_16px_40px_rgba(32,24,12,0.08)]';
  const iconClass = theme === 'night'
    ? 'text-white/78 hover:bg-white/10 hover:text-white'
    : 'text-zinc-700 hover:bg-black/5 hover:text-zinc-950';

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[60] border-b backdrop-blur-xl transition-all duration-300 ${visible ? 'translate-y-0 opacity-100' : '-translate-y-[110%] opacity-0'} ${shellClass}`}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between gap-3 px-3 sm:px-5 lg:px-8">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            aria-label="Back to story details"
            className={`h-10 w-10 rounded-full ${iconClass}`}
          >
            <ChevronRight className="h-5 w-5 rotate-180" />
          </Button>

          <div className="min-w-0">
            <p className={`line-clamp-1 text-[0.68rem] font-semibold uppercase tracking-[0.26em] ${theme === 'night' ? 'text-white/45' : 'text-zinc-500'}`}>
              {chapterLabel}
            </p>
            <div className="flex min-w-0 items-baseline gap-2">
              <h1 className="line-clamp-1 text-sm font-semibold tracking-tight sm:text-[0.96rem]">{storyTitle}</h1>
              <span className={`hidden text-xs sm:inline ${theme === 'night' ? 'text-white/35' : 'text-zinc-400'}`}>/</span>
              <p className={`hidden line-clamp-1 text-xs sm:inline ${theme === 'night' ? 'text-white/62' : 'text-zinc-500'}`}>{chapterTitle}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFavorite}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? 'Remove chapter from favorites' : 'Add chapter to favorites'}
            className={`h-10 w-10 rounded-full ${iconClass}`}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? 'fill-primary text-primary' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenMenu}
            aria-label="Open reader menu"
            className={`h-10 w-10 rounded-full ${iconClass}`}
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
