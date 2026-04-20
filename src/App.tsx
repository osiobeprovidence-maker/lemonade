import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './contexts/AuthContext';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Heart, ChevronRight, Menu, Bell, User, Star, Clock, Home, Compass, PenTool, Facebook, Twitter, Instagram, Youtube, Plus, X, Play, SkipForward, DollarSign, Coins, BarChart3, Settings, BadgeCheck, Share2, MoreVertical, List, Check, Upload, BookOpen, ShieldCheck, Users, MessageSquare, Flag, Megaphone, Trash2, Eye, EyeOff, Settings2, ExternalLink, Lock, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Logo } from './components/Logo';
import { AuthModal } from './components/AuthModal';
import { auth } from './lib/firebase';
import { updateProfile as updateFirebaseProfile } from 'firebase/auth';
import { uploadProfilePhoto } from './lib/profilePhoto';
import { NovelReaderPage } from './components/reader/NovelReaderPage';
import { DUMMY_STORY } from './components/reader/novel-reader-data';

type StoryId = number | string;

interface StoryBase {
  id: StoryId;
  title: string;
  creator: string;
  genre: string;
  cover: string;
  views: string;
  likes: string;
  summary?: string;
}

interface ComicStory extends StoryBase {
  type: 'series';
  emotion?: string;
  rankChange: number;
  day: string;
  isNew: boolean;
  isOriginal: boolean;
}

type Story = ComicStory;
type StoryComment = {
  id: number;
  user: string;
  text: string;
  likes: number;
  date: string;
};

type CreatorDropVisibility = 'public' | 'premium';

type CreatorMoment = {
  id: string;
  title: string;
  description: string;
  label: string;
  visibility: CreatorDropVisibility;
  accent: string;
};

const isComicStory = (story: Story): story is ComicStory => story.type === 'series';

const parseCompactMetric = (value?: string | number) => {
  if (typeof value === 'number') return value;
  if (!value) return 0;

  const trimmed = value.trim().toUpperCase();
  const multiplier = trimmed.endsWith('M') ? 1_000_000 : trimmed.endsWith('K') ? 1_000 : 1;
  const normalized = trimmed.replace(/[^0-9.]/g, '');
  const parsed = Number.parseFloat(normalized);

  if (Number.isNaN(parsed)) return 0;
  return parsed * multiplier;
};

const formatCompactMetric = (value: number) =>
  new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: value >= 1000 ? 1 : 0 }).format(value);

const normalizeExternalUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const COMICS: ComicStory[] = [
  { id: 1, title: "Surviving the Game as a Barbarian", creator: "K. Ryo", emotion: "Fantasy", genre: "Fantasy", cover: "https://picsum.photos/seed/barbarian/400/533", rankChange: 37, views: "53M", likes: "1.2M", day: "Mon", isNew: true, isOriginal: true, type: 'series' },
  { id: 2, title: "The Knight Only Lives Today", creator: "Ami", emotion: "Fantasy", genre: "Fantasy", cover: "https://picsum.photos/seed/knight/400/533", rankChange: 34, views: "12M", likes: "800K", day: "Tue", isNew: false, isOriginal: true, type: 'series' },
  { id: 3, title: "For Your Murder", creator: "J.D.", emotion: "Drama", genre: "Drama", cover: "https://picsum.photos/seed/murder/400/533", rankChange: -2, views: "315K", likes: "174K", day: "Wed", isNew: true, isOriginal: false, type: 'series' },
  { id: 4, title: "Falling For It", creator: "S. Lin", emotion: "Romance", genre: "Romance", cover: "https://picsum.photos/seed/falling/400/533", rankChange: 31, views: "675K", likes: "388K", day: "Thu", isNew: false, isOriginal: true, type: 'series' },
  { id: 5, title: "Return of the Blossoming Blade", creator: "T.K.", emotion: "Action", genre: "Action", cover: "https://picsum.photos/seed/blade/400/533", rankChange: 27, views: "194M", likes: "1.1M", day: "Fri", isNew: true, isOriginal: true, type: 'series' },
  { id: 6, title: "Undercover Wife", creator: "Lila", emotion: "Romance", genre: "Romance", cover: "https://picsum.photos/seed/wife/400/533", rankChange: -4, views: "4M", likes: "232K", day: "Sat", isNew: false, isOriginal: false, type: 'series' },
  { id: 7, title: "The Price Is Your Everything", creator: "Lemonade", emotion: "Drama", genre: "Drama", cover: "https://picsum.photos/seed/price/400/533", rankChange: 10, views: "53M", likes: "1.3M", day: "Sun", isNew: true, isOriginal: true, type: 'series' },
  { id: 8, title: "Daytime in the Bunker", creator: "Lemonade", emotion: "Drama", genre: "Drama", cover: "https://picsum.photos/seed/bunker/400/533", rankChange: 5, views: "315K", likes: "174K", day: "Sun", isNew: true, isOriginal: true, type: 'series' },
  { id: 9, title: "My Wavering Husband", creator: "Lemonade", emotion: "Drama", genre: "Drama", cover: "https://picsum.photos/seed/wavering/400/533", rankChange: 2, views: "675K", likes: "388K", day: "Sun", isNew: true, isOriginal: true, type: 'series' },
  { id: 10, title: "Acception", creator: "Lemonade", emotion: "Drama", genre: "Drama", cover: "https://picsum.photos/seed/acception/400/533", rankChange: -1, views: "194M", likes: "1.1M", day: "Sun", isNew: false, isOriginal: true, type: 'series' },
  { id: 11, title: "Adopting a Zombie", creator: "Lemonade", emotion: "Drama", genre: "Drama", cover: "https://picsum.photos/seed/zombie/400/533", rankChange: 0, views: "4M", likes: "232K", day: "Sun", isNew: false, isOriginal: true, type: 'series' },
  { id: 12, title: "Behind Her Highness's Smile", creator: "Lemonade", emotion: "Drama", genre: "Drama", cover: "https://picsum.photos/seed/smile/400/533", rankChange: 12, views: "28M", likes: "1.3M", day: "Sun", isNew: false, isOriginal: true, type: 'series' },
];

const ADMIN_ADS = [
  { id: 1, title: "Summer Sale", status: "Active", views: "1.2M", clicks: "45K", image: "https://picsum.photos/seed/ad1/800/400" },
  { id: 2, title: "New Series Launch", status: "Scheduled", views: "0", clicks: "0", image: "https://picsum.photos/seed/ad2/800/400" },
];

const CATEGORIES = ['Drama', 'Fantasy', 'Comedy', 'Action', 'Slice of life', 'Romance', 'Superhero', 'Sci-fi'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Completed'];
const EMOTIONS = ['Sweet', 'Bitter', 'Raw', 'Explosive'];
const STORY_STYLE_DEFAULTS = {
  coverImage: '',
  backgroundImage: '',
  backgroundOverlayColor: '#000000',
  backgroundOverlayOpacity: 40,
  textColor: 'dark' as 'light' | 'dark',
  layoutStyle: 'classic' as 'classic' | 'immersive',
  fontStyle: 'serif' as 'serif' | 'sans',
};
const DEFAULT_CREATOR_SUPPORT_HEADLINE = 'Support my next drop';
const DEFAULT_CREATOR_DROP_TITLE = 'Behind the scenes drop';
const DEFAULT_CREATOR_DROP_DESCRIPTION = 'Share previews, bonus pages, sketches, or a premium note for your biggest fans.';

const ALL_STORIES: Story[] = [...COMICS];
const PILL_BUTTON_BASE = "rounded-full px-4 py-1.5 text-xs font-bold whitespace-nowrap transition-all md:px-6 md:py-2 md:text-sm";
const HOME_SECTION_HEADING_CLASS = "text-[1.25rem] font-bold leading-tight sm:text-[1.5rem]";
const HOME_VIEW_ALL_CLASS = "flex items-center gap-1 text-[0.82rem] font-medium text-muted-foreground transition-colors hover:text-foreground sm:text-sm";

const VIEW_PATHS: Record<string, string> = {
  home: '/',
  manga: '/manga',
  novels: '/novels',
  my: '/my',
  search: '/search',
  profile: '/profile',
  'edit-profile': '/profile/edit',
  'email-preferences': '/profile/email-preferences',
  'privacy-settings': '/profile/privacy',
  admin: '/admin',
  'ads-manager': '/ads-manager',
  'create-campaign': '/create-campaign',
  premium: '/premium',
  wallet: '/wallet',
  publish: '/publish',
  'publish-dashboard': '/publish/dashboard',
  'publish-new': '/publish/new',
  'publish-episode': '/publish/episode',
  'edit-series': '/publish/edit-series',
};

const VIEW_ALL_SECTIONS = ['trending', 'popular', 'daily', 'originals', 'new-releases'] as const;

function findStoryById(storyId?: string | null, stories: Story[] = ALL_STORIES) {
  if (!storyId) return null;

  return stories.find((story) => String(story.id) === storyId) || null;
}

function getRouteState(pathname: string, stories: Story[] = ALL_STORIES) {
  const view = Object.entries(VIEW_PATHS).find(([, path]) => path === pathname)?.[0];
  if (view) return { view };

  if (pathname === '/login') {
    return { view: 'auth', authMode: 'login' as const };
  }

  if (pathname === '/signup') {
    return { view: 'auth', authMode: 'signup' as const };
  }

  const seriesMatch = pathname.match(/^\/series\/([^/]+)\/?$/);
  if (seriesMatch) {
    const story = findStoryById(seriesMatch[1], stories);
    return story ? { view: 'series-details', story } : null;
  }

  const creatorMatch = pathname.match(/^\/creator\/([^/]+)\/?$/);
  if (creatorMatch) {
    const story = findStoryById(creatorMatch[1], stories);
    return story ? { view: 'creator-profile', story } : null;
  }

  const readerMatch = pathname.match(/^\/reader\/([^/]+)\/?$/);
  if (readerMatch) {
    const story = findStoryById(readerMatch[1], stories);
    return story ? { view: 'reader', story } : null;
  }

  const viewAllMatch = pathname.match(/^\/view-all\/([^/]+)\/?$/);
  if (viewAllMatch && VIEW_ALL_SECTIONS.includes(viewAllMatch[1] as any)) {
    return { view: 'view-all', section: viewAllMatch[1] };
  }

  return null;
}

function getPathForView(
  view: string,
  selectedComic: Story | null,
  viewAllSection: string,
  authMode: 'login' | 'signup',
) {
  if (view in VIEW_PATHS) {
    return VIEW_PATHS[view];
  }

  if (view === 'auth') {
    return authMode === 'signup' ? '/signup' : '/login';
  }

  if (view === 'series-details' && selectedComic) {
    return `/series/${selectedComic.id}`;
  }

  if (view === 'creator-profile' && selectedComic) {
    return `/creator/${selectedComic.id}`;
  }

  if (view === 'reader' && selectedComic) {
    return `/reader/${selectedComic.id}`;
  }

  if (view === 'view-all' && viewAllSection) {
    return `/view-all/${viewAllSection}`;
  }

  return null;
}

const HomeSkeleton = () => (
  <div className="flex flex-col gap-16 pb-24 dark bg-zinc-950 min-h-screen">
    {/* Hero Skeleton */}
    <section className="relative w-full h-[80vh] min-h-[600px] flex items-end justify-center overflow-hidden bg-zinc-900/50">
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-10 pb-12 md:pb-24 flex flex-col items-start pt-32 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-zinc-700 font-black tracking-widest uppercase text-2xl opacity-50">Loading Stories...</p>
        </div>
        <Skeleton className="h-6 w-32 mb-4 bg-zinc-800/50" />
        <Skeleton className="h-20 w-3/4 mb-4 bg-zinc-800/50" />
        <Skeleton className="h-6 w-1/2 mb-8 bg-zinc-800/50" />
        <div className="flex gap-3">
          <Skeleton className="h-14 w-40 rounded-[16px] bg-zinc-800/50" />
          <Skeleton className="h-14 w-40 rounded-[16px] bg-zinc-800/50" />
        </div>
      </div>
    </section>

    <div className="max-w-7xl mx-auto w-full px-6 lg:px-10 flex flex-col gap-20">
      <section>
        <Skeleton className="h-8 w-48 mb-6 bg-zinc-800/50" />
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-10 w-24 rounded-full shrink-0 bg-zinc-800/50" />)}
        </div>
      </section>

      <section>
        <Skeleton className="h-10 w-64 mb-8 bg-zinc-800/50" />
        <div className="flex gap-6 overflow-hidden">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="min-w-[280px] w-[280px] ml-10">
              <Skeleton className="aspect-[4/5] rounded-[16px] bg-zinc-800/50" />
            </div>
          ))}
        </div>
      </section>
    </div>
  </div>
);

