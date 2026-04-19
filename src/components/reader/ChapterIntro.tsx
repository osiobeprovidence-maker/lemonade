import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ReaderChapter, ReaderStory, ReaderTheme } from './novel-reader-data';

interface ChapterIntroProps {
  story: ReaderStory;
  chapter: ReaderChapter;
  theme: ReaderTheme;
  hasResumePoint: boolean;
  onResume: () => void;
}

const formatDate = (value?: string) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

export function ChapterIntro({ story, chapter, theme, hasResumePoint, onResume }: ChapterIntroProps) {
  const publishedLabel = formatDate(chapter.publishedAt);
  const updatedLabel = formatDate(chapter.updatedAt);

  return (
    <header className="relative overflow-hidden rounded-[28px] border px-5 py-6 sm:px-8 sm:py-8">
      <div
        className={`absolute inset-0 ${theme === 'night'
          ? 'bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_55%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] border-white/10'
          : 'bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.05),transparent_58%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(246,240,229,0.9))] border-black/10'
        }`}
      />
      <div className="relative">
        <p className={`text-[0.7rem] font-semibold uppercase tracking-[0.3em] ${theme === 'night' ? 'text-white/48' : 'text-zinc-500'}`}>
          Lemonade Fiction
        </p>
        <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">{story.title}</h2>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          <span className={theme === 'night' ? 'text-white/62' : 'text-zinc-600'}>by {story.author}</span>
          <span className={theme === 'night' ? 'text-white/25' : 'text-zinc-300'}>&middot;</span>
          <span className={theme === 'night' ? 'text-white/62' : 'text-zinc-600'}>{chapter.estimatedReadTime}</span>
          {publishedLabel && (
            <>
              <span className={theme === 'night' ? 'text-white/25' : 'text-zinc-300'}>&middot;</span>
              <span className={theme === 'night' ? 'text-white/62' : 'text-zinc-600'}>Published {publishedLabel}</span>
            </>
          )}
          {updatedLabel && updatedLabel !== publishedLabel && (
            <>
              <span className={theme === 'night' ? 'text-white/25' : 'text-zinc-300'}>&middot;</span>
              <span className={theme === 'night' ? 'text-white/62' : 'text-zinc-600'}>Updated {updatedLabel}</span>
            </>
          )}
        </div>

        <div className="mt-7 flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className={`text-sm ${theme === 'night' ? 'text-white/55' : 'text-zinc-500'}`}>Chapter {String(chapter.number).padStart(2, '0')}</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight sm:text-[2rem]">{chapter.title}</h3>
          </div>

          {hasResumePoint && (
            <Button
              variant="outline"
              onClick={onResume}
              className={`rounded-full px-5 font-semibold ${theme === 'night'
                ? 'border-white/15 bg-white/5 text-white hover:bg-white/10'
                : 'border-black/10 bg-white/60 text-zinc-900 hover:bg-white'
              }`}
            >
              Continue where you stopped
            </Button>
          )}
        </div>

        {chapter.tags && chapter.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {chapter.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className={`rounded-full px-3 py-1 ${theme === 'night' ? 'border-white/12 bg-white/4 text-white/72' : 'border-black/10 bg-white/75 text-zinc-700'}`}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
