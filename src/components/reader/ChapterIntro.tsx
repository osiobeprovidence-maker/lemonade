import React from 'react';
import { Chapter, Story } from './novel-reader-data';

interface ChapterIntroProps {
  story: Story;
  chapter: Chapter;
}

export function ChapterIntro({ story, chapter }: ChapterIntroProps) {
  return (
    <div className="mb-16 mt-8 sm:mt-12 text-center sm:text-left flex flex-col items-center sm:items-start max-w-3xl mx-auto px-6">
      <span className="text-primary font-medium tracking-widest uppercase text-xs sm:text-sm mb-4">
        {story.title}
      </span>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-6">
        {chapter.number}. {chapter.title}
      </h1>
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 text-zinc-400 text-sm">
        <span className="font-medium text-zinc-300">{story.author}</span>
        <span className="w-1 h-1 rounded-full bg-zinc-700" />
        <span>{chapter.readTime}</span>
        {chapter.createdAt && (
          <>
            <span className="w-1 h-1 rounded-full bg-zinc-700" />
            <span>{chapter.createdAt}</span>
          </>
        )}
      </div>
    </div>
  );
}
