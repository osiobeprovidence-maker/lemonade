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
    `It was the kind of chapter ${genre.toLowerCase()} readers stay up for. Not because it shouts, but because it understands how suspense behaves when everyone in the room is pretending to be composed.`
  ].join('\n\n');
};

export function buildSampleNovelReaderData(story: {
  id: string | number;
  title: string;
  creator: string;
  cover: string;
  summary?: string;
  genre: string;
}): NovelReaderData {
  const storyId = String(story.id);
  const baseSummary = story.summary || `${story.title} is a premium Lemonade fiction serial about people who keep choosing the dangerous truth over the easy version of their lives.`;

  const chapters: ReaderChapter[] = [
    {
      id: `${storyId}-chapter-1`,
      title: 'The Quiet Before the Knock',
      number: 1,
      content: buildChapterContent(story.title, story.creator, 1, story.genre, baseSummary),
      estimatedReadTime: '8 min read',
      publishedAt: '2026-04-07',
      updatedAt: '2026-04-15',
      copyright: `Copyright 2026 Lemonade Fiction. ${story.creator}. All rights reserved.`,
      credits: ['Written by ' + story.creator, 'Edited by Lemonade Fiction', 'Cover concept by Lemonade Studio'],
      dedication: 'For readers who stay one paragraph longer than they planned.',
      contentWarnings: ['Emotional tension', 'Late-night anxiety'],
      authorNote: 'This opening chapter is designed to settle you into atmosphere first. Let the silence do some of the work.',
      tags: [story.genre, 'Slow Burn', 'Premium Fiction'],
    },
    {
      id: `${storyId}-chapter-2`,
      title: 'A Door Left Half Open',
      number: 2,
      content: buildChapterContent(story.title, story.creator, 2, story.genre, baseSummary),
      estimatedReadTime: '11 min read',
      publishedAt: '2026-04-09',
      authorNote: 'Watch how the same room feels different once everyone begins telling the truth in fragments.',
      tags: [story.genre, 'Intimate Tension'],
    },
    {
      id: `${storyId}-chapter-3`,
      title: 'What the Glass Refused to Hide',
      number: 3,
      content: buildChapterContent(story.title, story.creator, 3, story.genre, baseSummary),
      estimatedReadTime: '10 min read',
      publishedAt: '2026-04-12',
      updatedAt: '2026-04-18',
      credits: ['Narrative consultant: Lemonade Editorial'],
      contentWarnings: ['Stressful confrontation'],
      tags: [story.genre, 'Character Drama'],
    },
    {
      id: `${storyId}-chapter-4`,
      title: 'The Promise After Midnight',
      number: 4,
      content: buildChapterContent(story.title, story.creator, 4, story.genre, baseSummary),
      estimatedReadTime: '12 min read',
      publishedAt: '2026-04-18',
      authorNote: 'The last section is where the emotional contract of the arc becomes visible.',
      tags: [story.genre, 'Cliffhanger'],
    },
  ];

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
