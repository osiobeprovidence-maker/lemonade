import React from 'react';
import { Chapter } from './novel-reader-data';

export type ReaderTheme = 'dark' | 'light' | 'sepia';

export interface ReaderSettings {
  theme: ReaderTheme;
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  fontFamily: 'sans' | 'serif';
  lineHeight: 'tight' | 'normal' | 'loose';
  contentWidth: 'narrow' | 'medium' | 'wide';
}

interface ChapterContentProps {
  chapter: Chapter;
  settings: ReaderSettings;
}

export function ChapterContent({ chapter, settings }: ChapterContentProps) {
  
  const getThemeClasses = () => {
    switch(settings.theme) {
      case 'light': return 'text-zinc-900 bg-white';
      case 'sepia': return 'text-[#433422] bg-[#f4ecd8]';
      case 'dark':
      default: return 'text-zinc-300'; // Background handled at page level
    }
  };

  const getFontSizeClasses = () => {
    switch(settings.fontSize) {
      case 'small': return 'text-base sm:text-lg';
      case 'large': return 'text-xl sm:text-2xl';
      case 'xlarge': return 'text-2xl sm:text-3xl';
      case 'medium':
      default: return 'text-lg sm:text-xl';
    }
  };

  const getFontFamilyClass = () => {
    return settings.fontFamily === 'serif' ? 'font-serif' : 'font-sans';
  };

  const getLineHeightClass = () => {
    switch(settings.lineHeight) {
      case 'tight': return 'leading-snug';
      case 'loose': return 'leading-loose';
      case 'normal':
      default: return 'leading-relaxed mb-6 sm:mb-8'; // Added margin bottom to the relaxed setting
    }
  };
  
  const widthClasses = {
    narrow: 'max-w-2xl',
    medium: 'max-w-3xl',
    wide: 'max-w-4xl'
  };

  return (
    <div className={`mx-auto px-6 sm:px-8 transition-all duration-300 ${widthClasses[settings.contentWidth]}`}>
      <div className={`
        ${getThemeClasses()} 
        ${getFontSizeClasses()} 
        ${getFontFamilyClass()}
        ${settings.lineHeight === 'loose' ? 'space-y-10' : settings.lineHeight === 'tight' ? 'space-y-4' : 'space-y-8'}
      `}>
        {chapter.content.map((paragraph, index) => (
          <p key={index} className={getLineHeightClass()}>
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}
