export interface Chapter {
  id: string;
  title: string;
  number: number;
  content: string[]; // Layout as paragraphs
  readTime: string;
  createdAt: string;
  authorNote?: string;
  dedication?: string;
  credits?: string;
  copyright?: string;
}

export interface Story {
  id: string | number;
  title: string;
  author: string;
  cover: string;
  description: string;
  chapters: Chapter[];
}

export const DUMMY_STORY: Story = {
  id: 'dummy-novel-1',
  title: 'The Edge of Eternity',
  author: 'Serena Vance',
  cover: 'https://picsum.photos/seed/novelcover1/400/600',
  description: 'In a world slowly bleeding into the void, one archivist must find the missing fragments of history before the darkness consumes all remaining life.',
  chapters: [
    {
      id: 'chap-1',
      title: 'The Awakening',
      number: 1,
      readTime: '4 min read',
      createdAt: 'Oct 12, 2026',
      dedication: 'For those who read in the dark.',
      authorNote: 'This was the first chapter I ever wrote for this series. Enjoy.',
      copyright: '© 2026 Serena Vance. All rights reserved.',
      content: [
        "The air in the grand library tasted of dust and forgotten promises. Elara adjusted her spectacles, wiping a smudge of ink from her cheek. It had been three days since she last saw the sun, not that the sun was much to look at lately. A pale, jaundiced eye in a bruised sky.",
        "She ran her fingers over the crumbling spine of the codex. The leather was brittle, flaking like dried skin. Her master had told her not to touch the forbidden texts in the lower vault, but her master was currently asleep, drunk on cheap wine and nostalgia.",
        "\"You shouldn't be here,\" a voice whispered from the shadows.",
        "Elara didn't jump. She just sighed, closing the book with a soft thump. \"And you shouldn't be sneaking up on people, Kael. It's unseemly for a fully licensed Void-Walker.\"",
        "Kael stepped into the dim light of her glow-globe. He looked terrible. His eyes were sunken, dark circles bruising the pale skin beneath. But then, all Void-Walkers looked terrible eventually. It was the price of their trade.",
        "\"They're looking for you,\" he said, ignoring her reprimand.",
        "\"Let them look. I haven't found the anchor phrase yet.\"",
        "\"If you don't come up now, they'll seal the vault with you inside.\"",
        "That gave her pause. She looked down at the texts, then back at him. \"Fine. But if the world ends because I was rushed, I'm blaming you.\""
      ]
    },
    {
      id: 'chap-2',
      title: 'The Descent',
      number: 2,
      readTime: '5 min read',
      createdAt: 'Oct 14, 2026',
      content: [
        "The stairs leading up from the vault were oppressively narrow.",
        "Every step felt heavier than the last. Kael led the way, his glow-globe casting long, distorted shadows that danced along the curved stone walls. ",
        "\"Why the urgency?\" Elara finally asked, her breath coming slightly short.",
        "\"The Magistrate,\" Kael said simply. \"He's declared a Purge.\"",
        "Elara stopped dead. The silence in the stairwell was sudden and absolute. \"A Purge? But the Outer Rim hasn't shown any fluctuation in months.\"",
        "\"It's not the Outer Rim he's worried about. It's the Inner Circles. People are talking, Elara. Whispering. About the fragments, about the real history. He wants to shut it down before it becomes a roar.\"",
        "They reached the top landing. Kael pushed open the heavy oak door. The Great Hall was empty, save for the distant, echoing bootsteps of the Magistrate's guards.",
        "\"We need to get out of the city,\" Kael whispered into the vastness."
      ]
    },
    {
      id: 'chap-3',
      title: 'Echoes in the Dark',
      number: 3,
      readTime: '6 min read',
      createdAt: 'Oct 19, 2026',
      authorNote: 'Thanks for making it this far!',
      content: [
        "Outside the grand archives, the night was unseasonably cold. A sharp wind cut through Elara's thin cloak.",
        "\"My maps are in my chambers,\" she muttered, shivering.",
        "\"Forget the maps. I know the way out.\"",
        "They slipped into the labyrinthine alleys of the lower quarters. The cobblestones were slick with moisture and grime. Here, the glamorous facade of the city peeled back to reveal its rotting core.",
        "Above them, sirens began to wail—a deep, mournful howl that vibrated in Elara's teeth.",
        "\"The Purge has started,\" Kael said grimly, quickening his pace."
      ]
    }
  ]
};

export const RECOMMENDATIONS = [
  {
    id: 'rec-1',
    title: 'Shadow Weaver',
    author: 'J.T. Sterling',
    cover: 'https://picsum.photos/seed/rec1/100/150',
    reads: '1.2M'
  },
  {
    id: 'rec-2',
    title: 'Neon Gods',
    author: 'K. Ryo',
    cover: 'https://picsum.photos/seed/rec2/100/150',
    reads: '850K'
  },
  {
    id: 'rec-3',
    title: 'The Last Ember',
    author: 'Ami',
    cover: 'https://picsum.photos/seed/rec3/100/150',
    reads: '2.1M'
  }
];
