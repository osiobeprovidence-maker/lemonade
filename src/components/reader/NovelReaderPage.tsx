import React, { useState, useEffect } from 'react';
import { DUMMY_STORY, Story } from './novel-reader-data';
import { ReaderTopBar } from './ReaderTopBar';
import { TableOfContentsSidebar } from './TableOfContentsSidebar';
import { ChapterIntro } from './ChapterIntro';
import { OptionalFrontMatter } from './OptionalFrontMatter';
import { ChapterContent, ReaderSettings } from './ChapterContent';
import { ReadingProgressBar } from './ReadingProgressBar';
import { ChapterNavigation } from './ChapterNavigation';
import { ReaderSettingsPanel } from './ReaderSettingsPanel';
import { RecommendationsSidebar } from './RecommendationsSidebar';

interface NovelReaderPageProps {
  onBack: () => void;
  story?: Story;
}

const DEFAULT_SETTINGS: ReaderSettings = {
  theme: 'dark',
  fontSize: 'medium',
  fontFamily: 'serif',
  lineHeight: 'normal',
  contentWidth: 'medium'
};

export function NovelReaderPage({ onBack, story = DUMMY_STORY }: NovelReaderPageProps) {
  const [currentChapterId, setCurrentChapterId] = useState(story.chapters[0].id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showTopBar, setShowTopBar] = useState(true);
  const [settings, setSettings] = useState<ReaderSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lemonade:reader-settings');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return DEFAULT_SETTINGS;
  });

  const currentChapterIndex = story.chapters.findIndex(c => c.id === currentChapterId);
  const currentChapter = story.chapters[currentChapterIndex];
  
  const hasPrevious = currentChapterIndex > 0;
  const hasNext = currentChapterIndex < story.chapters.length - 1;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lemonade:reader-settings', JSON.stringify(settings));
    }
  }, [settings]);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          if (currentScrollY < lastScrollY) {
            // Scrolling up
            setShowTopBar(true);
          } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
            // Scrolling down past threshold
            setShowTopBar(false);
          }
          
          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // When chapter changes, scroll to top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setShowTopBar(true);
  }, [currentChapterId]);

  useEffect(() => {
    setCurrentChapterId(story.chapters[0].id);
    setShowTopBar(true);
  }, [story]);

  if (!currentChapter) return null;

  return (
    <div className={`min-h-screen selection:bg-primary/30 selection:text-white ${settings.theme === 'light' ? 'bg-white' : settings.theme === 'sepia' ? 'bg-[#f4ecd8]' : 'bg-zinc-950'}`}>
      <ReadingProgressBar />
      
      <ReaderTopBar
        storyTitle={story.title}
        chapterTitle={currentChapter.title}
        isVisible={showTopBar}
        onBack={onBack}
        onOpenMenu={() => setIsSettingsOpen(true)}
        isLiked={isLiked}
        onToggleLike={() => setIsLiked(!isLiked)}
      />

      <div className="flex justify-center max-w-[1920px] mx-auto relative pt-16">
        
        {/* Left Sidebar (TOC) */}
        <TableOfContentsSidebar
          story={story}
          currentChapterId={currentChapterId}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onSelectChapter={setCurrentChapterId}
        />

        {/* Center Content Area */}
        <div className={`flex-1 flex flex-col min-h-[calc(100vh-64px)] w-full lg:max-w-[calc(100vw-320px)] xl:max-w-[calc(100vw-620px)] transition-all`}>
          <ChapterIntro story={story} chapter={currentChapter} />
          <OptionalFrontMatter chapter={currentChapter} />
          <ChapterContent chapter={currentChapter} settings={settings} />
          
          <ChapterNavigation
            currentChapter={currentChapter}
            hasPrevious={hasPrevious}
            hasNext={hasNext}
            onPrevious={() => setCurrentChapterId(story.chapters[currentChapterIndex - 1].id)}
            onNext={() => setCurrentChapterId(story.chapters[currentChapterIndex + 1].id)}
            onOpenTOC={() => setIsSidebarOpen(true)}
            width={settings.contentWidth}
          />
        </div>

        {/* Right Sidebar (Recommendations) */}
        <RecommendationsSidebar />

      </div>

      <ReaderSettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />
    </div>
  );
}
