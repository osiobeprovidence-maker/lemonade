import type * as React from 'react';
import type { ReaderFontFamily, ReaderFontSize, ReaderLineHeight, ReaderTheme } from './novel-reader-data';

interface ChapterContentProps {
  content: string;
  theme: ReaderTheme;
  fontSize: ReaderFontSize;
  lineHeight: ReaderLineHeight;
  fontFamily: ReaderFontFamily;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

const FONT_SIZE_CLASS: Record<ReaderFontSize, string> = {
  small: 'text-[1rem] sm:text-[1.06rem]',
  medium: 'text-[1.08rem] sm:text-[1.18rem]',
  large: 'text-[1.18rem] sm:text-[1.32rem]',
};

const LINE_HEIGHT_CLASS: Record<ReaderLineHeight, string> = {
  compact: 'leading-[1.9]',
  comfortable: 'leading-[2.05]',
  spacious: 'leading-[2.2]',
};

const FONT_FAMILY_STYLE: Record<ReaderFontFamily, string> = {
  serif: '"Iowan Old Style", Georgia, Cambria, "Times New Roman", serif',
  sans: '"Inter Variable", Inter, system-ui, sans-serif',
};

export function ChapterContent({
  content,
  theme,
  fontSize,
  lineHeight,
  fontFamily,
  contentRef,
}: ChapterContentProps) {
  const paragraphs = content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <article ref={contentRef} className="novel-reader-selection">
      <div
        className={`rounded-[28px] border px-5 py-8 sm:px-8 sm:py-10 ${theme === 'night' ? 'border-white/10 bg-white/[0.02]' : 'border-black/10 bg-white/70'}`}
        style={{ fontFamily: FONT_FAMILY_STYLE[fontFamily] }}
      >
        <div className={`space-y-7 sm:space-y-8 ${FONT_SIZE_CLASS[fontSize]} ${LINE_HEIGHT_CLASS[lineHeight]} ${theme === 'night' ? 'text-[rgba(244,239,231,0.92)]' : 'text-[rgba(34,30,24,0.94)]'}`}>
          {paragraphs.map((paragraph, index) => (
            <p key={`${index}-${paragraph.slice(0, 18)}`} className={index === 0 ? 'first-letter:mr-1 first-letter:text-[3.2em] first-letter:font-semibold first-letter:leading-[0.8] first-letter:float-left' : ''}>
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </article>
  );
}