export default function App() {
  const { user, logout, userProfile, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const initialRouteState = React.useMemo(() => getRouteState(location.pathname, ALL_STORIES), [location.pathname]);
  const locationSyncRef = React.useRef(false);
  const [currentView, setCurrentView] = useState(() => initialRouteState?.view ?? 'home');
  const [activeCategory, setActiveCategory] = useState('Drama');
  const [activeDay, setActiveDay] = useState('Sun');
  const [searchQuery, setSearchQuery] = useState('');
  const isLoggedIn = !!user;
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(() =>
    initialRouteState && 'authMode' in initialRouteState && initialRouteState.authMode
      ? initialRouteState.authMode
      : 'login'
  );
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [creatorType, setCreatorType] = useState<'original' | 'self' | null>(null);
  const [dashboardTab, setDashboardTab] = useState<'series' | 'monetization' | 'stats'>('series');
  const [selectedComic, setSelectedComic] = useState<Story | null>(() =>
    initialRouteState && 'story' in initialRouteState ? initialRouteState.story : null
  );
  const [viewAllSection, setViewAllSection] = useState<(typeof VIEW_ALL_SECTIONS)[number]>(() =>
    initialRouteState && 'section' in initialRouteState && initialRouteState.section
      ? (initialRouteState.section as (typeof VIEW_ALL_SECTIONS)[number])
      : 'popular'
  );
  const [showAd, setShowAd] = useState(false);
  const [adTimeLeft, setAdTimeLeft] = useState(5);

  // Profile States
  const [userName, setUserName] = useState('Lemonade Reader');
  const [userBio, setUserBio] = useState('');
  const [userProfilePic, setUserProfilePic] = useState<string | null>(null);
  const [dropSomethingLink, setDropSomethingLink] = useState('');
  const [creatorSupportHeadline, setCreatorSupportHeadline] = useState(DEFAULT_CREATOR_SUPPORT_HEADLINE);
  const [creatorDropTitle, setCreatorDropTitle] = useState(DEFAULT_CREATOR_DROP_TITLE);
  const [creatorDropDescription, setCreatorDropDescription] = useState(DEFAULT_CREATOR_DROP_DESCRIPTION);
  const [creatorDropVisibility, setCreatorDropVisibility] = useState<CreatorDropVisibility>('public');
  const [isPremium, setIsPremium] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [publishGenres, setPublishGenres] = useState<string[]>([]);
  const [profilePronouns, setProfilePronouns] = useState('');
  const [profileBirthday, setProfileBirthday] = useState('');
  const [marketingEmailsEnabled, setMarketingEmailsEnabled] = useState(false);
  const [likedComics, setLikedComics] = useState<Set<StoryId>>(new Set());
  const [likedEpisodes, setLikedEpisodes] = useState<Set<string>>(new Set());
  const [isReaderMenuOpen, setIsReaderMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState('');
  const [profileSaveMessage, setProfileSaveMessage] = useState('');
  const [isUploadingProfilePic, setIsUploadingProfilePic] = useState(false);
  const profileImageInputRef = React.useRef<HTMLInputElement>(null);

  // Admin States
  const [adminTab, setAdminTab] = useState<'dashboard' | 'users' | 'moderation' | 'ads'>('dashboard');
  const [activeLemonCategory, setActiveLemonCategory] = useState('Drama');
  const [previousView, setPreviousView] = useState('home');
  const [comments, setComments] = useState<Record<string, StoryComment[]>>({
    1: [
      { id: 1, user: "LemonLover", text: "This is amazing!", likes: 12, date: "2h ago" },
      { id: 2, user: "CitrusFan", text: "Can't wait for the next chapter!", likes: 5, date: "5h ago" }
    ]
  });
  const [newComment, setNewComment] = useState('');
  const [adminUserSearch, setAdminUserSearch] = useState('');
  const [editableStoryKey, setEditableStoryKey] = useState(String(COMICS[0].id));
  const [storyCoverImage, setStoryCoverImage] = useState('');
  const [storyBackgroundImage, setStoryBackgroundImage] = useState('');
  const [storyOverlayColor, setStoryOverlayColor] = useState('#000000');
  const [storyOverlayOpacity, setStoryOverlayOpacity] = useState(40);
  const [storyTextColor, setStoryTextColor] = useState<'light' | 'dark'>('dark');
  const [storyLayoutStyle, setStoryLayoutStyle] = useState<'classic' | 'immersive'>('classic');
  const [storyFontStyle, setStoryFontStyle] = useState<'serif' | 'sans'>('serif');
  const [isSavingStoryStyle, setIsSavingStoryStyle] = useState(false);
  const [storyStyleMessage, setStoryStyleMessage] = useState('');
  const convexAdminUsers = useQuery(api.users.getAllUsers, { limit: 100 });
  const adminDashboardStats = useQuery((api as any).series.getAdminDashboardStats, {});
  const adminCampaigns = useQuery(api.campaigns.getAllCampaigns, {});
  const selectedStoryStyle = useQuery(api.series.getStoryStyleByKey, selectedComic ? { storyKey: String(selectedComic.id) } : "skip");
  const editableStoryStyle = useQuery(api.series.getStoryStyleByKey, editableStoryKey ? { storyKey: editableStoryKey } : "skip");
  const upsertStoryStyle = useMutation(api.series.upsertStoryStyle);

  // Convex Data Queries
  const backendSeries = useQuery(api.series.getAllSeries, { limit: 100 });
  
  // Dynamic Content Derivation
  const allStories = React.useMemo<Story[]>(() => {
    if (!backendSeries || backendSeries.length === 0) return ALL_STORIES;
    return backendSeries.flatMap((s) => {
      if (s.type !== 'webtoon') return [];

      const baseStory = {
        id: s._id,
        title: s.title,
        creator: s.creatorName,
        genre: s.genre,
        cover: s.coverImageUrl || "https://picsum.photos/seed/default/400/533",
        views: String(s.views ?? 0),
        likes: String(s.likes ?? 0),
        summary: s.summary || undefined,
      };

      return [{
        ...baseStory,
        type: 'series' as const,
        emotion: s.emotion || undefined,
        rankChange: Math.floor(Math.random() * 40),
        day: s.releaseDay || 'Sun',
        isNew: Boolean(s.isNew),
        isOriginal: Boolean(s.isOriginal),
      }];
    });
  }, [backendSeries]);

  const displayComics = React.useMemo(() => allStories.filter(isComicStory), [allStories]);
  const novelStories = React.useMemo(() => {
    const nonOriginals = displayComics.filter((comic) => !comic.isOriginal);
    return nonOriginals.length > 0 ? nonOriginals : displayComics;
  }, [displayComics]);
  const featuredNovel = novelStories[0] || displayComics[0] || COMICS[0];
  const publicBirthdayLabel = React.useMemo(() => {
    if (!profileBirthday) return '';

    const [year, month, day] = profileBirthday.split('-');
    if (!month || !day) return '';

    const parsedDate = new Date(`${year || '2000'}-${month}-${day}T00:00:00`);
    if (Number.isNaN(parsedDate.getTime())) {
      return `${month}/${day}`;
    }

    return parsedDate.toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
    });
  }, [profileBirthday]);

  useEffect(() => {
    const routeState = getRouteState(location.pathname, allStories);
    const isPendingDynamicSeriesRoute =
      /^\/(series|creator|reader)\/[^/]+\/?$/.test(location.pathname) && backendSeries === undefined;

    if (!routeState) {
      if (isPendingDynamicSeriesRoute) {
        return;
      }

      if (location.pathname !== '/') {
        navigate('/', { replace: true });
      }
      locationSyncRef.current = true;
      setCurrentView('home');
      return;
    }

    locationSyncRef.current = true;

    if ('story' in routeState && routeState.story) {
      setSelectedComic((prev) => (prev?.id === routeState.story.id ? prev : routeState.story));
    }

    if ('authMode' in routeState && routeState.authMode) {
      setAuthMode((prev) => (prev === routeState.authMode ? prev : routeState.authMode));
    }

    if ('section' in routeState && routeState.section) {
      setViewAllSection((prev) => (prev === routeState.section ? prev : (routeState.section as (typeof VIEW_ALL_SECTIONS)[number])));
    }

    setCurrentView((prev) => (prev === routeState.view ? prev : routeState.view));
  }, [location.pathname, navigate, allStories, backendSeries]);

  useEffect(() => {
    if (locationSyncRef.current) {
      locationSyncRef.current = false;
      return;
    }

    const nextPath = getPathForView(currentView, selectedComic, viewAllSection, authMode);

    if (!nextPath || nextPath === location.pathname) return;

    navigate(nextPath);
  }, [currentView, selectedComic?.id, viewAllSection, authMode, location.pathname, navigate]);

  useEffect(() => {
    if (!user && !userProfile) return;

    setUserName(userProfile?.displayName || user?.displayName || 'Lemonade Reader');
    setUserBio(userProfile?.bio || '');
    setUserProfilePic(userProfile?.photoURL || user?.photoURL || null);
    setDropSomethingLink(userProfile?.dropSomethingLink || '');
    setCreatorSupportHeadline(userProfile?.creatorSupportHeadline || DEFAULT_CREATOR_SUPPORT_HEADLINE);
    setCreatorDropTitle(userProfile?.creatorDropTitle || DEFAULT_CREATOR_DROP_TITLE);
    setCreatorDropDescription(userProfile?.creatorDropDescription || DEFAULT_CREATOR_DROP_DESCRIPTION);
    setCreatorDropVisibility(userProfile?.creatorDropVisibility === 'premium' ? 'premium' : 'public');
    setSelectedGenres(userProfile?.genres || []);
    setProfilePronouns(userProfile?.pronouns || '');
    setMarketingEmailsEnabled(Boolean(userProfile?.marketingEmails));
    setProfileBirthday(
      userProfile?.birthYear && userProfile?.birthMonth && userProfile?.birthDay
        ? `${String(userProfile.birthYear).padStart(4, '0')}-${String(userProfile.birthMonth).padStart(2, '0')}-${String(userProfile.birthDay).padStart(2, '0')}`
        : ''
    );
    setIsPremium(Boolean(userProfile?.isPremium));
  }, [user, userProfile]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const scope = user?.uid || 'guest';

    try {
      const fanSocialRaw = window.localStorage.getItem(`lemonade:fan-social:${scope}`);
      if (fanSocialRaw) {
        const fanSocial = JSON.parse(fanSocialRaw);
        setLikedComics(new Set(fanSocial.likedComics || []));
        setLikedEpisodes(new Set(fanSocial.likedEpisodes || []));
      } else {
        setLikedComics(new Set());
        setLikedEpisodes(new Set());
      }
    } catch (error) {
      console.error('Could not load fan activity:', error);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const scope = user?.uid || 'guest';

    try {
      window.localStorage.setItem(
        `lemonade:fan-social:${scope}`,
        JSON.stringify({
          likedComics: Array.from(likedComics),
          likedEpisodes: Array.from(likedEpisodes),
        })
      );
    } catch (error) {
      console.error('Could not save fan activity:', error);
    }
  }, [user?.uid, likedComics, likedEpisodes]);

  const toggleLike = (comicId: StoryId) => {
    setLikedComics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(comicId)) {
        newSet.delete(comicId);
      } else {
        newSet.add(comicId);
      }
      return newSet;
    });
  };

  const toggleEpisodeLike = (storyId: StoryId, episodeNumber: number) => {
    const episodeKey = `${String(storyId)}-${episodeNumber}`;

    setLikedEpisodes((prev) => {
      const next = new Set(prev);
      if (next.has(episodeKey)) {
        next.delete(episodeKey);
      } else {
        next.add(episodeKey);
      }
      return next;
    });
  };

  const startReading = (comic: Story | null) => {
    if (!comic) return;
    setSelectedComic(comic);
    setPreviousView(currentView);
    setCurrentView('reader');
    
    if (!isPremium) {
      setShowAd(true);
      setAdTimeLeft(5);
      const timer = setInterval(() => {
        setAdTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const openSeriesDetails = (comic: Story | null) => {
    if (!comic) return;
    setSelectedComic(comic);
    setPreviousView(currentView);
    setCurrentView('series-details');
  };

  const openSupportLink = (url?: string) => {
    const normalizedUrl = normalizeExternalUrl(url || '');
    if (!normalizedUrl) return;

    if (typeof window !== 'undefined') {
      window.open(normalizedUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const ensureSignedInForEngagement = () => {
    if (user) return true;
    openSignupModal();
    return false;
  };

  const toggleCreatorFollow = async (creatorName: string) => {
    if (!ensureSignedInForEngagement()) return;
    await toggleCreatorFollowMutation({
      creatorDisplayName: creatorName,
      viewerFirebaseUid: user!.uid,
    });
  };

  const toggleCreatorLike = async (creatorName: string) => {
    if (!ensureSignedInForEngagement()) return;
    await toggleCreatorLikeMutation({
      creatorDisplayName: creatorName,
      viewerFirebaseUid: user!.uid,
    });
  };

  const toggleCreatorDropLike = async (creatorName: string, dropId: string) => {
    if (!ensureSignedInForEngagement()) return;
    await toggleCreatorDropLikeMutation({
      creatorDisplayName: creatorName,
      viewerFirebaseUid: user!.uid,
      dropId,
    });
  };

  const skipAd = () => {
    setShowAd(false);
    setCurrentView('reader');
  };

  const filteredComics = displayComics.filter(comic => 
    comic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    comic.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredStories = allStories.filter((story) =>
    story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    story.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    story.creator.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const editableStories = allStories;
  const editableStory = editableStories.find((story) => String(story.id) === editableStoryKey) || (displayComics[0] || COMICS[0]);
  const selectedCreatorName = selectedComic?.creator || '';
  const selectedCreatorMomentIds = selectedCreatorName
    ? [
        `${selectedCreatorName}-featured-drop`,
        ...allStories
          .filter((story) => story.creator === selectedCreatorName)
          .slice(0, 3)
          .map((story, index) => `${selectedCreatorName}-${String(story.id)}-${index}`),
      ]
    : [];
  const creatorPublicProfile = useQuery(
    api.users.getPublicCreatorProfileByDisplayName,
    selectedCreatorName ? { displayName: selectedCreatorName } : "skip"
  );
  const creatorEngagement = useQuery(
    (api as any).fanEngagement.getCreatorEngagement,
    selectedCreatorName
      ? {
          creatorDisplayName: selectedCreatorName,
          viewerFirebaseUid: user?.uid || undefined,
          dropIds: selectedCreatorMomentIds,
        }
      : "skip"
  );
  const toggleCreatorFollowMutation = useMutation((api as any).fanEngagement.toggleCreatorFollow);
  const toggleCreatorLikeMutation = useMutation((api as any).fanEngagement.toggleCreatorLike);
  const toggleCreatorDropLikeMutation = useMutation((api as any).fanEngagement.toggleCreatorDropLike);
  const filteredAdminUsers = (convexAdminUsers || []).filter((adminUser) => {
    const query = adminUserSearch.trim().toLowerCase();
    if (!query) return true;

    return (
      adminUser.displayName?.toLowerCase().includes(query) ||
      adminUser.email?.toLowerCase().includes(query) ||
      adminUser.firebaseUid.toLowerCase().includes(query)
    );
  });
  const creatorProfiles = React.useMemo(() => {
    const groupedStories = allStories.reduce<Record<string, Story[]>>((acc, story) => {
      acc[story.creator] = [...(acc[story.creator] || []), story];
      return acc;
    }, {});

    return Object.fromEntries(
      Object.entries(groupedStories).map(([creator, stories]) => {
        const totalViews = stories.reduce((sum, story) => sum + parseCompactMetric(story.views), 0);
        const totalLikes = stories.reduce((sum, story) => sum + parseCompactMetric(story.likes), 0);
        const publicMoments: CreatorMoment[] = stories.slice(0, 3).map((story, index) => ({
          id: `${creator}-${String(story.id)}-${index}`,
          title: story.title,
          description:
            story.summary ||
            `New panels, creator notes, and a clean public drop from ${story.creator}.`,
          label: 'Public update',
          visibility: 'public',
          accent: index % 2 === 0 ? 'from-primary/30 via-primary/10 to-transparent' : 'from-amber-500/30 via-amber-400/10 to-transparent',
        }));

        return [
          creator,
          {
            tagline: 'Premium creator on Lemonade',
            intro:
              stories[0]?.summary ||
              `${creator} shares polished updates, early looks, and public moments for fans who want to stay close to the work.`,
            supportLabel: 'Support the next drop',
            supportUrl: '',
            totalViews,
            totalLikes,
            publicMoments,
          },
        ];
      })
    );
  }, [allStories]);

  const pageContainerClass = "mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-10";
  const readerStoryStyle = {
    ...STORY_STYLE_DEFAULTS,
    ...(selectedStoryStyle || {}),
  };
  const readerTextClasses = readerStoryStyle.textColor === 'light'
    ? 'text-white'
    : 'text-zinc-950';
  const readerMutedTextClasses = readerStoryStyle.textColor === 'light'
    ? 'text-white/75'
    : 'text-zinc-500';
  const readerCardClasses = readerStoryStyle.layoutStyle === 'immersive'
    ? 'border border-white/15 bg-white/10 backdrop-blur-sm'
    : 'border border-zinc-200 bg-white shadow-sm';
  const readerFontClass = readerStoryStyle.fontStyle === 'serif' ? 'font-serif' : 'font-sans';
  const viewAllConfig = {
    trending: {
      title: 'Trending & popular series',
      eyebrow: 'Reader momentum',
      description: 'The stories readers are opening first right now, ranked by current attention.',
      items: displayComics.slice(0, 12),
    },
    popular: {
      title: `${activeCategory} stories`,
      eyebrow: 'Popular on Lemonade',
      description: `Everything readers are opening in ${activeCategory.toLowerCase()} right now.`,
      items: displayComics.filter((comic) => comic.genre === activeCategory || activeCategory === 'Drama'),
    },
    daily: {
      title: `${activeDay} drops`,
      eyebrow: 'Weekly release board',
      description: `Every title dropping on ${activeDay}.`,
      items: displayComics.filter((comic) => comic.day === activeDay || activeDay === 'Sun'),
    },
    originals: {
      title: 'Lemonade Originals',
      eyebrow: 'Exclusive lineup',
      description: 'The complete originals shelf, from breakout action to weekend drama.',
      items: displayComics.filter((comic) => comic.isOriginal),
    },
    'new-releases': {
      title: 'Newly released originals',
      eyebrow: 'Fresh this week',
      description: 'Recent launches and newly updated originals worth jumping into first.',
      items: displayComics.filter((comic) => comic.isNew),
    },
  } as const;

  useEffect(() => {
    if (!selectedComic) return;
    setEditableStoryKey(String(selectedComic.id));
  }, [selectedComic]);

  useEffect(() => {
    const style = editableStoryStyle
      ? {
          ...STORY_STYLE_DEFAULTS,
          ...editableStoryStyle,
        }
      : {
          ...STORY_STYLE_DEFAULTS,
          coverImage: editableStory?.cover || '',
        };

    setStoryCoverImage(style.coverImage || editableStory?.cover || '');
    setStoryBackgroundImage(style.backgroundImage || '');
    setStoryOverlayColor(style.backgroundOverlayColor || '#000000');
    setStoryOverlayOpacity(style.backgroundOverlayOpacity ?? 40);
    setStoryTextColor(style.textColor || 'dark');
    setStoryLayoutStyle(style.layoutStyle || 'classic');
    setStoryFontStyle(style.fontStyle || 'serif');
    setStoryStyleMessage('');
  }, [editableStory?.cover, editableStoryStyle, editableStoryKey]);

  const openSignupModal = () => {
    setAuthMode('signup');
    setIsAuthModalOpen(true);
  };

  const openViewAll = (section: (typeof VIEW_ALL_SECTIONS)[number]) => {
    setViewAllSection(section);
    setCurrentView('view-all');
  };

  const handleProfileClick = () => {
    if (isLoggedIn) {
      setCurrentView('profile');
    } else {
      openSignupModal();
    }
  };

  const handleMyClick = () => {
    if (isLoggedIn) {
      setCurrentView('my');
    } else {
      openSignupModal();
    }
  };

  const handlePublishClick = () => {
    if (isLoggedIn) {
      if (creatorType) {
        setCurrentView('publish-dashboard');
      } else {
        setCurrentView('publish');
      }
    } else {
      openSignupModal();
    }
  };

  const handleMobileNavSelect = (view: string) => {
    setIsMobileNavOpen(false);
    setCurrentView(view);
  };

  const handleProfileImageSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setProfileSaveError('');
    setProfileSaveMessage('');
    setIsUploadingProfilePic(true);

    try {
      const photoURL = await uploadProfilePhoto(user, file);
      await updateUserProfile({ photoURL });
      setUserProfilePic(photoURL);
      setProfileSaveMessage('Profile picture uploaded and saved.');
    } catch (error) {
      console.error('Profile photo upload failed:', error);
      setProfileSaveError(error instanceof Error ? error.message : 'Profile photo upload failed. Please try again.');
    } finally {
      setIsUploadingProfilePic(false);
      event.target.value = '';
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openSignupModal();
      return;
    }

    setProfileSaveError('');
    setProfileSaveMessage('');
    setIsSavingProfile(true);

    try {
      const cleanName = userName.trim() || 'Lemonade Reader';
      const cleanBio = userBio.trim();
      const cleanDropSomethingLink = normalizeExternalUrl(dropSomethingLink);
      const cleanPronouns = profilePronouns.trim();
      const [birthYearRaw, birthMonthRaw, birthDayRaw] = profileBirthday ? profileBirthday.split('-') : [];
      const birthYear = birthYearRaw ? Number(birthYearRaw) : undefined;
      const birthMonth = birthMonthRaw || undefined;
      const birthDay = birthDayRaw ? Number(birthDayRaw) : undefined;

      await updateFirebaseProfile(auth.currentUser ?? user, {
        displayName: cleanName,
        photoURL: userProfilePic || undefined,
      });

      await updateUserProfile({
        displayName: cleanName,
        bio: cleanBio || undefined,
        photoURL: userProfilePic || undefined,
        genres: selectedGenres,
        dropSomethingLink: cleanDropSomethingLink || undefined,
        creatorSupportHeadline: creatorSupportHeadline.trim() || undefined,
        creatorDropTitle: creatorDropTitle.trim() || undefined,
        creatorDropDescription: creatorDropDescription.trim() || undefined,
        creatorDropVisibility,
        birthYear,
        birthMonth,
        birthDay,
        pronouns: cleanPronouns || undefined,
        marketingEmails: marketingEmailsEnabled,
        onboardingCompleted: true,
      });

      setProfileSaveMessage('Profile updated successfully.');
      setCurrentView('profile');
    } catch (error) {
      console.error('Failed to save profile:', error);
      setProfileSaveError('Could not save your profile right now. Please try again.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveStoryStyle = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setIsSavingStoryStyle(true);
      setStoryStyleMessage('');
      await upsertStoryStyle({
        storyKey: editableStoryKey,
        coverImage: storyCoverImage.trim() || undefined,
        backgroundImage: storyBackgroundImage.trim() || undefined,
        backgroundOverlayColor: storyOverlayColor,
        backgroundOverlayOpacity: storyOverlayOpacity,
        textColor: storyTextColor,
        layoutStyle: storyLayoutStyle,
        fontStyle: storyFontStyle,
      });
      setStoryStyleMessage('Story style saved. Reader updates should appear immediately.');
    } catch (error) {
      console.error('Failed to save story style:', error);
      setStoryStyleMessage('Could not save story style right now.');
    } finally {
      setIsSavingStoryStyle(false);
    }
  };

  const renderHome = () => {
    if (backendSeries === undefined) return <HomeSkeleton />;

    const featuredStory = displayComics[0] || COMICS[0];

    return (
      <div className="flex flex-col gap-16 pb-24 dark">
        {/* Large Featured Hero Section */}
        <section className="relative w-full h-[80vh] min-h-[600px] flex items-end justify-center overflow-hidden group">
          <img 
            src={featuredStory.cover} 
            alt={featuredStory.title} 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-10 pb-12 md:pb-24 flex flex-col items-start pt-32">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4 flex-wrap">
              <Badge className="bg-primary text-primary-foreground uppercase tracking-widest text-[10px] md:text-xs font-black px-3 md:px-3 py-1 shadow-lg shadow-primary/20 rounded-md">Featured</Badge>
              <Badge variant="outline" className="text-white border-white/20 uppercase tracking-widest text-[10px] md:text-xs font-black px-3 md:px-3 py-1 backdrop-blur-sm rounded-md">{featuredStory.genre}</Badge>
            </div>
            <h1 className="text-white text-[2.8rem] md:text-7xl font-black mb-4 md:mb-4 leading-[1] tracking-tighter drop-shadow-lg max-w-3xl">
              {featuredStory.title}
            </h1>
            <p className="text-white/84 text-base md:text-xl max-w-2xl mb-8 md:mb-8 leading-relaxed font-medium drop-shadow-md line-clamp-3">
              {featuredStory.summary || "A gripping new series featuring powerful themes and unforgettable characters. Start your journey into this world today."}
            </p>
            <div className="flex flex-row items-center gap-3 w-full sm:w-auto mt-2">
              <button 
                className="flex-1 sm:flex-none h-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-[16px] px-3 md:px-8 py-5 md:py-6 text-sm md:text-lg font-black shadow-[0_4px_20px_rgba(30,215,96,0.3)] transition-all hover:-translate-y-1 flex items-center justify-center gap-2" 
                onClick={() => openSeriesDetails(featuredStory)}
              >
                <Play className="w-5 h-5 md:w-5 md:h-5 mr-1.5 md:mr-2" fill="currentColor" /> Read Now
              </button>
              <Button variant="outline" className="flex-1 sm:flex-none h-auto border-white/20 bg-black/40 text-white hover:bg-white hover:text-black rounded-[16px] px-3 md:px-8 py-5 md:py-6 text-sm md:text-lg font-black backdrop-blur-md transition-all hover:-translate-y-1">
                <Plus className="w-5 h-5 md:w-5 md:h-5 mr-1.5 md:mr-2" /> Add to Library
              </Button>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto w-full px-6 lg:px-10 flex flex-col gap-20">
          {/* Popular Categories */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black tracking-tighter text-white">Popular Categories</h2>
            </div>
            <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
              {['All', ...CATEGORIES].map((cat, i) => {
                const isActive = activeCategory === (cat === 'All' ? 'Drama' : cat) && (cat === 'All' ? activeCategory === 'Drama' : true);
                return (
                  <button 
                    key={cat} 
                    onClick={() => setActiveCategory(cat === 'All' ? 'Drama' : cat)}
                    className={`px-6 py-2.5 rounded-full text-sm font-black tracking-wide whitespace-nowrap transition-all duration-300 ${isActive ? 'bg-primary text-black shadow-[0_4px_14px_rgba(30,215,96,0.39)] scale-105' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Trending (Horizontal Scroll with Ranking Numbers - Medium Cards) */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black tracking-tighter text-white">
                Trending Now
              </h2>
              <button className="text-xs font-black text-zinc-400 hover:text-primary transition-colors flex items-center gap-1 uppercase tracking-widest" onClick={() => openViewAll('trending')}>View All <ChevronRight className="w-4 h-4" /></button>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-8 pt-4 no-scrollbar snap-x relative mask-image-fade-right">
              {displayComics.slice(0, 10).map((comic, i) => (
                <div key={comic.id} className="min-w-[280px] w-[280px] snap-start relative group cursor-pointer" onClick={() => openSeriesDetails(comic)}>
                  <div 
                    className="absolute -left-3 top-6 z-20 text-[100px] font-black leading-none drop-shadow-2xl transition-transform duration-300 group-hover:scale-110 group-hover:text-primary"
                    style={{ WebkitTextStroke: '2px rgba(255,255,255,0.8)', color: 'transparent', transform: 'translateY(-20px)' }}
                  >
                    {i + 1}
                  </div>
                  <div className="relative aspect-[4/5] rounded-[16px] overflow-hidden bg-zinc-900 shadow-xl transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] ml-10">
                    <img src={comic.cover} alt={comic.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-primary/20 text-primary border-none text-[10px] uppercase font-black tracking-wider px-2 backdrop-blur-md">{comic.genre}</Badge>
                        <span className="text-zinc-300 flex items-center text-[10px] font-bold"><Eye className="w-3 h-3 mr-1" /> {comic.views}</span>
                      </div>
                      <h3 className="text-white font-black text-xl leading-tight line-clamp-2">{comic.title}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* New Releases (Grid - Small Cards) */}
          <section>
             <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black tracking-tighter text-white">New Releases</h2>
              <button className="text-xs font-black text-zinc-400 hover:text-primary transition-colors flex items-center gap-1 uppercase tracking-widest" onClick={() => openViewAll('new-releases')}>View All <ChevronRight className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {displayComics.filter(c => c.isNew).slice(0, 6).map(comic => (
                <div key={comic.id} className="flex flex-col group cursor-pointer" onClick={() => openSeriesDetails(comic)}>
                  <div className="relative aspect-[3/4] rounded-[14px] overflow-hidden mb-3 bg-zinc-900 border border-white/5 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-[0_12px_30px_rgba(30,215,96,0.15)] group-hover:border-primary/30">
                    <img src={comic.cover} alt={comic.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" />
                    <div className="absolute top-2 left-2 bg-primary text-black text-[9px] uppercase font-black px-2 py-1 rounded shadow-sm">New</div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                      <div className="bg-primary/90 rounded-full p-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <Play className="w-6 h-6 text-black ml-1" fill="currentColor" />
                      </div>
                    </div>
                  </div>
                  <h3 className="font-black text-sm text-white tracking-tight leading-tight group-hover:text-primary transition-colors line-clamp-2">{comic.title}</h3>
                  <p className="text-zinc-500 text-xs mt-1 font-bold tracking-wide uppercase">{comic.genre}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Recommended / For You (Large Cards) */}
          <section>
             <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black tracking-tighter text-white">Recommended For You</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayComics
                .filter(c => !displayComics.slice(0, 10).find(tc => tc.id === c.id)) // Exclude top trending
                .filter(c => selectedGenres.length === 0 || selectedGenres.includes(c.genre)) // Match user genres
                .slice(0, 4)
                .map(comic => (
                <div key={comic.id} className="flex h-[220px] bg-zinc-900/50 border border-white/5 rounded-[20px] overflow-hidden group cursor-pointer hover:bg-zinc-900 hover:border-primary/20 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]" onClick={() => openSeriesDetails(comic)}>
                  <div className="w-2/5 h-full relative overflow-hidden">
                    <img src={comic.cover} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-zinc-900/50 group-hover:to-zinc-900 transition-colors duration-500" />
                  </div>
                  <div className="w-3/5 p-6 md:p-8 flex flex-col justify-center relative">
                    <Badge className="w-fit bg-white/5 text-zinc-300 border-none text-[10px] uppercase font-black tracking-wider px-2 mb-3 group-hover:bg-primary/10 group-hover:text-primary transition-colors">{comic.genre}</Badge>
                    <h3 className="text-2xl font-black text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors">{comic.title}</h3>
                    <p className="text-sm text-zinc-400 line-clamp-2 mb-5 leading-relaxed font-medium">
                      {comic.summary || `${comic.creator} brings an explosive new story to the platform. Don't miss this masterpiece.`}
                    </p>
                    <div className="flex items-center gap-4 text-xs font-black text-zinc-500 mt-auto">
                      <span className="flex items-center gap-1 group-hover:text-white transition-colors"><Heart className="w-4 h-4 text-primary" fill="currentColor" /> {comic.likes}</span>
                      <span className="flex items-center gap-1 group-hover:text-white transition-colors"><Eye className="w-4 h-4" /> {comic.views}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  };

  const renderOriginals = () => (
    <div className="pb-20">
      <section className="relative mb-12 min-h-[calc(100svh-5rem)] w-full overflow-hidden">
        <img 
          src="https://picsum.photos/seed/lemonade-originals/1920/1080" 
          alt="Lemonade Originals" 
          className="absolute inset-0 h-full w-full object-cover saturate-[0.9]" 
          referrerPolicy="no-referrer" 
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,10,16,0.82)_0%,rgba(7,10,16,0.56)_36%,rgba(7,10,16,0.18)_68%,rgba(7,10,16,0.08)_100%)] md:bg-[linear-gradient(90deg,rgba(7,10,16,0.8)_0%,rgba(7,10,16,0.46)_42%,rgba(7,10,16,0.14)_72%,rgba(7,10,16,0.04)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(158,255,191,0.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_32%)]" />
        <div className="relative flex min-h-[calc(100svh-5rem)] items-end py-6 sm:py-8 md:items-center md:py-10">
          <div className={`${pageContainerClass} w-full`}>
            <div className="glass-surface max-w-[min(100%,44rem)] rounded-[28px] p-5 text-white sm:p-6 md:p-8 lg:p-10">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center rounded-full border border-white/18 bg-white/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white/84 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                  Lemonade Originals
                </span>
              </div>
              <h1 className="max-w-[13ch] text-[clamp(2.4rem,6.8vw,5.6rem)] font-black uppercase tracking-[-0.06em] leading-[0.92] text-white text-balance">
                Original stories built for Lemonade.
              </h1>
              <p className="mt-4 max-w-[34rem] text-[clamp(0.98rem,2vw,1.18rem)] font-medium leading-[1.6] tracking-[-0.01em] text-white/82 sm:mt-5">
                Exclusive afronimations with weekly Drops, stronger hooks, and a premium reading atmosphere shaped for the next wave of Lemonade African stories.
              </p>
              <div className="mt-7 flex flex-col items-start gap-3 sm:mt-8 sm:flex-row sm:items-center">
                <Button
                  size="lg"
                  className="group h-auto min-h-12 rounded-full border border-white/10 bg-white px-6 py-3 text-sm font-semibold text-zinc-950 shadow-[0_18px_45px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/92 hover:shadow-[0_24px_60px_rgba(0,0,0,0.28)]"
                  onClick={() => openViewAll('originals')}
                >
                  <Play className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  Browse Originals
                </Button>
                <p className="text-sm font-medium tracking-[-0.01em] text-white/62">
                  Weekly drops, standout launches, and fresh featured series.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className={pageContainerClass}>
        {/* Weekly Schedule Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-6 no-scrollbar mb-8 border-b border-border">
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`${PILL_BUTTON_BASE} ${activeDay === day ? 'bg-primary-dark text-primary-foreground' : 'bg-muted hover:bg-muted/80 text-muted-foreground'}`}
            >
              {day}
            </button>
          ))}
        </div>

        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl flex items-center gap-2">
              Manga / Manhwa
            </h2>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-2 gap-y-8">
            {displayComics.filter(c => c.isOriginal && (c.day === activeDay || activeDay === 'Sun')).map((comic) => (
              <div key={comic.id} className="flex flex-col cursor-pointer group" onClick={() => openSeriesDetails(comic)}>
                <div className="relative aspect-[3/4] rounded-md mb-2 overflow-hidden">
                  <img src={comic.cover} alt={comic.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" referrerPolicy="no-referrer" />
                  {comic.isNew && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
                      NEW
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground mb-0.5">{comic.genre}</p>
                <h3 className="font-bold text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors">{comic.title}</h3>
                <div className="flex items-center gap-1 mt-1">
                  <Heart className="w-3 h-3 text-primary fill-primary" />
                  <span className="text-[11px] font-bold text-primary">{comic.likes}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl flex items-center gap-2">
              All Manga / Manhwa
            </h2>
            <button type="button" onClick={() => openViewAll('originals')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              View all <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-2 gap-y-8">
            {displayComics.filter(c => c.isOriginal).map((comic) => (
              <div key={comic.id} className="flex flex-col cursor-pointer group" onClick={() => openSeriesDetails(comic)}>
                <div className="relative aspect-[3/4] rounded-md mb-2 overflow-hidden">
                  <img src={comic.cover} alt={comic.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" referrerPolicy="no-referrer" />
                </div>
                <h3 className="font-bold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">{comic.title}</h3>
                <p className="text-[11px] text-muted-foreground mt-1">{comic.genre}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderNovels = () => (
    <div className="pb-20">
      <section className="relative mb-12 min-h-[calc(100svh-5rem)] w-full overflow-hidden">
        <img
          src={featuredNovel?.cover || DUMMY_STORY.cover}
          alt={featuredNovel?.title || DUMMY_STORY.title}
          className="absolute inset-0 h-full w-full object-cover saturate-[0.85]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,11,18,0.92)_0%,rgba(9,11,18,0.72)_34%,rgba(9,11,18,0.28)_68%,rgba(9,11,18,0.16)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,214,102,0.24),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_30%)]" />
        <div className="relative flex min-h-[calc(100svh-5rem)] items-end py-6 sm:py-8 md:items-center md:py-10">
          <div className={`${pageContainerClass} w-full`}>
            <div className="glass-surface max-w-[min(100%,44rem)] rounded-[28px] p-5 text-white sm:p-6 md:p-8 lg:p-10">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center rounded-full border border-white/18 bg-white/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white/84 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                  Lemonade Novels
                </span>
                <span className="inline-flex items-center rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/70">
                  Structured like Originals
                </span>
              </div>
              <h1 className="max-w-[12ch] text-[clamp(2.4rem,6.8vw,5.4rem)] font-black uppercase tracking-[-0.06em] leading-[0.92] text-white text-balance">
                Browse the novel shelf before you read.
              </h1>
              <p className="mt-4 max-w-[34rem] text-[clamp(0.98rem,2vw,1.18rem)] font-medium leading-[1.6] tracking-[-0.01em] text-white/82 sm:mt-5">
                Pick a title, open its details page, then jump into the chapter reader. That keeps novels following the same product flow as Originals instead of dropping straight into content.
              </p>
              <div className="mt-7 flex flex-col items-start gap-3 sm:mt-8 sm:flex-row sm:items-center">
                <Button
                  size="lg"
                  className="group h-auto min-h-12 rounded-full border border-white/10 bg-white px-6 py-3 text-sm font-semibold text-zinc-950 shadow-[0_18px_45px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/92 hover:shadow-[0_24px_60px_rgba(0,0,0,0.28)]"
                  onClick={() => featuredNovel && openSeriesDetails(featuredNovel)}
                >
                  <Play className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  Open Featured Novel
                </Button>
                <p className="text-sm font-medium tracking-[-0.01em] text-white/62">
                  Tap a novel card to open details, then start reading from there.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className={pageContainerClass}>
        <div className="mb-10 flex items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-zinc-500">Novel Catalog</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">Featured Novels</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-zinc-400">
            Each novel now opens with the same browse to details to reader progression used elsewhere in Lemonade.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {novelStories.map((novel) => (
            <button
              key={novel.id}
              type="button"
              className="group text-left"
              onClick={() => openSeriesDetails(novel)}
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/8 bg-zinc-900 shadow-[0_20px_50px_rgba(0,0,0,0.28)] transition-all duration-300 group-hover:-translate-y-1.5 group-hover:border-primary/40 group-hover:shadow-[0_28px_64px_rgba(0,0,0,0.38)]">
                <img
                  src={novel.cover}
                  alt={novel.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white/80 backdrop-blur-md">
                  Novel
                </div>
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">{novel.genre}</p>
                  <h3 className="mt-2 text-base font-black leading-tight text-white transition-colors group-hover:text-primary">
                    {novel.title}
                  </h3>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-sm font-semibold text-zinc-200">{novel.creator}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500">{novel.views} reads</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMy = () => (
    <div className="px-4 py-8 max-w-7xl mx-auto w-full min-h-[60vh]">
      <div className="flex items-center justify-between border-b border-border pb-4 mb-8">
        <div className="flex gap-8 text-sm font-bold">
          <div className="pb-4 border-b-2 border-foreground text-foreground cursor-pointer">RECENT</div>
          <div className="pb-4 text-muted-foreground hover:text-foreground cursor-pointer">SUBSCRIPTIONS</div>
          <div className="pb-4 text-muted-foreground hover:text-foreground cursor-pointer">FOLLOWING</div>
          <div className="pb-4 text-muted-foreground hover:text-foreground cursor-pointer">COMMENTS</div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-2 gap-y-8">
        {displayComics.slice(0, 3).map((comic) => (
          <div key={comic.id} className="flex flex-col cursor-pointer group" onClick={() => openSeriesDetails(comic)}>
            <div className="relative aspect-[3/4] rounded-md mb-2 overflow-hidden">
              <img src={comic.cover} alt={comic.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-1 text-center">
                Read 2 days ago
              </div>
            </div>
            <h3 className="font-bold text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors">{comic.title}</h3>
            <p className="text-[11px] text-muted-foreground mt-1">Episode 42</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSearch = () => (
    <div className="px-4 py-8 max-w-7xl mx-auto w-full min-h-[60vh]">
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Search for series or creators"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-muted rounded-full py-4 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-primary text-lg"
          autoFocus
        />
      </div>

      {searchQuery ? (
        <div>
          <h2 className="text-xl font-bold mb-6">Results for "{searchQuery}"</h2>
          {filteredStories.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-2 gap-y-8">
              {filteredStories.map((story) => (
                <div key={story.id} className="flex flex-col cursor-pointer group" onClick={() => openSeriesDetails(story)}>
                  <div className="relative aspect-[3/4] rounded-md mb-2 overflow-hidden">
                    <img src={story.cover} alt={story.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <h3 className="font-bold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">{story.title}</h3>
                  <p className="text-[11px] text-muted-foreground mt-1">{story.genre}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              No results found. Try searching for something else!
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-bold mb-6">Popular Searches</h2>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <Badge key={cat} variant="secondary" className="rounded-full px-4 py-2 cursor-pointer hover:bg-primary hover:text-primary-foreground" onClick={() => setSearchQuery(cat)}>
                {cat}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderViewAll = () => {
    const config = viewAllConfig[viewAllSection];

    return (
      <div className="mx-auto min-h-[60vh] w-full max-w-7xl px-4 py-10 md:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div>
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.28em] text-primary sm:text-xs">{config.eyebrow}</p>
            <h1 className="mt-3 max-w-[12ch] text-[clamp(2rem,7vw,4rem)] font-black leading-[0.92] tracking-[-0.06em] text-white sm:max-w-none">{config.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 md:text-base">{config.description}</p>
          </div>
          <Button variant="outline" className="w-fit rounded-full" onClick={() => setCurrentView(viewAllSection === 'originals' ? 'manga' : 'home')}>
            Back
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {config.items.map((item: any) => (
            <div key={item.id} className="group cursor-pointer" onClick={() => openSeriesDetails(item)}>
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-border bg-muted">
                <img src={item.cover} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
                {item.isNew ? (
                  <div className="absolute left-3 top-3 rounded-full bg-primary px-2 py-1 text-[10px] font-bold uppercase text-white">
                    New
                  </div>
                ) : null}
              </div>
              <div className="mt-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-400">{item.genre}</p>
                <h3 className="mt-1 text-base font-bold text-white transition-colors group-hover:text-primary">{item.title}</h3>
                <p className="mt-1 text-sm text-zinc-500">{item.creator}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-600 line-clamp-2">{item.summary}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAuth = () => (
    <div className="px-4 py-16 max-w-md mx-auto w-full min-h-[70vh] flex flex-col items-center">
      <div className="bg-primary text-primary-foreground font-black text-3xl px-4 py-2 tracking-tighter mb-12" style={{ transform: 'skewX(-10deg)' }}>
        LEMONADE
      </div>
      
      <h1 className="text-2xl font-bold mb-8">{authMode === 'login' ? 'Log in to Lemonade' : 'Create your account'}</h1>
      
      <div className="w-full space-y-4 mb-8">
        <Button variant="outline" className="w-full rounded-full py-6 flex items-center justify-center gap-3 font-bold border-2">
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          Continue with Google
        </Button>
        <Button variant="outline" className="w-full rounded-full py-6 flex items-center justify-center gap-3 font-bold border-2">
          <Facebook className="w-5 h-5 fill-primary text-primary" />
          Continue with Facebook
        </Button>
        <Button variant="outline" className="w-full rounded-full py-6 flex items-center justify-center gap-3 font-bold border-2">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.05 20.28c-.96.95-2.04 1.72-3.24 1.72-1.16 0-1.54-.69-2.94-.69-1.4 0-1.83.68-2.94.68-1.16 0-2.2-.77-3.24-1.72-2.12-2.12-3.24-5.96-3.24-8.64 0-4.24 2.64-6.48 5.16-6.48 1.32 0 2.4.88 3.12.88.72 0 1.92-.88 3.24-.88 1.08 0 2.24.48 3 1.32-2.64 1.56-2.2 5.16.48 6.24-.6 1.44-1.44 2.88-2.4 3.84l-.04.04zM12.13 4.68c-.12-1.56.84-3.12 2.16-4.08 1.32-.96 3-1.08 4.44-.36.12 1.56-.84 3.12-2.16 4.08-1.32.96-3 1.08-4.44.36z" />
          </svg>
          Continue with Apple
        </Button>
      </div>

      <div className="w-full flex items-center gap-4 mb-8">
        <div className="h-[1px] bg-border flex-1" />
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">or</span>
        <div className="h-[1px] bg-border flex-1" />
      </div>

      <form className="w-full space-y-4" onSubmit={(e) => { e.preventDefault(); navigate('/login'); }}>
        <div className="space-y-2">
          <label className="text-sm font-bold">Email address</label>
          <input type="email" placeholder="Email address" className="w-full bg-background border-2 border-border rounded-md p-3 focus:border-primary outline-none" required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold">Password</label>
          <input type="password" placeholder="Password" className="w-full bg-background border-2 border-border rounded-md p-3 focus:border-primary outline-none" required />
        </div>
        <Button type="submit" className="w-full rounded-full py-6 font-bold text-lg mt-4">
          {authMode === 'login' ? 'Log In' : 'Sign Up'}
        </Button>
      </form>

      <div className="mt-8 text-sm">
        <span className="text-muted-foreground">
          {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
        </span>
        <button 
          onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
          className="font-bold text-primary hover:underline"
        >
          {authMode === 'login' ? 'Sign up for Lemonade' : 'Log in'}
        </button>
      </div>
    </div>
  );

  const renderPublish = () => (
    <div className="px-4 py-12 max-w-4xl mx-auto w-full min-h-[60vh] text-center">
      <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
        <PenTool className="w-10 h-10 text-primary" />
      </div>
      <h1 className="text-3xl font-bold mb-4">Choose Your Path</h1>
      <p className="text-muted-foreground mb-12 text-lg max-w-2xl mx-auto">
        How do you want to share your stories? You can always change your focus or submit self-published work for Originals later.
      </p>
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <Card
          className={`p-8 text-left transition-all cursor-pointer border-2 ${creatorType === 'original' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
          onClick={() => {
            setCreatorType('original');
            if(!isLoggedIn) openSignupModal();
            else setCurrentView('publish-dashboard');
          }}
        >
          <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
            <Star className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-bold text-2xl mb-3">Lemonade Originals</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Exclusive partnership with Lemonade. Get professional editorial support, guaranteed minimum pay, and premium marketing.
          </p>
          <ul className="text-xs space-y-2 text-muted-foreground">
            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-primary rounded-full" /> Monthly Stipend</li>
            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-primary rounded-full" /> Exclusive to Lemonade</li>
          </ul>
        </Card>

        <Card
          className={`p-8 text-left transition-all cursor-pointer border-2 ${creatorType === 'self' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
          onClick={() => {
            setCreatorType('self');
            if(!isLoggedIn) openSignupModal();
            else setCurrentView('publish-dashboard');
          }}
        >
          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4">
            <Compass className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="font-bold text-2xl mb-3">Self-Publish</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Full creative control. Post your work anywhere else while building an audience on Lemonade. 
          </p>
          <div className="bg-muted/50 p-3 rounded-md mb-4">
            <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Pro Tip</p>
            <p className="text-[11px] text-muted-foreground">You can submit your self-published series to become an Original at any time!</p>
          </div>
          <ul className="text-xs space-y-2 text-muted-foreground">
            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-muted-foreground rounded-full" /> Keep All Rights</li>
            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-muted-foreground rounded-full" /> Non-Exclusive</li>
          </ul>
        </Card>
      </div>
      <p className="text-sm text-muted-foreground">
        By continuing, you agree to our <a href="#" className="underline">Creator Terms of Service</a>.
      </p>
    </div>
  );

  const renderPublishDashboard = () => (
    <div className="px-4 py-8 max-w-7xl mx-auto w-full min-h-[60vh]">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Creator Dashboard</h1>
          <p className="text-muted-foreground text-sm">Welcome back, Lemonade Creator!</p>
        </div>
        <Button onClick={() => setCurrentView('publish-new')} className="rounded-full gap-2 w-fit">
          <Plus className="w-4 h-4" /> Create New Series
        </Button>
      </div>

      {/* Mobile Dropdown for Tabs */}
      <div className="md:hidden mb-8">
        <Select value={dashboardTab} onValueChange={(val: any) => setDashboardTab(val)}>
          <SelectTrigger className="w-full font-bold">
            <SelectValue placeholder="Select Tab" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="series">MY SERIES</SelectItem>
            <SelectItem value="monetization">MONETIZATION</SelectItem>
            <SelectItem value="stats">STATS & ANALYTICS</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Desktop Tabs */}
      <div className="hidden md:flex gap-8 border-b border-border mb-8 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setDashboardTab('series')}
          className={`pb-4 text-sm font-bold whitespace-nowrap transition-colors ${dashboardTab === 'series' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          MY SERIES
        </button>
        <button 
          onClick={() => setDashboardTab('monetization')}
          className={`pb-4 text-sm font-bold whitespace-nowrap transition-colors ${dashboardTab === 'monetization' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          MONETIZATION
        </button>
        <button 
          onClick={() => setDashboardTab('stats')}
          className={`pb-4 text-sm font-bold whitespace-nowrap transition-colors ${dashboardTab === 'stats' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          STATS & ANALYTICS
        </button>
      </div>

      {dashboardTab === 'series' && (
        <div className="grid gap-6">
          <Card className="p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-32 bg-muted rounded-md flex items-center justify-center overflow-hidden shrink-0">
              <img src="https://picsum.photos/seed/mycomic/200/300" alt="My Comic" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                <h3 className="text-xl font-bold">My First Comic</h3>
                <Badge variant="secondary" className="text-[10px] uppercase">{creatorType === 'original' ? 'Original' : 'Self-Published'}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Draft • Updated 2 hours ago</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => {
                    setSelectedComic(COMICS[0]);
                    setEditableStoryKey(String(COMICS[0].id));
                    setCurrentView('edit-series');
                  }}
                >
                  Edit Series
                </Button>
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => setCurrentView('publish-episode')}>Add Episode</Button>
                {creatorType === 'self' && (
                  <Button variant="default" size="sm" className="rounded-full bg-primary/10 text-primary hover:bg-primary/20 border-none">
                    Submit for Originals
                  </Button>
                )}
              </div>
            </div>
            <div className="flex gap-8 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-8 w-full md:w-auto justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold">0</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Views</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">0</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Likes</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {dashboardTab === 'monetization' && (
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 md:col-span-2">
            <h3 className="font-bold text-xl mb-6">Earnings Overview</h3>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-muted/30 p-4 rounded-xl">
                <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Total Balance</p>
                <p className="text-3xl font-black text-primary">$0.00</p>
              </div>
              <div className="bg-muted/30 p-4 rounded-xl">
                <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Next Payout</p>
                <p className="text-3xl font-black">--</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-border rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Youtube className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold">Ad Revenue</p>
                    <p className="text-xs text-muted-foreground">Earn from ads on your episodes</p>
                  </div>
                </div>
                <Badge variant="outline">Inactive</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border border-border rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold">Reader Tips</p>
                    <p className="text-xs text-muted-foreground">Receive direct support from fans</p>
                  </div>
                </div>
                <Button size="sm" className="rounded-full">Enable</Button>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-primary text-primary-foreground">
            <h3 className="font-bold text-xl mb-4">Creator Rewards</h3>
            <p className="text-sm opacity-90 mb-6 leading-relaxed">
              Reach 1,000 subscribers and 40,000 monthly views to unlock the Lemonade Ad Revenue program.
            </p>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1 uppercase">
                  <span>Subscribers</span>
                  <span>0 / 1,000</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-[5%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-1 uppercase">
                  <span>Monthly Views</span>
                  <span>0 / 40,000</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-[2%]" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {dashboardTab === 'stats' && (
        <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed border-border">
          <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-bold text-xl mb-2">No data yet</h3>
          <p className="text-muted-foreground max-w-xs mx-auto">
            Publish your first episode to start seeing detailed analytics about your readers.
          </p>
        </div>
      )}
    </div>
  );

  const renderPublishNew = () => (
    <div className="px-4 py-12 max-w-2xl mx-auto w-full min-h-[60vh]">
      <Button variant="ghost" onClick={() => setCurrentView('publish-dashboard')} className="mb-6 -ml-4 gap-2">
        <ChevronRight className="w-4 h-4 rotate-180" /> Back to Dashboard
      </Button>
      <h1 className="text-3xl font-bold mb-8">Create New Series</h1>
      
      <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); setCurrentView('publish-dashboard'); }}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold">Series Title</label>
            <input type="text" placeholder="Enter series title" className="w-full bg-background border-2 border-border rounded-md p-3 focus:border-primary outline-none" required />
          </div>
          
          <div className="space-y-3">
            <label className="text-sm font-bold">Series Genres (Select up to 3)</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CATEGORIES.map(cat => (
                <label key={cat} className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${publishGenres.includes(cat) ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                  <input 
                    type="checkbox" 
                    className="hidden"
                    checked={publishGenres.includes(cat)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        if (publishGenres.length < 3) {
                          setPublishGenres([...publishGenres, cat]);
                        }
                      } else {
                        setPublishGenres(publishGenres.filter(g => g !== cat));
                      }
                    }}
                  />
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${publishGenres.includes(cat) ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                    {publishGenres.includes(cat) && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm font-medium">{cat}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Chosen: {publishGenres.join(', ') || 'None'}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold">Summary</label>
            <textarea placeholder="Tell readers what your story is about..." className="w-full bg-background border-2 border-border rounded-md p-3 focus:border-primary outline-none min-h-[120px]" required />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold">Thumbnail (400x533 recommended)</label>
            <div className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary transition-colors cursor-pointer">
              <div className="bg-muted w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="button" variant="outline" className="flex-1 rounded-full py-6 font-bold" onClick={() => setCurrentView('publish-dashboard')}>Cancel</Button>
          <Button type="submit" className="flex-1 rounded-full py-6 font-bold">Create Series</Button>
        </div>
      </form>
    </div>
  );

  const renderProfile = () => (
    <div className="px-4 py-12 max-w-2xl mx-auto w-full min-h-[60vh]">
      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-6 mb-8">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center overflow-hidden border-4 border-primary/20 relative">
          {userProfilePic ? (
            <img src={userProfilePic} alt={userName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <User className="w-12 h-12 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tighter flex items-center gap-2">
            {userName}
            {isPremium && <BadgeCheck className="w-6 h-6 text-primary" />}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground font-medium break-all">{user?.email || 'No email available'}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <Button variant="outline" size="sm" className="rounded-full font-bold" onClick={() => setCurrentView('edit-profile')}>Edit Profile</Button>
            <Button variant="default" size="sm" className="rounded-full font-bold bg-primary/10 text-primary hover:bg-primary/20 border-none" onClick={() => setCurrentView('wallet')}>
              <Coins className="w-3 h-3 mr-1" /> My Wallet
            </Button>
            {!isPremium && (
              <Button variant="default" size="sm" className="rounded-full font-bold bg-primary/10 text-primary hover:bg-primary/20 border-none" onClick={() => setCurrentView('premium')}>
                <BadgeCheck className="w-3 h-3 mr-1" /> Get Verified
              </Button>
            )}
          </div>
        </div>
      </div>

      {userBio && (
        <div className="mb-6">
          <p className="text-sm">{userBio}</p>
        </div>
      )}

      {(profilePronouns || publicBirthdayLabel || selectedGenres.length > 0) && (
        <div className="mb-8 flex flex-wrap gap-2">
          {profilePronouns && <Badge variant="secondary">{profilePronouns}</Badge>}
          {publicBirthdayLabel && <Badge variant="secondary">{publicBirthdayLabel}</Badge>}
          {selectedGenres.map((genre) => (
            <Badge key={genre} variant="outline">{genre}</Badge>
          ))}
        </div>
      )}

      <div className="mb-8 space-y-2 text-sm text-muted-foreground">
        {marketingEmailsEnabled && <p>Marketing emails: Enabled</p>}
        {!marketingEmailsEnabled && <p>Marketing emails: Disabled</p>}
      </div>

      {(dropSomethingLink || creatorDropTitle.trim()) && (
        <div className="mb-8 overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-6 text-white shadow-[0_24px_90px_rgba(0,0,0,0.28)]">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.35em] text-primary/80">Creator support</p>
              <h3 className="text-2xl font-black tracking-tight">{creatorDropTitle.trim() || 'Your next public drop'}</h3>
              <p className="mt-2 max-w-xl text-sm text-white/65">
                {creatorDropDescription.trim() || 'Set up a public or premium drop so fans can follow your work and support your next release.'}
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-[0.25em] text-white/70">
              {creatorDropVisibility === 'premium' ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {creatorDropVisibility === 'premium' ? 'Premium drop' : 'Public drop'}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {dropSomethingLink && (
              <Button
                type="button"
                className="rounded-full bg-primary px-5 font-bold text-primary-foreground hover:bg-primary/90"
                onClick={() => openSupportLink(dropSomethingLink)}
              >
                <DollarSign className="mr-2 h-4 w-4" /> Open DropSomething
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-white/15 bg-transparent px-5 font-bold text-white hover:bg-white/10 hover:text-white"
              onClick={() => setCurrentView('edit-profile')}
            >
              <Sparkles className="mr-2 h-4 w-4" /> Edit creator setup
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-4 mb-12">
        <Card className="p-4 flex items-center justify-between hover:border-primary transition-colors cursor-pointer" onClick={() => setCurrentView('publish-dashboard')}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <PenTool className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-bold">Creator Tools</p>
              <p className="text-xs text-muted-foreground">Manage your series and earnings</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </Card>
        <Card className="p-4 flex items-center justify-between hover:border-primary transition-colors cursor-pointer" onClick={() => setCurrentView('ads-manager')}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-bold">Ads Manager</p>
              <p className="text-xs text-muted-foreground">Promote your business on Lemonade</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </Card>
      </div>

      <div className="space-y-6">
        <div className="border-b border-border pb-4">
          <h3 className="font-bold text-lg mb-4 uppercase tracking-widest text-muted-foreground text-xs">Account Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between cursor-pointer hover:text-primary group" onClick={() => setCurrentView('email-preferences')}>
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                <span className="font-bold">Email Preferences</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </div>
            <div className="flex items-center justify-between cursor-pointer hover:text-primary group" onClick={() => setCurrentView('privacy-settings')}>
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                <span className="font-bold">Privacy & Security</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </div>
            <div className="flex items-center justify-between cursor-pointer hover:text-primary text-red-500 font-bold pt-4" onClick={async () => { await logout(); navigate('/login'); }}>
              <span>Log Out</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdsManager = () => (
    <div className="px-4 py-8 max-w-7xl mx-auto w-full min-h-[60vh]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">Ads Manager</h1>
          <p className="text-muted-foreground">Grow your business with Lemonade Ads</p>
        </div>
        <Button className="rounded-full gap-2" onClick={() => setCurrentView('create-campaign')}>
          <Plus className="w-4 h-4" /> Create Campaign
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Card className="p-6">
          <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Active Campaigns</p>
          <p className="text-3xl font-black">0</p>
        </Card>
        <Card className="p-6">
          <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Total Impressions</p>
          <p className="text-3xl font-black">0</p>
        </Card>
        <Card className="p-6">
          <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Ad Spend</p>
          <p className="text-3xl font-black">$0.00</p>
        </Card>
      </div>

      <div className="bg-muted/20 rounded-2xl p-12 text-center border-2 border-dashed border-border">
        <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-bold text-xl mb-2">No campaigns found</h3>
        <p className="text-muted-foreground max-w-sm mx-auto mb-8">
          Reach millions of readers by promoting your content or business on Lemonade.
        </p>
        <Button className="rounded-full px-8" onClick={() => setCurrentView('create-campaign')}>Get Started</Button>
      </div>
    </div>
  );

  const renderEditProfile = () => (
    <div className="px-4 py-12 max-w-2xl mx-auto w-full min-h-[60vh]">
      <Button variant="ghost" onClick={() => setCurrentView('profile')} className="mb-6 -ml-4 gap-2">
        <ChevronRight className="w-4 h-4 rotate-180" /> Back to Profile
      </Button>
      <h1 className="text-2xl sm:text-3xl font-bold mb-8">Edit Profile</h1>
      
      <form className="space-y-6" onSubmit={handleSaveProfile}>
        <div className="space-y-4">
          <label className="text-sm font-bold">Profile Picture</label>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center overflow-hidden border-4 border-primary/20 relative">
              {userProfilePic ? (
                <img src={userProfilePic} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <User className="w-12 h-12 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-xs text-muted-foreground mb-2">Upload a profile picture to personalize your account.</p>
              <div className="flex flex-wrap gap-2">
                <input
                  ref={profileImageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfileImageSelected}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full font-bold"
                  disabled={isUploadingProfilePic}
                  onClick={() => profileImageInputRef.current?.click()}
                >
                  <Upload className="w-3 h-3 mr-1" /> {isUploadingProfilePic ? 'Uploading...' : 'Upload Image'}
                </Button>
                {userProfilePic && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="rounded-full font-bold text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => {
                      setProfileSaveError('');
                      setProfileSaveMessage('Profile picture will be removed when you save changes.');
                      setUserProfilePic(null);
                    }}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {profileSaveError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {profileSaveError}
          </div>
        )}

        {profileSaveMessage && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {profileSaveMessage}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-bold">Display Name</label>
          <p className="text-xs text-muted-foreground">This is the public name readers will see on your profile and comments.</p>
          <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Enter your display name" className="w-full bg-background border-2 border-border rounded-md p-3 focus:border-primary outline-none" required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold">Bio</label>
          <p className="text-xs text-muted-foreground">Share a short intro about yourself, your taste, or what you create.</p>
          <textarea value={userBio} onChange={(e) => setUserBio(e.target.value)} placeholder="Tell us about yourself..." className="w-full bg-background border-2 border-border rounded-md p-3 focus:border-primary outline-none min-h-[100px]" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold">DropSomething Link</label>
          <p className="text-xs text-muted-foreground mb-2">Add your DropSomething link so fans can support you directly.</p>
          <input type="url" value={dropSomethingLink} onChange={(e) => setDropSomethingLink(e.target.value)} placeholder="https://dropsomething.com/yourusername" className="w-full bg-background border-2 border-border rounded-md p-3 focus:border-primary outline-none" />
        </div>
        <div className="space-y-4 rounded-[24px] border border-border bg-muted/20 p-5">
          <div>
            <label className="text-sm font-bold">Creator Drop Setup</label>
            <p className="mt-1 text-xs text-muted-foreground">Build a premium creator page with a featured drop fans can follow, like, and unlock.</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">Support Headline</label>
            <input
              type="text"
              value={creatorSupportHeadline}
              onChange={(e) => setCreatorSupportHeadline(e.target.value)}
              placeholder="Support my next drop"
              className="w-full bg-background border-2 border-border rounded-md p-3 focus:border-primary outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">Featured Drop Title</label>
            <input
              type="text"
              value={creatorDropTitle}
              onChange={(e) => setCreatorDropTitle(e.target.value)}
              placeholder="Spring sketchbook drop"
              className="w-full bg-background border-2 border-border rounded-md p-3 focus:border-primary outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">Featured Drop Description</label>
            <textarea
              value={creatorDropDescription}
              onChange={(e) => setCreatorDropDescription(e.target.value)}
              placeholder="Tell fans what they get when they support or follow this drop."
              className="w-full min-h-[110px] bg-background border-2 border-border rounded-md p-3 focus:border-primary outline-none"
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-bold">Drop Visibility</label>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setCreatorDropVisibility('public')}
                className={`rounded-2xl border p-4 text-left transition-all ${creatorDropVisibility === 'public' ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-primary/40'}`}
              >
                <div className="mb-2 flex items-center gap-2 text-sm font-bold">
                  <Eye className="h-4 w-4 text-primary" /> Public
                </div>
                <p className="text-xs text-muted-foreground">Anyone can see this drop on your creator page.</p>
              </button>
              <button
                type="button"
                onClick={() => setCreatorDropVisibility('premium')}
                className={`rounded-2xl border p-4 text-left transition-all ${creatorDropVisibility === 'premium' ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-primary/40'}`}
              >
                <div className="mb-2 flex items-center gap-2 text-sm font-bold">
                  <Lock className="h-4 w-4 text-primary" /> Premium
                </div>
                <p className="text-xs text-muted-foreground">Fans see the preview and need Premium to unlock the full drop.</p>
              </button>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold">Pronouns</label>
          <p className="text-xs text-muted-foreground">Optional. This helps other users refer to you correctly.</p>
          <input type="text" value={profilePronouns} onChange={(e) => setProfilePronouns(e.target.value)} placeholder="e.g. she/her, he/him, they/them" className="w-full bg-background border-2 border-border rounded-md p-3 focus:border-primary outline-none" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold">Birthday</label>
          <p className="text-xs text-muted-foreground">Use your date of birth for profile and account settings.</p>
          <input type="date" value={profileBirthday} onChange={(e) => setProfileBirthday(e.target.value)} className="w-full bg-background border-2 border-border rounded-md p-3 focus:border-primary outline-none" />
        </div>
        <div className="space-y-3">
          <label className="text-sm font-bold">Favorite Genres (Select up to 3)</label>
          <p className="text-xs text-muted-foreground">We use this to personalize recommendations across Lemonade.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CATEGORIES.map((cat) => (
              <label key={`profile-${cat}`} className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${selectedGenres.includes(cat) ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={selectedGenres.includes(cat)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      if (selectedGenres.length < 3) {
                        setSelectedGenres([...selectedGenres, cat]);
                      }
                    } else {
                      setSelectedGenres(selectedGenres.filter((genre) => genre !== cat));
                    }
                  }}
                />
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${selectedGenres.includes(cat) ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                  {selectedGenres.includes(cat) && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-sm font-medium">{cat}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Selected: {selectedGenres.join(', ') || 'None'}</p>
        </div>
        <label className="flex items-start gap-3 rounded-xl border border-border p-4 cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 accent-primary"
            checked={marketingEmailsEnabled}
            onChange={(e) => setMarketingEmailsEnabled(e.target.checked)}
          />
          <div>
            <p className="font-bold">Marketing Emails</p>
            <p className="text-sm text-muted-foreground">Turn this on if you want product updates, offers, and creator tips by email.</p>
          </div>
        </label>
        <Button type="submit" className="w-full rounded-full py-6 font-bold" disabled={isSavingProfile || isUploadingProfilePic}>
          {isSavingProfile ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </div>
  );

  const renderWallet = () => (
    <div className="px-4 py-12 max-w-2xl mx-auto w-full min-h-[60vh]">
      <Button variant="ghost" onClick={() => setCurrentView('profile')} className="mb-6 -ml-4 gap-2">
        <ChevronRight className="w-4 h-4 rotate-180" /> Back to Profile
      </Button>
      <h1 className="text-3xl font-bold mb-8">My Wallet</h1>
      
      <Card className="p-8 text-center mb-8 bg-primary/5 border-primary/20">
        <p className="text-sm font-bold text-muted-foreground uppercase mb-2">Available Coins</p>
        <p className="text-4xl sm:text-5xl font-black text-primary mb-6">150</p>
        <Button className="rounded-full px-8 font-bold">Buy More Coins</Button>
      </Card>

      <h2 className="text-xl font-bold mb-4">Coin Packages</h2>
      <div className="space-y-4">
        {[
          { coins: 100, price: "NGN 1,500" },
          { coins: 500, price: "NGN 7,500", bonus: "+50 Bonus" },
          { coins: 1000, price: "NGN 15,000", bonus: "+150 Bonus" },
        ].map((pkg, i) => (
          <div key={i} className="flex items-center justify-between p-4 border border-border rounded-xl hover:border-primary transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Coins className="w-5 h-5 text-primary-dark" />
              </div>
              <div>
                <p className="font-bold">{pkg.coins} Coins</p>
                {pkg.bonus && <p className="text-xs text-primary font-bold">{pkg.bonus}</p>}
              </div>
            </div>
            <Button variant="outline" className="font-bold">{pkg.price}</Button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEmailPreferences = () => (
    <div className="px-4 py-12 max-w-2xl mx-auto w-full min-h-[60vh]">
      <Button variant="ghost" onClick={() => setCurrentView('profile')} className="mb-6 -ml-4 gap-2">
        <ChevronRight className="w-4 h-4 rotate-180" /> Back to Profile
      </Button>
      <h1 className="text-3xl font-bold mb-8">Email Preferences</h1>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 border border-border rounded-xl">
          <div>
            <p className="font-bold">New Episodes</p>
            <p className="text-sm text-muted-foreground">Get notified when series you follow update.</p>
          </div>
          <input type="checkbox" className="w-5 h-5 accent-primary" defaultChecked />
        </div>
        <div className="flex items-center justify-between p-4 border border-border rounded-xl">
          <div>
            <p className="font-bold">Creator Updates</p>
            <p className="text-sm text-muted-foreground">News and tips for creators.</p>
          </div>
          <input type="checkbox" className="w-5 h-5 accent-primary" defaultChecked />
        </div>
        <div className="flex items-center justify-between p-4 border border-border rounded-xl">
          <div>
            <p className="font-bold">Promotions & Offers</p>
            <p className="text-sm text-muted-foreground">Special deals on coins and premium content.</p>
          </div>
          <input type="checkbox" className="w-5 h-5 accent-primary" />
        </div>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="px-4 py-12 max-w-2xl mx-auto w-full min-h-[60vh]">
      <Button variant="ghost" onClick={() => setCurrentView('profile')} className="mb-6 -ml-4 gap-2">
        <ChevronRight className="w-4 h-4 rotate-180" /> Back to Profile
      </Button>
      <h1 className="text-3xl font-bold mb-8">Privacy & Security</h1>
      
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-bold text-lg">Password</h3>
          <Button variant="outline" className="w-full justify-start">Change Password</Button>
        </div>
        <div className="space-y-4">
          <h3 className="font-bold text-lg">Data & Privacy</h3>
          <Button variant="outline" className="w-full justify-start">Download My Data</Button>
          <Button variant="outline" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">Delete Account</Button>
        </div>
      </div>
    </div>
  );

  const renderCreateCampaign = () => (
    <div className="px-4 py-12 max-w-2xl mx-auto w-full min-h-[60vh]">
      <Button variant="ghost" onClick={() => setCurrentView(previousView === 'admin' ? 'admin' : 'ads-manager')} className="mb-6 -ml-4 gap-2">
        <ChevronRight className="w-4 h-4 rotate-180" /> Back to {previousView === 'admin' ? 'Admin' : 'Ads Manager'}
      </Button>
      <h1 className="text-3xl font-bold mb-8">Create Ad Campaign</h1>
      
      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setCurrentView(previousView === 'admin' ? 'admin' : 'ads-manager'); }}>
        <div className="space-y-2">
          <label className="text-sm font-bold">Campaign Name</label>
          <input type="text" placeholder="e.g., Summer Sale Promo" className="w-full bg-background border-2 border-border rounded-md p-3 focus:border-primary outline-none" required />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-bold">Target URL</label>
          <input type="url" placeholder="https://yourwebsite.com" className="w-full bg-background border-2 border-border rounded-md p-3 focus:border-primary outline-none" required />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold">Daily Budget ($)</label>
            <input type="number" min="5" placeholder="10" className="w-full bg-background border-2 border-border rounded-md p-3 focus:border-primary outline-none" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">Duration (Days)</label>
            <input type="number" min="1" placeholder="7" className="w-full bg-background border-2 border-border rounded-md p-3 focus:border-primary outline-none" required />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold">Ad Creative (Image/Video)</label>
          <div className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary transition-colors cursor-pointer">
            <Plus className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Upload your ad creative</p>
          </div>
        </div>

        <div className="bg-muted/30 p-4 rounded-xl mb-6">
          <div className="flex justify-between font-bold mb-2">
            <span>Estimated Total Cost:</span>
            <span className="text-primary">$70.00</span>
          </div>
          <p className="text-xs text-muted-foreground">Based on $10/day for 7 days.</p>
        </div>

        <Button type="submit" className="w-full rounded-full py-6 font-bold text-lg">Pay & Launch Campaign</Button>
      </form>
    </div>
  );

  const renderPublishEpisode = () => (
    <div className="px-4 py-12 max-w-2xl mx-auto w-full min-h-[60vh]">
      <Button variant="ghost" onClick={() => setCurrentView('publish-dashboard')} className="mb-6 -ml-4 gap-2">
        <ChevronRight className="w-4 h-4 rotate-180" /> Back to Dashboard
      </Button>
      <h1 className="text-3xl font-bold mb-8">Add New Episode</h1>
      
      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setCurrentView('publish-dashboard'); }}>
        <div className="space-y-2">
          <label className="text-sm font-bold">Episode Title</label>
          <input type="text" placeholder="e.g., Episode 1: The Beginning" className="w-full bg-background border-2 border-border rounded-md p-3 focus:border-primary outline-none" required />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-bold">Creator Note (Optional)</label>
          <textarea placeholder="Say something to your readers..." className="w-full bg-background border-2 border-border rounded-md p-3 focus:border-primary outline-none min-h-[80px]" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold">Upload Pages</label>
          <div className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary transition-colors cursor-pointer">
            <Plus className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Drag and drop images here, or click to select</p>
            <p className="text-xs text-muted-foreground mt-2">Recommended width: 800px. Max 20MB per file.</p>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="button" variant="outline" className="flex-1 rounded-full py-6 font-bold" onClick={() => setCurrentView('publish-dashboard')}>Save Draft</Button>
          <Button type="submit" className="flex-1 rounded-full py-6 font-bold">Publish Episode</Button>
        </div>
      </form>
    </div>
  );

  const renderEditSeries = () => (
    <div className="px-4 py-12 max-w-3xl mx-auto w-full min-h-[60vh]">
      <Button variant="ghost" onClick={() => setCurrentView('publish-dashboard')} className="mb-6 -ml-4 gap-2">
        <ChevronRight className="w-4 h-4 rotate-180" /> Back to Dashboard
      </Button>
      <h1 className="text-3xl font-bold mb-8">Edit Series</h1>
      
      <form className="space-y-8" onSubmit={handleSaveStoryStyle}>
        <div className="space-y-2">
          <label className="text-sm font-bold">Story</label>
          <select
            value={editableStoryKey}
            onChange={(event) => setEditableStoryKey(event.target.value)}
            className="w-full bg-background border-2 border-border rounded-md p-3 focus:border-primary outline-none"
          >
            {editableStories.map((story) => (
              <option key={story.id} value={String(story.id)}>
                {story.title} ({story.type})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold">Series Title</label>
          <input type="text" value={editableStory?.title || ''} className="w-full bg-background border-2 border-border rounded-md p-3 focus:border-primary outline-none" readOnly />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-bold">Summary</label>
          <textarea value={('summary' in editableStory ? editableStory.summary : '') || 'No summary available.'} className="w-full bg-background border-2 border-border rounded-md p-3 focus:border-primary outline-none min-h-[120px]" readOnly />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold">Cover Image (URL)</label>
          <input
            type="url"
            value={storyCoverImage}
            onChange={(event) => setStoryCoverImage(event.target.value)}
            placeholder="https://example.com/cover.jpg"
            className="w-full bg-background border-2 border-border rounded-md p-3 focus:border-primary outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold">Background Image (URL)</label>
          <input
            type="url"
            value={storyBackgroundImage}
            onChange={(event) => setStoryBackgroundImage(event.target.value)}
            placeholder="https://example.com/background.jpg"
            className="w-full bg-background border-2 border-border rounded-md p-3 focus:border-primary outline-none"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold">Background Overlay Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={storyOverlayColor} onChange={(event) => setStoryOverlayColor(event.target.value)} className="h-12 w-16 rounded-md border border-border bg-background p-1" />
              <input
                type="text"
                value={storyOverlayColor}
                onChange={(event) => setStoryOverlayColor(event.target.value)}
                className="flex-1 bg-background border-2 border-border rounded-md p-3 focus:border-primary outline-none"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">Overlay Opacity ({storyOverlayOpacity}%)</label>
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={storyOverlayOpacity}
              onChange={(event) => setStoryOverlayOpacity(Number(event.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold">Layout Style</label>
            <select value={storyLayoutStyle} onChange={(event) => setStoryLayoutStyle(event.target.value as 'classic' | 'immersive')} className="w-full bg-background border-2 border-border rounded-md p-3 focus:border-primary outline-none">
              <option value="classic">classic</option>
              <option value="immersive">immersive</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">Text Color</label>
            <select value={storyTextColor} onChange={(event) => setStoryTextColor(event.target.value as 'light' | 'dark')} className="w-full bg-background border-2 border-border rounded-md p-3 focus:border-primary outline-none">
              <option value="dark">dark</option>
              <option value="light">light</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">Font Style</label>
            <select value={storyFontStyle} onChange={(event) => setStoryFontStyle(event.target.value as 'serif' | 'sans')} className="w-full bg-background border-2 border-border rounded-md p-3 focus:border-primary outline-none">
              <option value="serif">serif</option>
              <option value="sans">sans</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold">Live Cover Preview</label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-32 bg-muted rounded-md overflow-hidden shrink-0">
              <img src={storyCoverImage || editableStory?.cover} alt="Current Thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <p className="text-sm text-muted-foreground">Save changes to update the reader live for this story.</p>
          </div>
        </div>

        {storyStyleMessage && (
          <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            {storyStyleMessage}
          </div>
        )}

        <Button type="submit" disabled={isSavingStoryStyle} className="w-full rounded-full py-6 font-bold">
          {isSavingStoryStyle ? 'Saving Story Style...' : 'Save Changes'}
        </Button>
      </form>
    </div>
  );

  const renderCommentSection = (contentId: StoryId) => {
    const commentKey = String(contentId);
    const contentComments = comments[commentKey] || [];
    
    const handleAddComment = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newComment.trim()) return;
      
      const comment = {
        id: Date.now(),
        user: userName,
        text: newComment,
        likes: 0,
        date: "Just now"
      };
      
      setComments(prev => ({
        ...prev,
        [commentKey]: [comment, ...(prev[commentKey] || [])]
      }));
      setNewComment('');
    };

    return (
      <div className="mt-12 border-t border-border pt-8">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" /> Comments ({contentComments.length})
        </h3>
        
        <form onSubmit={handleAddComment} className="mb-8">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0 overflow-hidden">
              {userProfilePic ? <img src={userProfilePic} alt="Me" className="w-full h-full object-cover" /> : <User className="w-6 h-6 m-2 text-muted-foreground" />}
            </div>
            <div className="flex-1 space-y-3">
              <textarea 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..." 
                className="w-full bg-muted/50 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary outline-none min-h-[100px] resize-none"
              />
              <div className="flex justify-end">
                <Button type="submit" className="rounded-full px-6 font-bold" disabled={!newComment.trim()}>Post Comment</Button>
              </div>
            </div>
          </div>
        </form>

        <div className="space-y-6">
          {contentComments.map(comment => (
            <div key={comment.id} className="flex gap-4 group">
              <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0 flex items-center justify-center">
                <User className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm">{comment.user}</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{comment.date}</span>
                </div>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-3">{comment.text}</p>
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                    <Heart className="w-3 h-3" /> {comment.likes}
                  </button>
                  <button className="text-xs text-muted-foreground hover:text-primary transition-colors">Reply</button>
                  <button className="text-xs text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                    <Flag className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAdmin = () => {
    const renderAdminDashboard = () => (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Users", value: adminDashboardStats?.totalUsers ?? 0, change: `${adminDashboardStats?.premiumUsers ?? 0} premium`, icon: Users, color: "text-primary" },
            { label: "Active Series", value: adminDashboardStats?.activeSeries ?? 0, change: `${adminDashboardStats?.totalOriginals ?? 0} originals`, icon: BookOpen, color: "text-primary" },
            { label: "Story Views", value: adminDashboardStats?.totalViews ?? 0, change: `${adminDashboardStats?.totalLikes ?? 0} likes`, icon: BarChart3, color: "text-primary" },
            { label: "Wallet Balance", value: `$${(adminDashboardStats?.totalWalletBalance ?? 0).toLocaleString()}`, change: `${adminDashboardStats?.activeCampaigns ?? 0} active campaigns`, icon: DollarSign, color: "text-primary" },
          ].map((stat, i) => (
            <Card key={i} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold">
                  {stat.change}
                </Badge>
              </div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              <p className="text-3xl font-black mt-1">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 p-6">
            <h3 className="text-xl font-bold mb-6">Latest Series</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {(adminDashboardStats?.latestSeries || []).map((seriesItem: any) => (
                <div key={seriesItem._id} className="rounded-2xl border border-border bg-muted/20 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-400">{seriesItem.type}</p>
                  <h4 className="mt-2 text-lg font-bold text-white">{seriesItem.title}</h4>
                  <p className="mt-1 text-sm text-zinc-400">{seriesItem.creatorName}</p>
                  <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-zinc-500">
                    <span>{seriesItem.genre}</span>
                    <span>{seriesItem.views} views</span>
                    <span>{seriesItem.likes} likes</span>
                  </div>
                </div>
              ))}
              {adminDashboardStats && adminDashboardStats.latestSeries.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                  No series has been created yet.
                </div>
              )}
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-6">Live Snapshot</h3>
            <div className="space-y-6">
              {[
                { label: "Comments", status: `${adminDashboardStats?.totalComments ?? 0} live`, color: "bg-primary" },
                { label: "Campaigns", status: `${adminDashboardStats?.totalCampaigns ?? 0} total`, color: "bg-primary" },
                { label: "Scheduled Ads", status: `${adminDashboardStats?.scheduledCampaigns ?? 0} queued`, color: "bg-primary" },
                { label: "Series Library", status: `${adminDashboardStats?.totalSeries ?? 0} titles`, color: "bg-primary" },
              ].map((sys, i) => (
                <div key={i} className="flex items-center justify-between">
                  <p className="font-medium">{sys.label}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-bold">{sys.status}</span>
                    <div className={`w-2 h-2 rounded-full ${sys.color}`} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );

    const renderAdminUsers = () => (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold">User Management</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {convexAdminUsers ? `${convexAdminUsers.length} users loaded from Convex` : 'Loading Convex users...'}
            </p>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={adminUserSearch}
              onChange={(e) => setAdminUserSearch(e.target.value)}
              placeholder="Search users..."
              className="bg-muted border-none rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-sm text-muted-foreground uppercase tracking-wider">
                <th className="pb-4 font-bold">User</th>
                <th className="pb-4 font-bold">Role</th>
                <th className="pb-4 font-bold">Status</th>
                <th className="pb-4 font-bold">Joined</th>
                <th className="pb-4 font-bold">UID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAdminUsers.map((adminUser) => (
                <tr key={adminUser._id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-4">
                    <div className="font-medium">{adminUser.displayName || adminUser.email || 'Unnamed user'}</div>
                    <div className="text-xs text-muted-foreground mt-1">{adminUser.email || 'No email saved'}</div>
                  </td>
                  <td className="py-4">
                    <Badge variant="outline" className="font-bold capitalize">{adminUser.role}</Badge>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${adminUser.onboardingCompleted ? 'bg-primary' : 'bg-primary-light'}`} />
                      <span className="text-sm">{adminUser.onboardingCompleted ? 'Profile Complete' : 'Basic Auth Only'}</span>
                    </div>
                  </td>
                  <td className="py-4 text-sm text-muted-foreground">
                    {'_creationTime' in adminUser ? new Date(adminUser._creationTime).toLocaleDateString() : 'Unknown'}
                  </td>
                  <td className="py-4 text-xs text-muted-foreground">{adminUser.firebaseUid}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {convexAdminUsers && filteredAdminUsers.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No Convex users matched your search.
            </div>
          )}
        </div>
      </Card>
    );

    const renderAdminModeration = () => (
      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-6">Latest Content</h3>
          <div className="space-y-4">
            {(adminDashboardStats?.latestSeries || []).map((seriesItem: any) => (
              <div key={seriesItem._id} className="flex items-center justify-between p-4 border border-border rounded-xl hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-16 bg-muted rounded-md overflow-hidden">
                    <img src={`https://picsum.photos/seed/mod-${seriesItem._id}/100/150`} alt={seriesItem.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-bold">{seriesItem.title}</p>
                    <p className="text-xs text-muted-foreground">Submitted by {seriesItem.creatorName} • {seriesItem.genre}</p>
                    <Badge className="mt-2 bg-primary/10 text-primary border-none text-[10px] uppercase">{seriesItem.type}</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="rounded-full font-bold text-xs">Review</Button>
                  <Button size="sm" className="rounded-full font-bold text-xs">Mark Seen</Button>
                </div>
              </div>
            ))}
            {adminDashboardStats && adminDashboardStats.latestSeries.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                No series submissions yet.
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold mb-6">Recent Comments</h3>
          <div className="space-y-4">
            {(adminDashboardStats?.latestComments || []).map((commentItem: any) => (
              <div key={commentItem._id} className="p-4 border border-border rounded-xl bg-muted/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold">{commentItem.userName}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(commentItem.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-muted-foreground bg-white/50 dark:bg-black/20 p-3 rounded-lg mb-4">
                  "{commentItem.text}"
                </p>
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" className="text-xs font-bold">Dismiss</Button>
                  <Button size="sm" variant="outline" className="rounded-full text-xs font-bold">Review Thread</Button>
                </div>
              </div>
            ))}
            {adminDashboardStats && adminDashboardStats.latestComments.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                No comments have been posted yet.
              </div>
            )}
          </div>
        </Card>
      </div>
    );

    const renderAdminAds = () => (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Ad Management</h3>
          <Button className="rounded-full font-bold gap-2" onClick={() => { setPreviousView('admin'); setCurrentView('create-campaign'); }}>
            <Plus className="w-4 h-4" /> Create New Ad
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(adminCampaigns || []).map(ad => (
            <Card key={ad._id} className="overflow-hidden group">
              <div className="aspect-video relative overflow-hidden">
                <img src={`https://picsum.photos/seed/campaign-${ad._id}/800/400`} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 right-4">
                  <Badge className={ad.status === 'active' ? 'bg-primary' : 'bg-primary-light text-primary-dark'}>{ad.status}</Badge>
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-bold text-lg mb-4">{ad.title}</h4>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-muted/50 p-3 rounded-xl">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Views</p>
                    <p className="text-xl font-black">{ad.views.toLocaleString()}</p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-xl">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Clicks</p>
                    <p className="text-xl font-black">{ad.clicks.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 rounded-full font-bold">Edit</Button>
                  <Button variant="outline" className="rounded-full font-bold px-4">
                    {ad.status === 'active' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {adminCampaigns && adminCampaigns.length === 0 && (
            <Card className="p-8 text-sm text-muted-foreground">
              No campaigns yet. Create your first ad campaign from this panel.
            </Card>
          )}
        </div>
      </div>
    );

    return (
      <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
        {/* Admin Sidebar */}
        <div className="w-64 bg-white dark:bg-zinc-900 border-r border-border hidden lg:flex flex-col sticky top-0 h-screen">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-2 text-primary mb-1">
              <ShieldCheck className="w-6 h-6" />
              <span className="font-black tracking-tighter text-xl">ADMIN</span>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Lemonade Platform</p>
          </div>
          <div className="flex-1 p-4 space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'moderation', label: 'Moderation', icon: Flag },
              { id: 'ads', label: 'Ads & Campaigns', icon: Megaphone },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setAdminTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${adminTab === item.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </div>
          <div className="p-4 border-t border-border">
            <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl font-bold text-muted-foreground hover:text-foreground" onClick={() => setCurrentView('home')}>
              <Home className="w-5 h-5" /> Back to Site
            </Button>
          </div>
        </div>

        {/* Admin Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8 lg:hidden">
              <h1 className="text-2xl font-black tracking-tighter flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-primary" /> ADMIN
              </h1>
              <Sheet>
                <SheetTrigger className="rounded-full border border-border p-2 hover:bg-accent transition-colors flex items-center justify-center">
                  <Menu className="w-5 h-5" />
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] p-0">
                  {/* Reuse sidebar content for mobile */}
                  <div className="p-6 border-b border-border">
                    <div className="flex items-center gap-2 text-primary">
                      <ShieldCheck className="w-6 h-6" />
                      <span className="font-black tracking-tighter text-xl">ADMIN</span>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    {['dashboard', 'users', 'moderation', 'ads'].map(id => (
                      <button key={id} onClick={() => { setAdminTab(id as any); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm ${adminTab === id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
                        {id.charAt(0).toUpperCase() + id.slice(1)}
                      </button>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-black tracking-tighter uppercase">{adminTab}</h2>
              <p className="text-muted-foreground font-medium">Manage your platform's {adminTab} and settings.</p>
            </div>

            {adminTab === 'dashboard' && renderAdminDashboard()}
            {adminTab === 'users' && renderAdminUsers()}
            {adminTab === 'moderation' && renderAdminModeration()}
            {adminTab === 'ads' && renderAdminAds()}
          </div>
        </div>
      </div>
    );
  };

  const renderReader = () => {
    const readerStory = selectedComic
      ? {
          ...DUMMY_STORY,
          id: selectedComic.id,
          title: selectedComic.title,
          author: selectedComic.creator,
          cover: selectedComic.cover,
          description: selectedComic.summary || DUMMY_STORY.description,
        }
      : DUMMY_STORY;

    const backView = previousView === 'reader' ? 'novels' : previousView;

    return <NovelReaderPage story={readerStory} onBack={() => setCurrentView(backView || 'novels')} />;
  };

  const renderSeriesDetails = () => {
    if (!selectedComic) {
      return (
        <div className="px-4 py-12 max-w-4xl mx-auto w-full min-h-[60vh]">
          <Button variant="ghost" onClick={() => setCurrentView(previousView || 'home')} className="mb-6 -ml-4 gap-2">
            <ChevronRight className="w-4 h-4 rotate-180" /> Back
          </Button>
          <div className="rounded-3xl border border-border bg-card p-8 text-center">
            <h1 className="text-2xl font-black tracking-tight">Series unavailable</h1>
            <p className="mt-3 text-muted-foreground">
              We couldn&apos;t resolve this series from the current route. Try returning to the catalog and opening it again.
            </p>
          </div>
        </div>
      );
    }

    return (
    <div className="px-4 py-8 max-w-4xl mx-auto w-full min-h-[60vh]">
      <Button variant="ghost" onClick={() => setCurrentView(previousView || 'home')} className="mb-6 -ml-4 gap-2">
        <ChevronRight className="w-4 h-4 rotate-180" /> Back
      </Button>
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="w-full md:w-64 shrink-0">
          <img src={selectedComic?.cover} alt={selectedComic?.title} className="w-full aspect-[3/4] object-cover rounded-xl shadow-lg" referrerPolicy="no-referrer" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge>{selectedComic?.genre}</Badge>
            {selectedComic && isComicStory(selectedComic) && selectedComic.isOriginal && <Badge variant="secondary" className="bg-primary/20 text-primary">Original</Badge>}
            <Badge variant="outline" className="uppercase text-[10px] font-bold">{selectedComic?.type || 'webtoon'}</Badge>
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">{selectedComic?.title}</h1>
          <p className="text-xl text-muted-foreground mb-4 cursor-pointer hover:text-primary transition-colors inline-block" onClick={() => setCurrentView('creator-profile')}>{selectedComic?.creator}</p>
          <div className="flex items-center gap-6 mb-6 text-sm font-bold">
            <div className="flex items-center gap-2"><Heart className="w-4 h-4" /> {selectedComic?.likes}</div>
            <div className="flex items-center gap-2"><Play className="w-4 h-4" /> {selectedComic?.views}</div>
          </div>
          <p className="text-muted-foreground leading-relaxed mb-6">
            {selectedComic?.summary || `Follow the epic journey in ${selectedComic?.title}. This is a placeholder summary for the series. It's full of action, drama, and incredible art.`}
          </p>
          <Button className="rounded-full px-8 py-6 font-bold text-lg w-full md:w-auto" onClick={() => startReading(selectedComic)}>
            Read First Episode
          </Button>
        </div>
      </div>

      <>
        <h3 className="text-2xl font-bold mb-6">Episodes</h3>
        <div className="space-y-4">
          {[5, 4, 3, 2, 1].map(ep => (
            <div key={ep} className="flex items-center gap-4 p-4 border border-border rounded-xl hover:border-primary transition-colors cursor-pointer group" onClick={() => startReading(selectedComic)}>
              <div className="w-24 aspect-video bg-muted rounded-md overflow-hidden shrink-0 relative">
                <img src={`https://picsum.photos/seed/ep${selectedComic?.id}-${ep}/320/180`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg">Episode {ep}</h4>
                <p className="text-sm text-muted-foreground">Oct {ep}, 2023</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Like Episode ${ep}`}
                className="shrink-0"
                onClick={(event) => {
                  event.stopPropagation();
                  if (selectedComic) {
                    toggleEpisodeLike(selectedComic.id, ep);
                  }
                }}
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${
                    selectedComic && likedEpisodes.has(`${String(selectedComic.id)}-${ep}`)
                      ? 'fill-primary text-primary'
                      : 'text-muted-foreground'
                  }`}
                />
              </Button>
            </div>
          ))}
        </div>
      </>

      {selectedComic && renderCommentSection(selectedComic.id)}
    </div>
    );
  };

  const renderCreatorProfile = () => {
    const creatorName = selectedComic?.creator || '';
    const creatorStories = allStories.filter((story) => story.creator === creatorName);
    const displayComics = creatorStories.length > 0 ? creatorStories : (selectedComic ? [selectedComic] : []);
    const fallbackProfile = creatorProfiles[creatorName] || {
      tagline: 'Premium creator on Lemonade',
      intro: 'A creator building worlds, sharing drops, and inviting fans into the process.',
      supportLabel: 'Support the next drop',
      supportUrl: '',
      totalViews: 0,
      totalLikes: 0,
      publicMoments: [] as CreatorMoment[],
    };
    const isOwnCreatorProfile = Boolean(creatorName) && [userName, userProfile?.displayName, user?.displayName].filter(Boolean).includes(creatorName);
    const publicCreatorProfile = !isOwnCreatorProfile ? creatorPublicProfile : null;
    const creatorBio = isOwnCreatorProfile
      ? userBio || fallbackProfile.intro
      : publicCreatorProfile?.bio || fallbackProfile.intro;
    const creatorAvatar = isOwnCreatorProfile
      ? (userProfilePic || publicCreatorProfile?.photoURL)
      : publicCreatorProfile?.photoURL;
    const supportUrl = isOwnCreatorProfile
      ? normalizeExternalUrl(dropSomethingLink)
      : normalizeExternalUrl(publicCreatorProfile?.dropSomethingLink || fallbackProfile.supportUrl);
    const publicSupportHeadline = isOwnCreatorProfile
      ? creatorSupportHeadline.trim() || fallbackProfile.supportLabel
      : publicCreatorProfile?.creatorSupportHeadline || fallbackProfile.supportLabel;
    const featuredDrop: CreatorMoment = {
      id: `${creatorName}-featured-drop`,
      title: isOwnCreatorProfile
        ? creatorDropTitle.trim() || DEFAULT_CREATOR_DROP_TITLE
        : publicCreatorProfile?.creatorDropTitle || `${creatorName}'s supporter drop`,
      description: isOwnCreatorProfile
        ? creatorDropDescription.trim() || DEFAULT_CREATOR_DROP_DESCRIPTION
        : publicCreatorProfile?.creatorDropDescription || `${fallbackProfile.intro} Fans can follow, like, and support the next release directly from this page.`,
      label: 'Featured drop',
      visibility: isOwnCreatorProfile
        ? creatorDropVisibility
        : publicCreatorProfile?.creatorDropVisibility === 'premium'
          ? 'premium'
          : 'public',
      accent: 'from-primary/35 via-emerald-400/10 to-transparent',
    };
    const creatorMoments = [
      ...(featuredDrop.visibility === 'public' ? [featuredDrop] : []),
      ...fallbackProfile.publicMoments.filter((moment) => moment.id !== featuredDrop.id),
    ].slice(0, 4);
    const isFollowingCreator = Boolean(creatorEngagement?.isFollowing);
    const isCreatorLiked = Boolean(creatorEngagement?.hasLikedCreator);
    const visibleFeaturedDrop = featuredDrop.visibility === 'public' || isPremium;
    const followerCount = formatCompactMetric(creatorEngagement?.followerCount ?? Math.round(fallbackProfile.totalViews / 180));
    const creatorLikeCount = formatCompactMetric(creatorEngagement?.creatorLikeCount ?? Math.round(fallbackProfile.totalLikes / 220));
    const supporterCount = formatCompactMetric((fallbackProfile.totalLikes / 950) + (supportUrl ? 14 : 6));
    const likedDropIds = new Set(creatorEngagement?.likedDropIds ?? []);

    return (
      <div className="px-4 py-8 md:py-12 max-w-6xl mx-auto w-full min-h-[60vh]">
        <Button variant="ghost" onClick={() => setCurrentView('series-details')} className="mb-6 -ml-4 gap-2">
          <ChevronRight className="w-4 h-4 rotate-180" /> Back to Series
        </Button>

        <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.18),transparent_38%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.16),transparent_32%),linear-gradient(135deg,#05070b_0%,#0f1117_45%,#090b0f_100%)] px-6 py-8 text-white shadow-[0_28px_110px_rgba(0,0,0,0.32)] md:px-10 md:py-12">
          <div className="absolute inset-0 opacity-20">
            <img
              src={selectedComic?.cover}
              alt={selectedComic?.title}
              className="h-full w-full object-cover mix-blend-screen"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="relative z-10 grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_340px]">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.35em] text-white/70">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Premium creator space
              </div>
              <div className="mb-6 flex items-center gap-4">
                <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-primary/25 bg-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
                  <img src={creatorAvatar || `https://picsum.photos/seed/${creatorName}/200/200`} alt={creatorName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.25em] text-primary/80">{fallbackProfile.tagline}</p>
                  <h1 className="mt-1 flex items-center gap-2 text-4xl font-black tracking-tight md:text-5xl">
                    {creatorName}
                    <BadgeCheck className="h-6 w-6 text-primary" />
                  </h1>
                </div>
              </div>

              <p className="max-w-2xl text-base leading-7 text-white/72 md:text-lg">
                {creatorBio}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  className={`rounded-full px-7 font-bold ${isFollowingCreator ? 'bg-white text-zinc-950 hover:bg-white/90' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
                  onClick={() => toggleCreatorFollow(creatorName)}
                >
                  <Users className="mr-2 h-4 w-4" /> {isFollowingCreator ? 'Following' : 'Follow'}
                </Button>
                <Button
                  variant="outline"
                  className={`rounded-full border-white/15 px-7 font-bold ${isCreatorLiked ? 'bg-white/12 text-white' : 'bg-transparent text-white'} hover:bg-white/10 hover:text-white`}
                  onClick={() => toggleCreatorLike(creatorName)}
                >
                  <Heart className={`mr-2 h-4 w-4 ${isCreatorLiked ? 'fill-current' : ''}`} /> {isCreatorLiked ? 'Liked' : 'Like creator'}
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full border-white/15 bg-transparent px-7 font-bold text-white hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => openSupportLink(supportUrl)}
                  disabled={!supportUrl}
                >
                  <DollarSign className="mr-2 h-4 w-4" /> Support
                </Button>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[24px] border border-white/10 bg-white/6 p-4 backdrop-blur-sm">
                  <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/45">Followers</p>
                  <p className="mt-3 text-3xl font-black">{followerCount}</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/6 p-4 backdrop-blur-sm">
                  <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/45">Creator likes</p>
                  <p className="mt-3 text-3xl font-black">{creatorLikeCount}</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/6 p-4 backdrop-blur-sm">
                  <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/45">Supporters</p>
                  <p className="mt-3 text-3xl font-black">{supporterCount}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-primary/75">{publicSupportHeadline}</p>
                  <h3 className="mt-2 text-2xl font-black">{featuredDrop.title}</h3>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 p-2">
                  {featuredDrop.visibility === 'premium' ? <Lock className="h-4 w-4 text-primary" /> : <Eye className="h-4 w-4 text-primary" />}
                </div>
              </div>
              <p className="text-sm leading-6 text-white/70">{featuredDrop.description}</p>

              <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-4">
                <div className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-[0.26em] text-white/45">
                  <span>{featuredDrop.visibility === 'premium' ? 'Premium drop' : 'Public drop'}</span>
                  <span>{featuredDrop.label}</span>
                </div>
                {visibleFeaturedDrop ? (
                  <p className="text-sm text-white/78">
                    Fans can open this drop, like it, and keep following the creator journey right from the profile page.
                  </p>
                ) : (
                  <p className="text-sm text-white/65">
                    This drop is premium-only. Fans can preview it here, then upgrade to Premium to unlock the full release.
                  </p>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  className="rounded-full bg-primary px-5 font-bold text-primary-foreground hover:bg-primary/90"
                  onClick={() => openSupportLink(supportUrl)}
                  disabled={!supportUrl}
                >
                  <ExternalLink className="mr-2 h-4 w-4" /> {supportUrl ? 'Open DropSomething' : 'Add support link'}
                </Button>
                {featuredDrop.visibility === 'premium' && !isPremium && (
                  <Button
                    variant="outline"
                    className="rounded-full border-white/15 bg-transparent px-5 font-bold text-white hover:bg-white/10 hover:text-white"
                    onClick={() => setCurrentView('premium')}
                  >
                    <BadgeCheck className="mr-2 h-4 w-4" /> Unlock with Premium
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-primary/70">Made public by creator</p>
                <h3 className="mt-2 text-3xl font-black tracking-tight">Public drops fans can like</h3>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {creatorMoments.map((moment) => {
                const isDropLiked = likedDropIds.has(moment.id);
                const momentLikeCount = creatorEngagement?.dropLikeCounts?.[moment.id] ?? 0;

                return (
                  <article key={moment.id} className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-zinc-950 text-white shadow-[0_16px_60px_rgba(0,0,0,0.18)]">
                    <div className={`absolute inset-0 bg-gradient-to-br ${moment.accent}`} />
                    <div className="relative p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.28em] text-white/60">{moment.label}</span>
                        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.26em] text-white/55">
                          {moment.visibility === 'premium' ? 'Premium' : 'Public'}
                        </span>
                      </div>
                      <h4 className="text-2xl font-black tracking-tight">{moment.title}</h4>
                      <p className="mt-3 text-sm leading-6 text-white/70">{moment.description}</p>
                      <div className="mt-6 flex items-center justify-between">
                        <Button
                          variant="outline"
                          className={`rounded-full border-white/15 bg-transparent px-4 font-bold text-white hover:bg-white/10 hover:text-white ${isDropLiked ? 'bg-white/12' : ''}`}
                          onClick={() => toggleCreatorDropLike(creatorName, moment.id)}
                        >
                          <Heart className={`mr-2 h-4 w-4 ${isDropLiked ? 'fill-current' : ''}`} />
                          {isDropLiked ? 'Liked' : 'Like'}
                        </Button>
                        <span className="text-xs font-medium uppercase tracking-[0.24em] text-white/45">
                          {momentLikeCount > 0 ? `${formatCompactMetric(momentLikeCount)} likes` : 'Fan signal'}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-[30px] border border-border bg-card p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-primary/70">Premium perks</p>
              <h3 className="mt-2 text-2xl font-black tracking-tight">Better access for top fans</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Follow creators, like their public drops, then unlock premium-only notes, previews, and supporter releases with Lemonade Premium.
              </p>
              {!isPremium && (
                <Button className="mt-5 w-full rounded-full font-bold" onClick={() => setCurrentView('premium')}>
                  Go Premium
                </Button>
              )}
            </div>

            <div className="rounded-[30px] border border-border bg-card p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-primary/70">Published work</p>
              <h3 className="mt-2 text-2xl font-black tracking-tight">Series by {creatorName}</h3>
              <div className="mt-5 space-y-3">
                {displayComics.slice(0, 4).map((comic) => (
                  <button
                    key={comic.id}
                    type="button"
                    className="flex w-full items-center gap-3 rounded-2xl border border-border p-2 text-left transition-colors hover:border-primary/40 hover:bg-muted/30"
                    onClick={() => openSeriesDetails(comic)}
                  >
                    <div className="h-16 w-12 overflow-hidden rounded-xl bg-muted">
                      <img src={comic.cover} alt={comic.title} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-bold">{comic.title}</p>
                      <p className="text-xs text-muted-foreground">{comic.genre}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </div>
    );
  };

  const renderPremium = () => (
    <div className="px-4 py-12 max-w-2xl mx-auto w-full min-h-[60vh]">
      <Button variant="ghost" onClick={() => setCurrentView('profile')} className="mb-6 -ml-4 gap-2">
        <ChevronRight className="w-4 h-4 rotate-180" /> Back to Profile
      </Button>
      
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <BadgeCheck className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-black tracking-tighter mb-4 uppercase">Lemonade Premium</h1>
        <p className="text-muted-foreground text-lg">Get verified, remove ads, and support creators.</p>
      </div>

      <div className="space-y-4 mb-12">
        <Card className="p-6 border-2 border-primary bg-primary/5">
          <div className="flex items-center gap-4 mb-4">
            <BadgeCheck className="w-6 h-6 text-primary" />
            <h3 className="font-bold text-xl">Verification Badge</h3>
          </div>
          <p className="text-muted-foreground">Stand out in the comments and on your profile with a verified checkmark.</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <SkipForward className="w-6 h-6 text-primary" />
            <h3 className="font-bold text-xl">Ad-Free Reading</h3>
          </div>
          <p className="text-muted-foreground">Enjoy uninterrupted reading. Skip the countdowns and dive straight into the story.</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <Heart className="w-6 h-6 text-primary" />
            <h3 className="font-bold text-xl">Support Creators</h3>
          </div>
          <p className="text-muted-foreground">A portion of your subscription goes directly to the creators you read the most.</p>
        </Card>
      </div>

      <div className="bg-muted/30 p-6 rounded-2xl text-center">
        <p className="text-3xl font-black mb-2">$8.00<span className="text-sm text-muted-foreground font-normal">/month</span></p>
        <p className="text-sm text-muted-foreground mb-6">Cancel anytime.</p>
        <Button 
          className="w-full rounded-full py-6 font-bold text-lg bg-primary hover:bg-primary-dark text-primary-foreground"
          onClick={() => {
            setIsPremium(true);
            setCurrentView('profile');
          }}
        >
          Subscribe Now
        </Button>
      </div>
    </div>
  );

  const renderAdOverlay = () => {
    if (!showAd) return null;

    // Generate a random seed for the ad image so it changes
    const adSeed = Math.floor(Math.random() * 1000);

    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <img src={`https://picsum.photos/seed/ad-bg-${adSeed}/1920/1080`} alt="Ad Background" className="w-full h-full object-cover blur-xl" referrerPolicy="no-referrer" />
        </div>
        
        <div className="relative z-10 w-full max-w-4xl aspect-video bg-zinc-900 rounded-xl overflow-hidden shadow-2xl border border-white/10 group">
          <img src={`https://picsum.photos/seed/ad-video-${adSeed}/1280/720`} alt="Ad Content" className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <Play className="w-20 h-20 text-white/50 group-hover:text-white transition-colors" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
            <Badge className="mb-2 bg-primary text-primary-foreground font-bold uppercase">SPONSORED</Badge>
            <h2 className="text-2xl font-bold text-white mb-1">Lemonade Premium</h2>
            <p className="text-white/80 text-sm">Read all your favorite comics without any ads! Get verified today.</p>
          </div>
          
          <div className="absolute top-4 right-4">
            {adTimeLeft > 0 ? (
              <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs font-bold border border-white/10">
                Ad ends in {adTimeLeft}s
              </div>
            ) : (
              <Button 
                onClick={skipAd}
                className="bg-white text-black hover:bg-zinc-200 rounded-full font-bold flex items-center gap-2 px-6 py-6 shadow-xl"
              >
                Skip Ad <SkipForward className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="mt-8 text-white/40 text-[10px] uppercase tracking-widest font-bold">
          Advertisement • Lemonade Ads
        </div>
      </div>
    );
  };

    return (
    <div className="min-h-screen bg-zinc-950 text-white dark">
      {/* Header / Navigation */}
      <nav className="sticky top-0 z-[60] w-full border-b border-white/5 bg-zinc-950/90 backdrop-blur-xl h-[5rem]">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 md:px-6 lg:px-10">
          {/* Mobile Header Structure (Matching Screenshot) */}
          <div className="flex md:hidden items-center justify-between w-full">
            <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
              <SheetTrigger className="rounded-full">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] border-white/10 bg-zinc-950 p-0 text-white">
                <div className="border-b border-white/10 px-6 py-5">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-primary/15 p-2">
                      <Menu className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">Navigation</p>
                      <p className="text-lg font-black tracking-tight">Lemonade</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 p-4">
                  <button
                    type="button"
                    onClick={() => handleMobileNavSelect('home')}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-bold transition-colors ${currentView === 'home' ? 'bg-primary text-primary-foreground' : 'text-zinc-300 hover:bg-white/5 hover:text-white'}`}
                  >
                    <Home className="h-4 w-4" />
                    Home
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMobileNavSelect('manga')}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-bold transition-colors ${currentView === 'manga' ? 'bg-primary text-primary-foreground' : 'text-zinc-300 hover:bg-white/5 hover:text-white'}`}
                  >
                    <Compass className="h-4 w-4" />
                    Originals
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMobileNavSelect('novels')}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-bold transition-colors ${currentView === 'novels' ? 'bg-primary text-primary-foreground' : 'text-zinc-300 hover:bg-white/5 hover:text-white'}`}
                  >
                    <BookOpen className="h-4 w-4" />
                    Novels
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileNavOpen(false);
                      handleMyClick();
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-bold transition-colors ${currentView === 'my' ? 'bg-primary text-primary-foreground' : 'text-zinc-300 hover:bg-white/5 hover:text-white'}`}
                  >
                    <Heart className="h-4 w-4" />
                    Library
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileNavOpen(false);
                      handlePublishClick();
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-bold text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <PenTool className="h-4 w-4" />
                    Publish
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileNavOpen(false);
                      handleProfileClick();
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-bold text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <User className="h-4 w-4" />
                    {isLoggedIn ? 'Profile' : 'Sign Up / Log In'}
                  </button>
                </div>
              </SheetContent>
            </Sheet>
            
            <div className="relative group cursor-pointer" onClick={() => setCurrentView('home')}>
              <div className="absolute inset-0 bg-primary -skew-x-[15deg] transform -translate-y-0.5" />
              <div className="relative px-6 py-1 flex items-center justify-center">
                <span className="text-white font-black italic tracking-tighter text-xl">LEMONADE</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="text-white" onClick={() => setCurrentView('search')}>
                <Search className="w-6 h-6" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white" onClick={handleProfileClick}>
                <User className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Desktop Header Structure */}
          <div className="hidden md:flex items-center gap-12 h-full">
            <Logo onClick={() => setCurrentView('home')} className="hover:opacity-80 transition-opacity" />
            
            <div className="flex items-center gap-8 font-black text-[13px] uppercase tracking-widest h-full">
              <div 
                onClick={() => setCurrentView('home')}
                className={`relative h-full flex items-center cursor-pointer transition-colors pt-0.5 ${currentView === 'home' ? 'text-primary' : 'text-zinc-400 hover:text-white'}`}
              >
                Home
                {currentView === 'home' && <motion.div layoutId="nav-pill" className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full" />}
              </div>
              <div 
                onClick={() => setCurrentView('manga')}
                className={`relative h-full flex items-center cursor-pointer transition-colors pt-0.5 ${currentView === 'manga' ? 'text-primary' : 'text-zinc-400 hover:text-white'}`}
              >
                Originals
                {currentView === 'manga' && <motion.div layoutId="nav-pill" className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full" />}
              </div>
              <div 
                onClick={() => setCurrentView('novels')}
                className={`relative h-full flex items-center cursor-pointer transition-colors pt-0.5 ${currentView === 'novels' ? 'text-primary' : 'text-zinc-400 hover:text-white'}`}
              >
                Novels
                {currentView === 'novels' && <motion.div layoutId="nav-pill" className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full" />}
              </div>
              <div 
                onClick={handleMyClick}
                className={`relative h-full flex items-center cursor-pointer transition-colors pt-0.5 ${currentView === 'my' ? 'text-primary' : 'text-zinc-400 hover:text-white'}`}
              >
                Library
                {currentView === 'my' && <motion.div layoutId="nav-pill" className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full" />}
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 md:gap-4">
            <Button 
               variant="ghost" 
               size="icon" 
               className={`rounded-full transition-colors ${currentView === 'search' ? 'text-primary bg-primary/10' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
               onClick={() => setCurrentView('search')}
            >
               <Search className="w-5 h-5" />
            </Button>
            {!isLoggedIn && (
               <Button
                 variant="outline"
                 className="rounded-full font-bold px-6 border-white/10 text-white hover:bg-white/10 transition-colors"
                 onClick={openSignupModal}
               >
                 Sign Up
               </Button>
            )}
            <Button 
               className="rounded-full font-black tracking-wide px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_4px_14px_rgba(30,215,96,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(30,215,96,0.4)]"
               onClick={handlePublishClick}
            >
               Publish
            </Button>
            <Button 
               variant="ghost" 
               size="icon" 
               className={`rounded-full transition-colors ${currentView === 'profile' || currentView === 'auth' ? 'text-primary bg-primary/10' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
               onClick={handleProfileClick}
            >
               <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </nav>

      <main>
        {currentView === 'home' && renderHome()}
        {currentView === 'manga' && renderOriginals()}
        {currentView === 'novels' && renderNovels()}
        {currentView === 'admin' && renderAdmin()}
        {currentView === 'my' && renderMy()}
        {currentView === 'search' && renderSearch()}
        {currentView === 'view-all' && renderViewAll()}
        {currentView === 'publish' && renderPublish()}
        {currentView === 'publish-dashboard' && renderPublishDashboard()}
        {currentView === 'publish-new' && renderPublishNew()}
        {currentView === 'publish-episode' && renderPublishEpisode()}
        {currentView === 'edit-series' && renderEditSeries()}
        {currentView === 'profile' && renderProfile()}
        {currentView === 'edit-profile' && renderEditProfile()}
        {currentView === 'wallet' && renderWallet()}
        {currentView === 'email-preferences' && renderEmailPreferences()}
        {currentView === 'privacy-settings' && renderPrivacySettings()}
        {currentView === 'premium' && renderPremium()}
        {currentView === 'series-details' && renderSeriesDetails()}
        {currentView === 'creator-profile' && renderCreatorProfile()}
        {currentView === 'auth' && renderAuth()}
        {currentView === 'ads-manager' && renderAdsManager()}
        {currentView === 'create-campaign' && renderCreateCampaign()}
        {currentView === 'reader' && renderReader()}
      </main>

      <AuthModal
        open={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setCurrentView('my')}
        defaultView={authMode === 'signup' ? 'create-account' : 'login'}
      />

      {showAd && renderAdOverlay()}

      {/* Footer */}
      <footer className="bg-zinc-50 dark:bg-zinc-900 border-t border-border py-12 px-4 flex flex-col items-center text-center">
        <div className="flex gap-6 mb-8">
          <a href="#" className="text-zinc-800 dark:text-zinc-200 hover:text-primary">
            <Facebook className="w-7 h-7" />
          </a>
          <a href="#" className="text-zinc-800 dark:text-zinc-200 hover:text-primary">
            <Instagram className="w-7 h-7" />
          </a>
          <a href="#" className="text-zinc-800 dark:text-zinc-200 hover:text-primary">
            <Twitter className="w-7 h-7" />
          </a>
          <a href="#" className="text-zinc-800 dark:text-zinc-200 hover:text-primary">
            <Youtube className="w-7 h-7" />
          </a>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-2 text-xs text-muted-foreground mb-8 font-medium uppercase tracking-wider">
          <a href="#" className="hover:text-foreground">About</a>
          <span className="text-border">|</span>
          <a href="#" className="hover:text-foreground">Feedback</a>
          <span className="text-border">|</span>
          <a href="#" className="hover:text-foreground">Help</a>
          <span className="text-border">|</span>
          <a href="#" className="hover:text-foreground">Terms</a>
          <span className="text-border">|</span>
          <a href="#" className="hover:text-foreground">Privacy</a>
          <span className="text-border">|</span>
          <a href="#" className="hover:text-foreground">Advertise</a>
          <span className="text-border">|</span>
          <a href="#" className="hover:text-foreground">Contact</a>
        </div>

        <div className="flex flex-col items-center gap-3">
          <Logo onClick={() => setCurrentView('home')} />
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-primary gap-2"
            onClick={() => setCurrentView('admin')}
          >
            <ShieldCheck className="w-3 h-3" /> Admin Access
          </Button>
          <p className="text-xs text-muted-foreground">
            ⓒ LEMONADE Entertainment Ltd.
          </p>
        </div>
      </footer>
    </div>
  );
}

