import React, { startTransition, useEffect, useMemo, useRef, useState } from 'react';
import { Heart, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChapterContent } from './ChapterContent';
import { ChapterIntro } from './ChapterIntro';
import { ChapterNavigation } from './ChapterNavigation';
import { DEFAULT_READER_PREFERENCES, type NovelReaderData, type ReaderPreferences } from './novel-reader-data';
import { OptionalFrontMatter } from './OptionalFrontMatter';
import { ReaderMenu } from './ReaderMenu';
import { ReaderSettingsPanel } from './ReaderSettingsPanel';
import { ReaderTopBar } from './ReaderTopBar';
import { ReadingProgressBar } from './ReadingProgressBar';

interface NovelReaderPageProps {
  data: NovelReaderData;
  isFavorite: boolean;
  onBack: () => void;
  onToggleFavorite: () => void;
}

type SavedProgress = {
  chapterId: string;
  progress: number;
  updatedAt: number;
};

const PREFERENCES_STORAGE_KEY = 'lemonade:novel-reader-preferences:v1';

const WIDTH_CLASS = {
  narrow: 'max-w-3xl',
  standard: 'max-w-4xl',
  wide: 'max-w-5xl',
} as const;

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

function progressKey(storyId: string) {
  return `lemonade:novel-progress:${storyId}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getInitialSavedProgress(storyId: string): SavedProgress | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(progressKey(storyId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function chapterIndexFromSavedProgress(data: NovelReaderData) {
  const hashChapterId = typeof window !== 'undefined'
    ? window.location.hash.replace('#chapter-', '').trim()
    : '';
  if (hashChapterId) {
    const hashIndex = data.chapters.findIndex((chapter) => chapter.id === hashChapterId);
    if (hashIndex >= 0) return hashIndex;
  }

  const savedProgress = getInitialSavedProgress(data.story.id);
  if (!savedProgress) return 0;

  const savedIndex = data.chapters.findIndex((chapter) => chapter.id === savedProgress.chapterId);
  return savedIndex >= 0 ? savedIndex : 0;
}

export function NovelReaderPage({ data, isFavorite, onBack, onToggleFavorite }: NovelReaderPageProps) {
  const [preferences, setPreferences] = useState<ReaderPreferences>(() => readStorage(PREFERENCES_STORAGE_KEY, DEFAULT_READER_PREFERENCES));
  const [chapterIndex, setChapterIndex] = useState(() => chapterIndexFromSavedProgress(data));
  const [isChromeVisible, setIsChromeVisible] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [chapterProgress, setChapterProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const contentRef = useRef<HTMLDivElement | null>(null);
  const tocRef = useRef<HTMLDivElement | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const lastScrollYRef = useRef(0);
  const skipFirstChapterEffectRef = useRef(true);
  const progressPersistenceReadyRef = useRef(false);
  const restoredFromSavedProgressRef = useRef(false);
  const savedProgressRef = useRef<SavedProgress | null>(getInitialSavedProgress(data.story.id));
  const currentChapter = data.chapters[chapterIndex] || data.chapters[0];
  const previousChapter = chapterIndex > 0 ? data.chapters[chapterIndex - 1] : undefined;
  const nextChapter = chapterIndex < data.chapters.length - 1 ? data.chapters[chapterIndex + 1] : undefined;
  const overallProgress = useMemo(
    () => ((chapterIndex + chapterProgress) / Math.max(data.chapters.length, 1)) * 100,
    [chapterIndex, chapterProgress, data.chapters.length]
  );

  const resumePoint = savedProgressRef.current;
  const hasResumePoint = Boolean(
    resumePoint &&
    (
      resumePoint.chapterId !== currentChapter.id ||
      resumePoint.progress > 0.08
    )
  );

  const revealChrome = React.useCallback(() => {
    setIsChromeVisible(true);

    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
    }

    if (preferences.immersiveMode) {
      hideTimerRef.current = window.setTimeout(() => {
        setIsChromeVisible(false);
      }, 2400);
    }
  }, [preferences.immersiveMode]);

  const selectChapterById = React.useCallback((chapterId: string) => {
    const nextIndex = data.chapters.findIndex((chapter) => chapter.id === chapterId);
    if (nextIndex < 0) return;

    startTransition(() => {
      setChapterIndex(nextIndex);
      setIsMenuOpen(false);
      setIsSettingsOpen(false);
      setIsChromeVisible(true);
    });
  }, [data.chapters]);

  const scrollToToc = React.useCallback(() => {
    setIsMenuOpen(false);
    revealChrome();
    tocRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [revealChrome]);

  const copyLink = React.useCallback(async () => {
    if (typeof window === 'undefined') return;

    const url = `${window.location.origin}${window.location.pathname}#chapter-${currentChapter.id}`;

    try {
      await navigator.clipboard.writeText(url);
      setStatusMessage('Chapter link copied');
    } catch {
      setStatusMessage('Could not copy link');
    }

    setIsMenuOpen(false);
  }, [currentChapter.id]);

  const shareChapter = React.useCallback(async () => {
    if (typeof window === 'undefined') return;

    const url = `${window.location.origin}${window.location.pathname}#chapter-${currentChapter.id}`;
    const shareData = {
      title: `${data.story.title} — ${currentChapter.title}`,
      text: `Read Chapter ${currentChapter.number} of ${data.story.title} on Lemonade.`,
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setStatusMessage('Share sheet opened');
      } else {
        await navigator.clipboard.writeText(url);
        setStatusMessage('Share link copied');
      }
    } catch {
      setStatusMessage('Share cancelled');
    }

    setIsMenuOpen(false);
  }, [currentChapter.number, currentChapter.title, data.story.title]);

  const reportChapter = React.useCallback(() => {
    if (typeof window === 'undefined') return;

    const subject = encodeURIComponent(`Report chapter issue: ${data.story.title} / ${currentChapter.title}`);
    const body = encodeURIComponent(`I want to report an issue with ${data.story.title}, chapter ${currentChapter.number} (${currentChapter.title}).`);
    window.location.href = `mailto:support@lemonade.app?subject=${subject}&body=${body}`;
    setIsMenuOpen(false);
  }, [currentChapter.number, currentChapter.title, data.story.title]);

  const goToResumePoint = React.useCallback(() => {
    const savedProgress = savedProgressRef.current;
    if (!savedProgress) return;

    const savedIndex = data.chapters.findIndex((chapter) => chapter.id === savedProgress.chapterId);
    if (savedIndex < 0) return;

    startTransition(() => {
      setChapterIndex(savedIndex);
      setIsChromeVisible(true);
    });
  }, [data.chapters]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.history.replaceState(null, '', `${window.location.pathname}#chapter-${currentChapter.id}`);
  }, [currentChapter.id]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const currentDirectionDelta = scrollY - lastScrollYRef.current;

      if (currentDirectionDelta > 10 && scrollY > 90) {
        setIsChromeVisible(false);
      } else if (currentDirectionDelta < -10 || scrollY < 24) {
        revealChrome();
      }

      if (contentRef.current) {
        const start = contentRef.current.offsetTop - window.innerHeight * 0.25;
        const end = contentRef.current.offsetTop + contentRef.current.offsetHeight - window.innerHeight * 0.65;
        const ratio = clamp((scrollY - start) / Math.max(end - start, 1), 0, 1);
        setChapterProgress(ratio);
      }

      lastScrollYRef.current = scrollY;
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentChapter.id, revealChrome]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!progressPersistenceReadyRef.current) return;

    const payload: SavedProgress = {
      chapterId: currentChapter.id,
      progress: chapterProgress,
      updatedAt: Date.now(),
    };

    savedProgressRef.current = payload;
    window.localStorage.setItem(progressKey(data.story.id), JSON.stringify(payload));
  }, [chapterProgress, currentChapter.id, data.story.id]);

  useEffect(() => {
    if (skipFirstChapterEffectRef.current) {
      skipFirstChapterEffectRef.current = false;

      const savedProgress = savedProgressRef.current;
      if (!savedProgress || savedProgress.chapterId !== currentChapter.id || savedProgress.progress <= 0.02) {
        progressPersistenceReadyRef.current = true;
        return;
      }

      restoredFromSavedProgressRef.current = true;
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          if (!contentRef.current) return;
          const maxScrollDistance = Math.max(contentRef.current.offsetHeight - window.innerHeight * 0.55, 0);
          const scrollTarget = contentRef.current.offsetTop + maxScrollDistance * savedProgress.progress;
          window.scrollTo({ top: scrollTarget, behavior: 'auto' });
          progressPersistenceReadyRef.current = true;
        });
      });
      return;
    }

    if (!restoredFromSavedProgressRef.current) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    restoredFromSavedProgressRef.current = false;
    progressPersistenceReadyRef.current = true;
  }, [currentChapter.id]);

  useEffect(() => {
    revealChrome();

    return () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, [revealChrome]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target.tagName)) return;

      if ((event.key === 'ArrowRight' || event.key.toLowerCase() === 'j') && nextChapter) {
        event.preventDefault();
        selectChapterById(nextChapter.id);
      }

      if ((event.key === 'ArrowLeft' || event.key.toLowerCase() === 'k') && previousChapter) {
        event.preventDefault();
        selectChapterById(previousChapter.id);
      }

      if (event.key.toLowerCase() === 't') {
        event.preventDefault();
        setPreferences((currentPreferences) => ({
          ...currentPreferences,
          theme: currentPreferences.theme === 'night' ? 'day' : 'night',
        }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextChapter, previousChapter, selectChapterById]);

  useEffect(() => {
    if (!statusMessage) return;

    const timeout = window.setTimeout(() => setStatusMessage(''), 2200);
    return () => window.clearTimeout(timeout);
  }, [statusMessage]);

  const theme = preferences.theme;
  const shellClass = theme === 'night'
    ? 'bg-[#050506] text-white'
    : 'bg-[#f4ede2] text-zinc-950';
  const backgroundGlow = theme === 'night'
    ? 'bg-[radial-gradient(circle_at_top,rgba(91,255,166,0.12),transparent_30%),radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_22%),linear-gradient(180deg,#050506_0%,#0a0a0d_100%)]'
    : 'bg-[radial-gradient(circle_at_top,rgba(14,19,14,0.06),transparent_34%),linear-gradient(180deg,#f6f0e6_0%,#efe6d7_100%)]';

  return (
    <div className={`relative min-h-screen overflow-x-hidden ${shellClass}`}>
      <ReadingProgressBar progress={overallProgress} theme={theme} />
      <ReaderTopBar
        theme={theme}
        visible={isChromeVisible}
        storyTitle={data.story.title}
        chapterTitle={currentChapter.title}
        chapterLabel={`Chapter ${String(currentChapter.number).padStart(2, '0')}`}
        onBack={onBack}
        onToggleFavorite={onToggleFavorite}
        onOpenMenu={() => setIsMenuOpen(true)}
        isFavorite={isFavorite}
      />
      <ReaderMenu
        open={isMenuOpen}
        onOpenChange={setIsMenuOpen}
        theme={theme}
        onOpenSettings={() => {
          setIsMenuOpen(false);
          setIsSettingsOpen(true);
        }}
        onJumpToToc={scrollToToc}
        onShare={shareChapter}
        onCopyLink={copyLink}
        onReport={reportChapter}
        onToggleTheme={() => {
          setPreferences((currentPreferences) => ({
            ...currentPreferences,
            theme: currentPreferences.theme === 'night' ? 'day' : 'night',
          }));
          setIsMenuOpen(false);
        }}
        immersiveMode={preferences.immersiveMode}
      />
      <ReaderSettingsPanel
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        preferences={preferences}
        onChange={setPreferences}
      />

      <div className={`fixed inset-0 ${backgroundGlow}`} aria-hidden="true" />
      <div
        className={`pointer-events-none fixed inset-0 opacity-40 ${theme === 'night'
          ? 'bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_12%,transparent_88%,rgba(255,255,255,0.02))]'
          : 'bg-[linear-gradient(180deg,rgba(255,255,255,0.35),transparent_12%,transparent_88%,rgba(255,255,255,0.16))]'
        }`}
        aria-hidden="true"
      />

      <main
        className="relative z-10"
        onClick={() => {
          if (!isChromeVisible) revealChrome();
        }}
      >
        <div className={`mx-auto w-full px-4 pb-28 pt-24 sm:px-6 lg:px-8 ${WIDTH_CLASS[preferences.contentWidth]}`}>
          <div className={`mb-10 flex items-start gap-4 rounded-[32px] border p-5 sm:p-7 ${theme === 'night' ? 'border-white/10 bg-black/20' : 'border-black/10 bg-white/50'}`}>
            <div className="relative hidden overflow-hidden rounded-[20px] sm:block sm:h-28 sm:w-20 lg:h-36 lg:w-24">
              <img
                src={data.story.coverImage}
                alt={data.story.title}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-[0.68rem] font-semibold uppercase tracking-[0.32em] ${theme === 'night' ? 'text-white/45' : 'text-zinc-500'}`}>
                Dedicated fiction reader
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{data.story.title}</h1>
              <p className={`mt-3 max-w-3xl text-sm leading-7 sm:text-[0.96rem] ${theme === 'night' ? 'text-white/62' : 'text-zinc-700'}`}>
                {data.story.description}
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <ChapterIntro
              story={data.story}
              chapter={currentChapter}
              theme={theme}
              hasResumePoint={hasResumePoint}
              onResume={goToResumePoint}
            />

            <OptionalFrontMatter
              chapter={currentChapter}
              toc={data.toc}
              currentChapterId={currentChapter.id}
              onSelectChapter={selectChapterById}
              theme={theme}
              tocRef={tocRef}
            />

            <ChapterContent
              content={currentChapter.content}
              theme={theme}
              fontSize={preferences.fontSize}
              lineHeight={preferences.lineHeight}
              fontFamily={preferences.fontFamily}
              contentRef={contentRef}
            />

            <ChapterNavigation
              theme={theme}
              previousChapter={previousChapter}
              nextChapter={nextChapter}
              onPrevious={() => previousChapter && selectChapterById(previousChapter.id)}
              onNext={() => nextChapter && selectChapterById(nextChapter.id)}
              onBackToToc={scrollToToc}
            />
          </div>
        </div>
      </main>

      <div className={`fixed bottom-4 right-4 z-[55] flex items-center gap-2 transition-all duration-300 sm:bottom-6 sm:right-6 ${isChromeVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onToggleFavorite}
          aria-label={isFavorite ? 'Remove favorite' : 'Add favorite'}
          className={`h-12 w-12 rounded-full backdrop-blur-xl ${theme === 'night'
            ? 'border-white/12 bg-black/55 text-white hover:bg-black/70'
            : 'border-black/10 bg-white/85 text-zinc-900 hover:bg-white'
          }`}
        >
          <Heart className={`h-5 w-5 ${isFavorite ? 'fill-primary text-primary' : ''}`} />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setIsSettingsOpen(true)}
          aria-label="Open reader settings"
          className={`h-12 w-12 rounded-full backdrop-blur-xl ${theme === 'night'
            ? 'border-white/12 bg-black/55 text-white hover:bg-black/70'
            : 'border-black/10 bg-white/85 text-zinc-900 hover:bg-white'
          }`}
        >
          <Settings2 className="h-5 w-5" />
        </Button>
      </div>

      {statusMessage && (
        <div className={`fixed bottom-24 left-1/2 z-[80] -translate-x-1/2 rounded-full px-4 py-2 text-sm font-medium shadow-lg ${theme === 'night'
          ? 'bg-white text-black'
          : 'bg-zinc-950 text-white'
        }`}>
          {statusMessage}
        </div>
      )}
    </div>
  );
}
