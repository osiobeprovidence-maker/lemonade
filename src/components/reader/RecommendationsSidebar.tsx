import React from 'react';
import { RECOMMENDATIONS } from './novel-reader-data';
import { ScrollArea } from '@/components/ui/scroll-area';

export function RecommendationsSidebar() {
  // Shown on desktop only
  return (
    <div className="hidden xl:flex flex-col w-[300px] border-l border-zinc-800/50 bg-zinc-950/30 shrink-0 h-[calc(100vh-64px)] sticky top-16">
      <div className="p-6">
        <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-widest mb-6">You might also like</h3>
        <div className="space-y-6">
          {RECOMMENDATIONS.map((rec) => (
            <div key={rec.id} className="flex gap-4 group cursor-pointer">
              <div className="w-16 h-24 rounded overflow-hidden shrink-0 bg-zinc-800">
                <img src={rec.cover} alt={rec.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
              </div>
              <div className="flex flex-col pt-1">
                <h4 className="text-sm font-semibold text-zinc-200 group-hover:text-primary transition-colors line-clamp-2">{rec.title}</h4>
                <p className="text-xs text-zinc-500 mt-1">{rec.author}</p>
                <div className="mt-auto pb-1">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                    {rec.reads} reads
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
