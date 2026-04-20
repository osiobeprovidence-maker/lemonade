import React from 'react';
import { Chapter } from './novel-reader-data';

interface OptionalFrontMatterProps {
  chapter: Chapter;
}

export function OptionalFrontMatter({ chapter }: OptionalFrontMatterProps) {
  const hasFrontMatter = chapter.authorNote || chapter.dedication || chapter.credits;

  if (!hasFrontMatter) return null;

  return (
    <div className="max-w-3xl mx-auto px-6 mb-16 space-y-6">
      {chapter.dedication && (
        <div className="text-center italic text-zinc-400 py-8 text-lg font-serif">
          {chapter.dedication}
        </div>
      )}

      {chapter.authorNote && (
        <div className="bg-zinc-900/50 border border-zinc-800/50 p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary/50" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Author's Note</h3>
          <p className="text-sm text-zinc-300 leading-relaxed font-sans">{chapter.authorNote}</p>
        </div>
      )}

      {chapter.credits && (
        <div className="text-xs text-zinc-500 uppercase tracking-widest space-y-1 py-4 border-t border-zinc-800/50 mt-8">
          {chapter.credits}
        </div>
      )}
    </div>
  );
}
