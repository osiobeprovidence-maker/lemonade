export type ReaderTheme = 'night' | 'day';
export type ReaderFontSize = 'small' | 'medium' | 'large';
export type ReaderLineHeight = 'compact' | 'comfortable' | 'spacious';
export type ReaderContentWidth = 'narrow' | 'standard' | 'wide';
export type ReaderFontFamily = 'serif' | 'sans';

export interface ReaderPreferences {
  theme: ReaderTheme;
  fontSize: ReaderFontSize;
  lineHeight: ReaderLineHeight;
  contentWidth: ReaderContentWidth;
  fontFamily: ReaderFontFamily;
  immersiveMode: boolean;
}

export interface ReaderStory {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  description: string;
}

export interface ReaderChapter {
  id: string;
  title: string;
  number: number;
  content: string;
  estimatedReadTime: string;
  publishedAt?: string;
  updatedAt?: string;
  copyright?: string;
  credits?: string[];
  authorNote?: string;
  dedication?: string;
  contentWarnings?: string[];
  tags?: string[];
}

export interface ReaderToc {
  chapters: Array<Pick<ReaderChapter, 'id' | 'title' | 'number'>>;
}

export interface NovelReaderData {
  story: ReaderStory;
  chapters: ReaderChapter[];
  toc: ReaderToc;
}

export const DEFAULT_READER_PREFERENCES: ReaderPreferences = {
  theme: 'night',
  fontSize: 'medium',
  lineHeight: 'comfortable',
  contentWidth: 'standard',
  fontFamily: 'serif',
  immersiveMode: true,
};

const CHAPTER_TITLES = [
  'The Quiet Before the Knock',
  'A Door Left Half Open',
  'What the Glass Refused to Hide',
  'The Promise After Midnight',
  'When the Hallway Learned Your Name',
  'A Window Full of Warnings',
  'What We Agreed Not to Say',
  'The Weight of a Delayed Answer',
];

const TAG_SETS = [
  ['Slow Burn', 'Premium Fiction'],
  ['Intimate Tension', 'Character Drama'],
  ['Character Drama', 'Premium Fiction'],
  ['Cliffhanger', 'Late Reveal'],
  ['Quiet Tension', 'Emotional Stakes'],
  ['Secrets', 'Long-form Fiction'],
];

const WARNING_SETS = [
  ['Emotional tension', 'Late-night anxiety'],
  ['Stressful confrontation'],
  ['Family conflict'],
  ['Relationship strain'],
];

const AUTHOR_NOTES = [
  'This opening chapter is designed to settle you into atmosphere first. Let the silence do some of the work.',
  'Watch how the same room feels different once everyone begins telling the truth in fragments.',
  'The final section is where the emotional contract of the arc becomes visible.',
  'The subtext matters here as much as the spoken lines. Stay with the pauses.',
];

const buildChapterContent = (storyTitle: string, author: string, chapterNumber: number, genre: string, seedText: string) => {
  const opening = chapterNumber === 1
    ? `${seedText} No announcement came with it, only a hush spreading across the room the way ink spreads through water.`
    : `By the time chapter ${chapterNumber} opened, ${storyTitle} had already taught everyone in the room to listen for danger inside silence.`;

  return [
    opening,
    `The city kept breathing beyond the glass, restless and electric, but inside everything narrowed to detail: a wrist turning against lamplight, a letter folded too many times, the brittle pause before somebody admits what they can no longer carry alone.`,
    `${author} writes this world with a deliberate pulse. The prose moves in long, clean lines, giving every emotional beat enough air to land while still pulling the chapter forward with quiet tension.`,
    `There are stories that race. This one stalks. It lets memory, desire, and consequence brush past each other until even the smallest gesture starts to feel like a decision with weight.`,
    `Tonight that weight settled everywhere. In the unfinished sentence. In the chair left angled toward the door. In the way ${storyTitle.toLowerCase()} kept circling the same truth: whatever came next would ask more of its characters than simple courage.`,
    `When the final page of the scene turned, nothing exploded. No thunder, no revelation large enough to excuse itself. Just a softer, sharper thing: the realization that every promise made so far was about to be tested in public.`,
    `It was the kind of chapter ${genre.toLowerCase()} readers stay up for. Not because it shouts, but because it understands how suspense behaves when everyone in the room is pretending to be composed.`,
  ].join('\n\n');
};

const estimateReadTime = (chapterNumber: number) => `${8 + ((chapterNumber - 1) % 5)} min read`;

const dateForChapter = (chapterNumber: number) => {
  const day = String(Math.min(28, 6 + chapterNumber)).padStart(2, '0');
  return `2026-04-${day}`;
};

const titleForChapter = (chapterNumber: number) => {
  const baseTitle = CHAPTER_TITLES[(chapterNumber - 1) % CHAPTER_TITLES.length];
  if (chapterNumber <= CHAPTER_TITLES.length) return baseTitle;
  return `${baseTitle} ${chapterNumber}`;
};

export function buildSampleNovelReaderData(story: {
  id: string | number;
  title: string;
  creator: string;
  cover: string;
  summary?: string;
  genre: string;
  chapters?: number;
}): NovelReaderData {
  const storyId = String(story.id);
  const baseSummary = story.summary || `${story.title} is a premium Lemonade fiction serial about people who keep choosing the dangerous truth over the easy version of their lives.`;
  const chapterCount = Math.max(4, story.chapters ?? 4);

  const chapters: ReaderChapter[] = Array.from({ length: chapterCount }, (_, index) => {
    const chapterNumber = index + 1;
    const date = dateForChapter(chapterNumber);
    const tagSet = TAG_SETS[index % TAG_SETS.length];
    const shouldIncludeWarnings = chapterNumber === 1 || chapterNumber % 3 === 0;
    const shouldIncludeCredits = chapterNumber === 1 || chapterNumber % 4 === 0;
    const shouldIncludeAuthorNote = chapterNumber === 1 || chapterNumber % 2 === 0;

    return {
      id: `${storyId}-chapter-${chapterNumber}`,
      title: titleForChapter(chapterNumber),
      number: chapterNumber,
      content: buildChapterContent(story.title, story.creator, chapterNumber, story.genre, baseSummary),
      estimatedReadTime: estimateReadTime(chapterNumber),
      publishedAt: date,
      updatedAt: chapterNumber % 2 === 1 ? date : undefined,
      copyright: chapterNumber === 1 ? `Copyright 2026 Lemonade Fiction. ${story.creator}. All rights reserved.` : undefined,
      credits: shouldIncludeCredits ? ['Written by ' + story.creator, 'Edited by Lemonade Fiction'] : undefined,
      dedication: chapterNumber === 1 ? 'For readers who stay one paragraph longer than they planned.' : undefined,
      contentWarnings: shouldIncludeWarnings ? WARNING_SETS[index % WARNING_SETS.length] : undefined,
      authorNote: shouldIncludeAuthorNote ? AUTHOR_NOTES[index % AUTHOR_NOTES.length] : undefined,
      tags: [story.genre, ...tagSet],
    };
  });

  return {
    story: {
      id: storyId,
      title: story.title,
      author: story.creator,
      coverImage: story.cover,
      description: baseSummary,
    },
    chapters,
    toc: {
      chapters: chapters.map(({ id, title, number }) => ({
        id,
        title,
        number,
      })),
    },
  };
}
