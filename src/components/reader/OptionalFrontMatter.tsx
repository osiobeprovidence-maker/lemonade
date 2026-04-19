import type * as React from 'react';
import { Button } from '@/components/ui/button';
import type { ReaderChapter, ReaderTheme, ReaderToc } from './novel-reader-data';

interface OptionalFrontMatterProps {
  chapter: ReaderChapter;
  toc: ReaderToc;
  currentChapterId: string;
  onSelectChapter: (chapterId: string) => void;
  theme: ReaderTheme;
  tocRef: React.RefObject<HTMLDivElement | null>;
}

function FrontMatterSection({
  title,
  children,
  theme,
}: {
  title: string;
  children: React.ReactNode;
  theme: ReaderTheme;
}) {
  return (
    <section className={`border-t pt-6 ${theme === 'night' ? 'border-white/10' : 'border-black/10'}`}>
      <p className={`text-[0.68rem] font-semibold uppercase tracking-[0.32em] ${theme === 'night' ? 'text-white/45' : 'text-zinc-500'}`}>
        {title}
      </p>
      <div className={`mt-3 text-sm leading-7 ${theme === 'night' ? 'text-white/68' : 'text-zinc-700'}`}>{children}</div>
    </section>
  );
}

export function OptionalFrontMatter({
  chapter,
  toc,
  currentChapterId,
  onSelectChapter,
  theme,
  tocRef,
}: OptionalFrontMatterProps) {
  const hasAnyFrontMatter = Boolean(
    chapter.dedication ||
    chapter.copyright ||
    chapter.authorNote ||
    (chapter.credits && chapter.credits.length > 0) ||
    (chapter.contentWarnings && chapter.contentWarnings.length > 0) ||
    toc.chapters.length > 0
  );

  if (!hasAnyFrontMatter) return null;

  return (
    <div className={`space-y-6 rounded-[28px] border px-5 py-6 sm:px-8 ${theme === 'night' ? 'border-white/10 bg-white/[0.025]' : 'border-black/10 bg-white/65'}`}>
      {chapter.dedication && (
        <FrontMatterSection title="Dedication" theme={theme}>
          <p>{chapter.dedication}</p>
        </FrontMatterSection>
      )}

      {chapter.contentWarnings && chapter.contentWarnings.length > 0 && (
        <FrontMatterSection title="Content Notes" theme={theme}>
          <ul className="space-y-1">
            {chapter.contentWarnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </FrontMatterSection>
      )}

      {chapter.copyright && (
        <FrontMatterSection title="Copyright" theme={theme}>
          <p>{chapter.copyright}</p>
        </FrontMatterSection>
      )}

      {chapter.credits && chapter.credits.length > 0 && (
        <FrontMatterSection title="Credits" theme={theme}>
          <ul className="space-y-1">
            {chapter.credits.map((credit) => (
              <li key={credit}>{credit}</li>
            ))}
          </ul>
        </FrontMatterSection>
      )}

      {toc.chapters.length > 0 && (
        <section ref={tocRef} className={`border-t pt-6 ${theme === 'night' ? 'border-white/10' : 'border-black/10'}`}>
          <div className="flex items-center justify-between gap-3">
            <p className={`text-[0.68rem] font-semibold uppercase tracking-[0.32em] ${theme === 'night' ? 'text-white/45' : 'text-zinc-500'}`}>
              Table of Contents
            </p>
            <p className={`text-xs ${theme === 'night' ? 'text-white/38' : 'text-zinc-500'}`}>{toc.chapters.length} chapters</p>
          </div>
          <div className="mt-4 grid gap-2">
            {toc.chapters.map((tocChapter) => {
              const isActive = tocChapter.id === currentChapterId;

              return (
                <Button
                  key={tocChapter.id}
                  type="button"
                  variant="ghost"
                  onClick={() => onSelectChapter(tocChapter.id)}
                  className={`h-auto justify-between rounded-2xl px-4 py-3 text-left ${isActive
                    ? theme === 'night'
                      ? 'bg-white/10 text-white hover:bg-white/12'
                      : 'bg-black/6 text-zinc-950 hover:bg-black/8'
                    : theme === 'night'
                      ? 'text-white/68 hover:bg-white/6 hover:text-white'
                      : 'text-zinc-700 hover:bg-black/4 hover:text-zinc-950'
                  }`}
                >
                  <span className="min-w-0">
                    <span className={`block text-[0.68rem] font-semibold uppercase tracking-[0.28em] ${isActive ? '' : theme === 'night' ? 'text-white/38' : 'text-zinc-500'}`}>
                      Chapter {String(tocChapter.number).padStart(2, '0')}
                    </span>
                    <span className="mt-1 block truncate text-sm font-medium">{tocChapter.title}</span>
                  </span>
                  <span className={`text-xs ${theme === 'night' ? 'text-white/30' : 'text-zinc-400'}`}>
                    {isActive ? 'Reading' : 'Open'}
                  </span>
                </Button>
              );
            })}
          </div>
        </section>
      )}

      {chapter.authorNote && (
        <FrontMatterSection title="Author Note" theme={theme}>
          <p>{chapter.authorNote}</p>
        </FrontMatterSection>
      )}
    </div>
  );
}
