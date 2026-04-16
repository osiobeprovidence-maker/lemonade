import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Heart, ChevronRight, Menu, Bell, User, Star, Clock, Home, Compass, PenTool, Facebook, Twitter, Instagram, Youtube, Plus, X, Play, SkipForward, DollarSign, BarChart3, Settings, BadgeCheck, Share2, MoreVertical, List, Check, Upload, BookOpen, ShieldCheck, Users, MessageSquare, Flag, Megaphone, Trash2, Eye, EyeOff, Settings2, Film, Sparkles, Tv, Zap } from 'lucide-react';
import { Logo } from './components/Logo';

const COMICS = [
  { id: 1, title: "Surviving the Game as a Barbarian", creator: "K. Ryo", emotion: "Fantasy", genre: "Fantasy", cover: "https://picsum.photos/seed/barbarian/400/533", rankChange: 37, views: "53M", likes: "1.2M", day: "Mon", isNew: true, isOriginal: true, type: 'webtoon' },
  { id: 2, title: "The Knight Only Lives Today", creator: "Ami", emotion: "Fantasy", genre: "Fantasy", cover: "https://picsum.photos/seed/knight/400/533", rankChange: 34, views: "12M", likes: "800K", day: "Tue", isNew: false, isOriginal: true, type: 'webtoon' },
  { id: 3, title: "For Your Murder", creator: "J.D.", emotion: "Drama", genre: "Drama", cover: "https://picsum.photos/seed/murder/400/533", rankChange: -2, views: "315K", likes: "174K", day: "Wed", isNew: true, isOriginal: false, type: 'webtoon' },
  { id: 4, title: "Falling For It", creator: "S. Lin", emotion: "Romance", genre: "Romance", cover: "https://picsum.photos/seed/falling/400/533", rankChange: 31, views: "675K", likes: "388K", day: "Thu", isNew: false, isOriginal: true, type: 'webtoon' },
  { id: 5, title: "Return of the Blossoming Blade", creator: "T.K.", emotion: "Action", genre: "Action", cover: "https://picsum.photos/seed/blade/400/533", rankChange: 27, views: "194M", likes: "1.1M", day: "Fri", isNew: true, isOriginal: true, type: 'webtoon' },
  { id: 6, title: "Undercover Wife", creator: "Lila", emotion: "Romance", genre: "Romance", cover: "https://picsum.photos/seed/wife/400/533", rankChange: -4, views: "4M", likes: "232K", day: "Sat", isNew: false, isOriginal: false, type: 'webtoon' },
  { id: 7, title: "The Price Is Your Everything", creator: "Webtoon", emotion: "Drama", genre: "Drama", cover: "https://picsum.photos/seed/price/400/533", rankChange: 10, views: "53M", likes: "1.3M", day: "Sun", isNew: true, isOriginal: true, type: 'webtoon' },
  { id: 8, title: "Daytime in the Bunker", creator: "Webtoon", emotion: "Drama", genre: "Drama", cover: "https://picsum.photos/seed/bunker/400/533", rankChange: 5, views: "315K", likes: "174K", day: "Sun", isNew: true, isOriginal: true, type: 'webtoon' },
  { id: 9, title: "My Wavering Husband", creator: "Webtoon", emotion: "Drama", genre: "Drama", cover: "https://picsum.photos/seed/wavering/400/533", rankChange: 2, views: "675K", likes: "388K", day: "Sun", isNew: true, isOriginal: true, type: 'webtoon' },
  { id: 10, title: "Acception", creator: "Webtoon", emotion: "Drama", genre: "Drama", cover: "https://picsum.photos/seed/acception/400/533", rankChange: -1, views: "194M", likes: "1.1M", day: "Sun", isNew: false, isOriginal: true, type: 'webtoon' },
  { id: 11, title: "Adopting a Zombie", creator: "Webtoon", emotion: "Drama", genre: "Drama", cover: "https://picsum.photos/seed/zombie/400/533", rankChange: 0, views: "4M", likes: "232K", day: "Sun", isNew: false, isOriginal: true, type: 'webtoon' },
  { id: 12, title: "Behind Her Highness's Smile", creator: "Webtoon", emotion: "Drama", genre: "Drama", cover: "https://picsum.photos/seed/smile/400/533", rankChange: 12, views: "28M", likes: "1.3M", day: "Sun", isNew: false, isOriginal: true, type: 'webtoon' },
];

const NOVELS = [
  { id: 101, title: "The Alchemist of Lemonade", creator: "Novel Master", genre: "Fantasy", cover: "https://picsum.photos/seed/novel-1/400/533", views: "1.2M", likes: "45K", type: 'novel', summary: "A young alchemist discovers the secret to the ultimate lemonade, which grants magical powers." },
  { id: 102, title: "Shadow of the Citrus", creator: "Sour King", genre: "Action", cover: "https://picsum.photos/seed/novel-2/400/533", views: "800K", likes: "32K", type: 'novel', summary: "In a world where fruit is power, one warrior fights to protect the last Novel tree." },
  { id: 103, title: "Sweet Revenge", creator: "Sugar Queen", genre: "Drama", cover: "https://picsum.photos/seed/novel-3/400/533", views: "2.5M", likes: "120K", type: 'novel', summary: "A high society drama about betrayal and the sweetest comeback ever told." },
  { id: 104, title: "Lemonade Stand Hero", creator: "Zest", genre: "Comedy", cover: "https://picsum.photos/seed/novel-4/400/533", views: "1.5M", likes: "88K", type: 'novel', summary: "A hilarious journey of a boy trying to build a lemonade empire in his backyard." },
  { id: 105, title: "The Last Zest", creator: "Pulp", genre: "Sci-fi", cover: "https://picsum.photos/seed/novel-5/400/533", views: "600K", likes: "15K", type: 'novel', summary: "In a post-apocalyptic future, the last remaining Novel is the key to humanity's survival." },
];

const MOVIES = [
  { id: 201, title: "Crimson Orbit", type: "Series", genre: "Sci-Fi", maturity: "16+", runtime: "2 Seasons", badge: "Top 10", year: "2026", backdrop: "https://picsum.photos/seed/crimson-orbit/1600/900", poster: "https://picsum.photos/seed/crimson-orbit-poster/400/600", summary: "A washed-up mech pilot and a runaway princess cross a war-torn galaxy to stop an empire built on memory theft." },
  { id: 202, title: "Ashes of Kyoto", type: "Movie", genre: "Action", maturity: "13+", runtime: "1h 58m", badge: "New", year: "2026", backdrop: "https://picsum.photos/seed/ashes-kyoto/1600/900", poster: "https://picsum.photos/seed/ashes-kyoto-poster/400/600", summary: "When ancient spirits rise beneath neon streets, one exorcist must choose between revenge and saving the city." },
  { id: 203, title: "Blue Locker Room", type: "Series", genre: "Sports", maturity: "13+", runtime: "24 Episodes", badge: "Trending", year: "2025", backdrop: "https://picsum.photos/seed/blue-locker/1600/900", poster: "https://picsum.photos/seed/blue-locker-poster/400/600", summary: "A ruthless football academy turns gifted teenagers into stars by making every match feel like survival." },
  { id: 204, title: "Moon Thread", type: "Movie", genre: "Fantasy", maturity: "PG-13", runtime: "2h 11m", badge: "Exclusive", year: "2026", backdrop: "https://picsum.photos/seed/moon-thread/1600/900", poster: "https://picsum.photos/seed/moon-thread-poster/400/600", summary: "A seamstress who can stitch fate itself is hunted by a kingdom afraid of the future she can rewrite." },
  { id: 205, title: "Zero Signal", type: "Series", genre: "Thriller", maturity: "18+", runtime: "10 Episodes", badge: "Hot", year: "2025", backdrop: "https://picsum.photos/seed/zero-signal/1600/900", poster: "https://picsum.photos/seed/zero-signal-poster/400/600", summary: "A pirate broadcast reveals the truth behind a global blackout, turning every viewer into a target." },
  { id: 206, title: "Lotus Rebellion", type: "Series", genre: "Adventure", maturity: "16+", runtime: "3 Seasons", badge: "Fan Pick", year: "2024", backdrop: "https://picsum.photos/seed/lotus-rebellion/1600/900", poster: "https://picsum.photos/seed/lotus-rebellion-poster/400/600", summary: "Across floating kingdoms, a rebel crew steals sacred relics before the royal court can weaponize them." },
];

const MOCK_USERS = [
  { id: 1, name: "riderezzy@gmail.com", role: "Admin", status: "Active", joined: "2024-01-15" },
  { id: 2, name: "lemon_fan_99", role: "User", status: "Active", joined: "2024-02-10" },
  { id: 3, name: "toxic_reader", role: "User", status: "Banned", joined: "2024-03-01" },
  { id: 4, name: "creative_soul", role: "Creator", status: "Active", joined: "2024-01-20" },
];

const ADMIN_ADS = [
  { id: 1, title: "Summer Sale", status: "Active", views: "1.2M", clicks: "45K", image: "https://picsum.photos/seed/ad1/800/400" },
  { id: 2, title: "New Series Launch", status: "Scheduled", views: "0", clicks: "0", image: "https://picsum.photos/seed/ad2/800/400" },
];

const CATEGORIES = ['Drama', 'Fantasy', 'Comedy', 'Action', 'Slice of life', 'Romance', 'Superhero', 'Sci-fi'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Completed'];
const EMOTIONS = ['Sweet', 'Bitter', 'Raw', 'Explosive'];

export default function App() {
  const { user, logout, userProfile } = useAuth();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('home');
  const [activeCategory, setActiveCategory] = useState('Drama');
  const [activeDay, setActiveDay] = useState('Sun');
  const [searchQuery, setSearchQuery] = useState('');
  const isLoggedIn = !!user;
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [creatorType, setCreatorType] = useState<'original' | 'self' | null>(null);
  const [dashboardTab, setDashboardTab] = useState<'series' | 'monetization' | 'stats'>('series');
  const [selectedComic, setSelectedComic] = useState<any>(null);
  const [showAd, setShowAd] = useState(false);
  const [adTimeLeft, setAdTimeLeft] = useState(5);

  // Profile States
  const [userName, setUserName] = useState('Lemonade Reader');
  const [userBio, setUserBio] = useState('');
  const [userProfilePic, setUserProfilePic] = useState<string | null>(null);
  const [dropSomethingLink, setDropSomethingLink] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [likedComics, setLikedComics] = useState<Set<number>>(new Set());
  const [isReaderMenuOpen, setIsReaderMenuOpen] = useState(false);

  // Admin & Novel States
  const [adminTab, setAdminTab] = useState<'dashboard' | 'users' | 'moderation' | 'ads'>('dashboard');
  const [activeLemonCategory, setActiveLemonCategory] = useState('Drama');
  const [previousView, setPreviousView] = useState('home');
  const [comments, setComments] = useState<Record<number, any[]>>({
    1: [
      { id: 1, user: "LemonLover", text: "This is amazing!", likes: 12, date: "2h ago" },
      { id: 2, user: "CitrusFan", text: "Can't wait for the next chapter!", likes: 5, date: "5h ago" }
    ]
  });
  const [newComment, setNewComment] = useState('');
  const [publishType, setPublishType] = useState<'webtoon' | 'novel'>('webtoon');
  const featuredMovie = MOVIES[0];
  const spotlightMovie = MOVIES[1];
  const isMovieView = currentView === 'home';

  const toggleLike = (comicId: number) => {
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

  const startReading = (comic: any) => {
    setSelectedComic(comic);
    if (comic.type === 'novel') {
      setCurrentView('novel-reader');
    } else {
      setCurrentView('reader');
    }
    
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

  const openSeriesDetails = (comic: any) => {
    setSelectedComic(comic);
    setCurrentView('series-details');
  };

  const skipAd = () => {
    setShowAd(false);
    setCurrentView('reader');
  };

  const filteredComics = COMICS.filter(comic => 
    comic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    comic.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProfileClick = () => {
    if (isLoggedIn) {
      setCurrentView('profile');
    } else {
      navigate('/login');
    }
  };

  const handleMyClick = () => {
    if (isLoggedIn) {
      setCurrentView('my');
    } else {
      navigate('/login');
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
      navigate('/login');
    }
  };

  const renderMovieRail = (title: string, items: typeof MOVIES, accent?: string) => (
    <section className="px-4 md:px-6 lg:px-8 mb-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/40 font-bold mb-2">{accent || 'Stream now'}</p>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">{title}</h2>
          </div>
          <button className="text-sm font-semibold text-white/70 hover:text-white transition-colors">See all</button>
        </div>
        <div className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar pb-2">
          {items.map((movie) => (
            <article key={movie.id} className="group relative w-[220px] md:w-[260px] lg:w-[300px] shrink-0 overflow-hidden rounded-md md:rounded-lg">
              <div className="relative aspect-video overflow-hidden rounded-md md:rounded-lg bg-white/5">
                <img src={movie.backdrop} alt={movie.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-[#46b653] text-white border-none uppercase text-[10px] tracking-widest">{movie.badge}</Badge>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-3 md:p-4">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-white/60 font-bold mb-2">
                    <span>{movie.type}</span>
                    <span>{movie.year}</span>
                    <span>{movie.maturity}</span>
                  </div>
                  <h3 className="text-white font-black text-lg leading-tight mb-1">{movie.title}</h3>
                  <p className="text-white/70 text-sm">{movie.genre} • {movie.runtime}</p>
                </div>
                <button className="absolute right-3 bottom-3 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );

  const renderMoviesHome = () => (
    <div className="bg-[#06070b] text-white pb-16">
      <section className="relative min-h-[82vh] overflow-hidden">
        <img src={featuredMovie.backdrop} alt={featuredMovie.title} className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(70,182,83,0.22),transparent_28%),linear-gradient(180deg,rgba(5,6,10,0.18)_0%,rgba(5,6,10,0.46)_18%,rgba(5,6,10,0.78)_55%,rgba(5,6,10,0.98)_100%),linear-gradient(90deg,rgba(3,4,8,0.96)_0%,rgba(3,4,8,0.68)_35%,rgba(3,4,8,0.24)_58%,rgba(3,4,8,0.82)_100%)]" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-28 md:pt-32 pb-28 md:pb-36 grid lg:grid-cols-[1.05fr_360px] gap-10 items-end min-h-[82vh]">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <Badge className="bg-[#46b653] text-white border-none uppercase tracking-[0.22em] px-4 py-1.5">Anime Premiere</Badge>
              <span className="text-xs uppercase tracking-[0.28em] text-white/55 font-bold">Movies • Manga / Manwha • Novel</span>
            </div>
            <p className="text-[10px] md:text-xs uppercase tracking-[0.38em] text-white/55 font-bold mb-3">Featured this week</p>
            <h1 className="text-5xl md:text-7xl font-black tracking-[-0.05em] leading-[0.88] mb-4">{featuredMovie.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-white/80 mb-5">
              <span className="text-[#46b653]">{featuredMovie.badge}</span>
              <span>{featuredMovie.year}</span>
              <span>{featuredMovie.maturity}</span>
              <span>{featuredMovie.runtime}</span>
              <span>{featuredMovie.genre}</span>
            </div>
            <p className="text-lg md:text-xl text-white/72 max-w-xl leading-relaxed mb-7">{featuredMovie.summary}</p>
            <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-8">
              <Button size="lg" className="rounded-full px-8 h-12 bg-white text-black hover:bg-white/90 font-bold gap-2">
                <Play className="w-4 h-4 fill-current" /> Watch Now
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 h-12 border-white/20 bg-white/15 text-white hover:bg-white/20 gap-2">
                <Film className="w-4 h-4" /> More Info
              </Button>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-white/72">
              <div className="flex items-center gap-2"><Tv className="w-4 h-4 text-[#46b653]" /> Stream anime movies and series</div>
              <div className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-[#46b653]" /> Continue into manga / manwha</div>
              <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-[#46b653]" /> Cleaner browse navigation</div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-black/30 backdrop-blur-md p-5 shadow-[0_25px_120px_rgba(0,0,0,0.45)]">
            <div className="aspect-video rounded-[1.25rem] overflow-hidden mb-5 relative">
              <img src={spotlightMovie.backdrop} alt={spotlightMovie.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-white/55 font-bold mb-1">Tonight's spotlight</p>
                  <h3 className="text-2xl font-black">{spotlightMovie.title}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-white/5 p-3 border border-white/10">
                <p className="text-2xl font-black">320+</p>
                <p className="text-[10px] uppercase tracking-[0.25em] text-white/45 font-bold mt-1">Anime titles</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-3 border border-white/10">
                <p className="text-2xl font-black">48</p>
                <p className="text-[10px] uppercase tracking-[0.25em] text-white/45 font-bold mt-1">Premieres</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-3 border border-white/10">
                <p className="text-2xl font-black">12</p>
                <p className="text-[10px] uppercase tracking-[0.25em] text-white/45 font-bold mt-1">Genres</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 md:px-6 lg:px-8 -mt-20 relative z-10 mb-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-[1.1fr_1fr_1fr] gap-3 md:gap-4">
            {[
              { label: 'Now Streaming', value: 'Anime films, prestige series, and weekly drops all on the first screen.' },
              { label: 'Manga / Manwha', value: 'Move into the reading catalog without losing the same platform navigation.' },
              { label: 'Novel', value: 'Keep text-first storytelling alongside movies without feeling like a separate product.' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-black/45 backdrop-blur-md px-5 py-4">
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/45 font-bold mb-2">{item.label}</p>
                <p className="text-sm text-white/72 leading-relaxed">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {renderMovieRail('Trending Anime Tonight', MOVIES, 'Most watched now')}
      {renderMovieRail('Cinematic Worlds', [MOVIES[1], MOVIES[3], MOVIES[0], MOVIES[5], MOVIES[2], MOVIES[4]], 'Movies and prestige series')}
      {renderMovieRail('Pulse-Pounding Action', [MOVIES[4], MOVIES[2], MOVIES[1], MOVIES[5], MOVIES[0], MOVIES[3]], 'Fast, loud, addictive')}
    </div>
  );

  const renderHome = () => (
    <>
      {/* Hero Banner */}
      <div className="relative h-[400px] w-full overflow-hidden mb-12">
        <img 
          src="https://picsum.photos/seed/lemonade-hero/1920/1080" 
          alt="Home Banner" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8 max-w-2xl">
          <Badge className="mb-4 bg-foreground text-background font-bold uppercase">Now on LEMONADE</Badge>
          <h1 
            className="text-5xl font-black tracking-tighter mb-4 uppercase text-foreground"
            style={{
              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
            }}
          >
            Read the latest hits!
          </h1>
          <p className="text-lg text-muted-foreground mb-6 font-medium">Tap to read stories on LEMONADE!</p>
          <Button size="lg" className="rounded-full px-8 font-bold gap-2" onClick={() => setCurrentView('originals')}>
            <Play className="w-5 h-5" /> Start Reading
          </Button>
        </div>
      </div>

      {/* Trending Section */}
      <div className="px-4 py-2 mb-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black tracking-tighter flex items-center gap-2">
            <span className="text-foreground font-bold uppercase">Trending</span> & POPULAR SERIES
          </h2>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="flex gap-2 mb-4">
          <Badge className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-4 py-1.5 text-sm font-bold cursor-pointer">Trending</Badge>
          <Badge variant="secondary" className="bg-muted text-foreground hover:bg-muted/90 rounded-full px-4 py-1.5 text-sm font-bold cursor-pointer">Popular</Badge>
        </div>
        
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-2 gap-y-6">
          {COMICS.slice(0, 6).map((comic, index) => (
            <div key={comic.id} className="flex flex-col cursor-pointer group" onClick={() => openSeriesDetails(comic)}>
              <div className="relative aspect-[3/4] rounded-md mb-1">
                <img src={comic.cover} alt={comic.title} className="w-full h-full object-cover rounded-md" referrerPolicy="no-referrer" />
                
                {/* Massive Number */}
                <div className="comic-number absolute -bottom-3 -left-1 text-[60px] font-black leading-none z-10 tracking-tighter">
                  {index + 1}
                </div>
                
                {/* Rank indicator */}
                <div className="absolute -bottom-1 left-9 z-10 flex items-center bg-background/90 px-1 rounded text-[11px] font-bold">
                  {comic.rankChange > 0 ? (
                    <span className="text-primary flex items-center"><span className="text-[8px] mr-0.5">▲</span>{comic.rankChange}</span>
                  ) : (
                    <span className="text-muted-foreground flex items-center"><span className="text-[8px] mr-0.5">▼</span>{Math.abs(comic.rankChange)}</span>
                  )}
                </div>
              </div>
              <h3 className="font-bold text-sm leading-tight line-clamp-2 mt-3 group-hover:text-primary transition-colors">{comic.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{comic.emotion}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Series by Category */}
      <div className="px-4 py-2 mb-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black tracking-tighter flex items-center gap-2">
            <span className="text-foreground font-bold uppercase">Popular</span> SERIES BY CATEGORY
          </h2>
          <div className="flex items-center gap-1 text-muted-foreground text-sm cursor-pointer hover:text-foreground">
            View all <ChevronRight className="w-4 h-4" />
          </div>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-6 no-scrollbar mb-8 border-b border-border">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeCategory === category ? 'bg-primary-dark text-primary-foreground' : 'bg-muted hover:bg-muted/80 text-muted-foreground'}`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-2 gap-y-6">
          {COMICS.filter(c => c.genre === activeCategory || activeCategory === 'Drama').slice(0, 6).map((comic) => (
            <div key={comic.id} className="flex flex-col cursor-pointer group" onClick={() => openSeriesDetails(comic)}>
              <div className="relative aspect-[3/4] rounded-md mb-2 overflow-hidden">
                <img src={comic.cover} alt={comic.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" referrerPolicy="no-referrer" />
                {comic.isNew && (
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
                    New Series
                  </div>
                )}
              </div>
              <h3 className="font-bold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">{comic.title}</h3>
              <p className="text-[11px] text-muted-foreground mt-1">{comic.views} Views</p>
            </div>
          ))}
        </div>
      </div>

      {/* Newly Released Originals */}
      <div className="px-4 py-2 mb-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black tracking-tighter flex items-center gap-2">
            <span className="text-foreground font-bold uppercase">Newly</span> RELEASED ORIGINALS
          </h2>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-2 gap-y-6">
          {COMICS.filter(c => c.isNew).slice(0, 6).map((comic) => (
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

      {/* Daily Section */}
      <div className="px-4 py-2 mb-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black tracking-tighter flex items-center gap-2">
            <span className="text-foreground font-bold uppercase">Daily</span> UPDATES
          </h2>
          <div className="flex items-center gap-1 text-muted-foreground text-sm cursor-pointer hover:text-foreground">
            View all <ChevronRight className="w-4 h-4" />
          </div>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-6 no-scrollbar mb-8 border-b border-border">
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeDay === day ? 'bg-primary-dark text-primary-foreground' : 'bg-muted hover:bg-muted/80 text-muted-foreground'}`}
            >
              {day}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-2 gap-y-8">
          {COMICS.filter(c => c.day === activeDay || activeDay === 'Sun').slice(0, 12).map((comic) => (
            <div key={comic.id} className="flex flex-col cursor-pointer group" onClick={() => openSeriesDetails(comic)}>
              <div className="relative aspect-[3/4] rounded-md mb-2 overflow-hidden">
                <img src={comic.cover} alt={comic.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" referrerPolicy="no-referrer" />
                {comic.isNew && (
                  <div className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    New Episode
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
    </>
  );

  const renderOriginals = () => (
    <div className="pb-20">
      <div className="relative h-[400px] w-full overflow-hidden mb-12">
        <img 
          src="https://picsum.photos/seed/originals-hero/1920/1080" 
          alt="Featured Original" 
          className="w-full h-full object-cover" 
          referrerPolicy="no-referrer" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8 max-w-2xl">
          <Badge className="mb-4 bg-foreground text-background font-bold uppercase">Featured Manga / Manwha</Badge>
          <h1 
            className="text-5xl font-black tracking-tighter mb-4 uppercase text-foreground"
            style={{
              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
            }}
          >
            The Price Is Your Everything
          </h1>
          <p className="text-lg text-muted-foreground mb-6 font-medium">A reading-first destination for manga and manwha with weekly drops, high-performing romance, action, and drama titles.</p>
          <Button size="lg" className="rounded-full px-8 font-bold gap-2" onClick={() => openSeriesDetails(COMICS[6])}>
            <Play className="w-5 h-5" /> Start Reading
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Weekly Schedule Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-6 no-scrollbar mb-8 border-b border-border">
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeDay === day ? 'bg-primary-dark text-primary-foreground' : 'bg-muted hover:bg-muted/80 text-muted-foreground'}`}
            >
              {day}
            </button>
          ))}
        </div>

        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black tracking-tighter flex items-center gap-2">
              <span className="text-foreground font-bold uppercase">Manga / Manwha</span>
            </h2>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-2 gap-y-8">
            {COMICS.filter(c => c.isOriginal && (c.day === activeDay || activeDay === 'Sun')).map((comic) => (
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
          <h2 className="text-2xl font-black tracking-tighter flex items-center gap-2 mb-8">
            <span className="text-foreground font-bold uppercase">All</span> MANGA / MANWHA
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-2 gap-y-8">
            {COMICS.filter(c => c.isOriginal).map((comic) => (
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
        {COMICS.slice(0, 3).map((comic) => (
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
          {filteredComics.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-2 gap-y-8">
              {filteredComics.map((comic) => (
                <div key={comic.id} className="flex flex-col cursor-pointer group" onClick={() => openSeriesDetails(comic)}>
                  <div className="relative aspect-[3/4] rounded-md mb-2 overflow-hidden">
                    <img src={comic.cover} alt={comic.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <h3 className="font-bold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">{comic.title}</h3>
                  <p className="text-[11px] text-muted-foreground mt-1">{comic.genre}</p>
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
            if(!isLoggedIn) navigate('/login');
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
            if(!isLoggedIn) navigate('/login');
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
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => setCurrentView('edit-series')}>Edit Series</Button>
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
            <label className="text-sm font-bold">Content Type</label>
            <div className="flex gap-4">
              <Button 
                type="button" 
                variant={publishType === 'webtoon' ? 'default' : 'outline'} 
                className="flex-1 rounded-full font-bold"
                onClick={() => setPublishType('webtoon')}
              >
                Webtoon
              </Button>
              <Button 
                type="button" 
                variant={publishType === 'novel' ? 'default' : 'outline'} 
                className="flex-1 rounded-full font-bold"
                onClick={() => setPublishType('novel')}
              >
                Novel
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold">{publishType === 'webtoon' ? 'Series' : 'Novel'} Title</label>
            <input type="text" placeholder={`Enter ${publishType} title`} className="w-full bg-background border-2 border-border rounded-md p-3 focus:border-primary outline-none" required />
          </div>
          
          <div className="space-y-3">
            <label className="text-sm font-bold">Series Genres (Select up to 3)</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CATEGORIES.map(cat => (
                <label key={cat} className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${selectedGenres.includes(cat) ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
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
                        setSelectedGenres(selectedGenres.filter(g => g !== cat));
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
            <p className="text-xs text-muted-foreground">Chosen: {selectedGenres.join(', ') || 'None'}</p>
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
      <div className="flex items-center gap-6 mb-8">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center overflow-hidden border-4 border-primary/20 relative">
          {userProfilePic ? (
            <img src={userProfilePic} alt={userName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <User className="w-12 h-12 text-muted-foreground" />
          )}
          {isPremium && (
            <div className="absolute bottom-0 right-0 bg-background rounded-full p-0.5">
              <BadgeCheck className="w-6 h-6 text-primary fill-primary/20" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-black tracking-tighter flex items-center gap-2">
            {userName}
            {isPremium && <BadgeCheck className="w-6 h-6 text-primary" />}
          </h1>
          <p className="text-muted-foreground font-medium">riderezzy@gmail.com</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <Button variant="outline" size="sm" className="rounded-full font-bold" onClick={() => setCurrentView('edit-profile')}>Edit Profile</Button>
            <Button variant="default" size="sm" className="rounded-full font-bold bg-primary/10 text-primary hover:bg-primary/20 border-none" onClick={() => setCurrentView('wallet')}>
              <DollarSign className="w-3 h-3 mr-1" /> My Wallet
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

      {dropSomethingLink && (
        <div className="mb-8">
          <a href={dropSomethingLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline bg-primary/10 px-4 py-2 rounded-full">
            <Heart className="w-4 h-4 fill-primary" /> Support me on DropSomething
          </a>
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
      <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>
      
      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setCurrentView('profile'); }}>
        <div className="space-y-4">
          <label className="text-sm font-bold">Profile Picture</label>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center overflow-hidden border-4 border-primary/20 relative">
              {userProfilePic ? (
                <img src={userProfilePic} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <User className="w-12 h-12 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-xs text-muted-foreground mb-2">Upload a profile picture to personalize your account.</p>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full font-bold"
                  onClick={() => {
                    const url = prompt("Enter image URL for profile picture:");
                    if (url) setUserProfilePic(url);
                  }}
                >
                  <Upload className="w-3 h-3 mr-1" /> Upload Image
                </Button>
                {userProfilePic && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="rounded-full font-bold text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => setUserProfilePic(null)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold">Display Name</label>
          <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full bg-background border-2 border-border rounded-md p-3 focus:border-primary outline-none" required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold">Bio</label>
          <textarea value={userBio} onChange={(e) => setUserBio(e.target.value)} placeholder="Tell us about yourself..." className="w-full bg-background border-2 border-border rounded-md p-3 focus:border-primary outline-none min-h-[100px]" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold">DropSomething Link</label>
          <p className="text-xs text-muted-foreground mb-2">Add your DropSomething link so fans can support you directly.</p>
          <input type="url" value={dropSomethingLink} onChange={(e) => setDropSomethingLink(e.target.value)} placeholder="https://dropsomething.com/yourusername" className="w-full bg-background border-2 border-border rounded-md p-3 focus:border-primary outline-none" />
        </div>
        <Button type="submit" className="w-full rounded-full py-6 font-bold">Save Changes</Button>
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
        <p className="text-5xl font-black text-primary mb-6">150</p>
        <Button className="rounded-full px-8 font-bold">Buy More Coins</Button>
      </Card>

      <h2 className="text-xl font-bold mb-4">Coin Packages</h2>
      <div className="space-y-4">
        {[
          { coins: 100, price: "$0.99" },
          { coins: 500, price: "$4.99", bonus: "+50 Bonus" },
          { coins: 1000, price: "$9.99", bonus: "+150 Bonus" },
        ].map((pkg, i) => (
          <div key={i} className="flex items-center justify-between p-4 border border-border rounded-xl hover:border-primary transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary-dark" />
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
    <div className="px-4 py-12 max-w-2xl mx-auto w-full min-h-[60vh]">
      <Button variant="ghost" onClick={() => setCurrentView('publish-dashboard')} className="mb-6 -ml-4 gap-2">
        <ChevronRight className="w-4 h-4 rotate-180" /> Back to Dashboard
      </Button>
      <h1 className="text-3xl font-bold mb-8">Edit Series</h1>
      
      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setCurrentView('publish-dashboard'); }}>
        <div className="space-y-2">
          <label className="text-sm font-bold">Series Title</label>
          <input type="text" defaultValue="My First Comic" className="w-full bg-background border-2 border-border rounded-md p-3 focus:border-primary outline-none" required />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-bold">Summary</label>
          <textarea defaultValue="This is the summary of my first comic." className="w-full bg-background border-2 border-border rounded-md p-3 focus:border-primary outline-none min-h-[120px]" required />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold">Update Thumbnail</label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-32 bg-muted rounded-md overflow-hidden shrink-0">
              <img src="https://picsum.photos/seed/mycomic/200/300" alt="Current Thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <Button variant="outline" type="button">Upload New Image</Button>
          </div>
        </div>

        <Button type="submit" className="w-full rounded-full py-6 font-bold">Save Changes</Button>
      </form>
    </div>
  );

  const renderCommentSection = (contentId: number) => {
    const contentComments = comments[contentId] || [];
    
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
        [contentId]: [comment, ...(prev[contentId] || [])]
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

  const renderLemon = () => (
    <div className="pb-20">
      <div className="relative h-[400px] w-full overflow-hidden mb-12">
        <img 
          src="https://picsum.photos/seed/novel/1920/1080" 
          alt="Novel Banner" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8 max-w-2xl">
          <Badge className="mb-4 bg-foreground text-background font-bold uppercase">NEW NOVEL SECTION</Badge>
          <h1 className="text-5xl font-black tracking-tighter mb-4 uppercase">Novel NOVELS</h1>
          <p className="text-lg text-muted-foreground mb-6 font-medium">Dive into a world of words. Fresh stories, updated daily. Only on Lemonade.</p>
          <Button size="lg" className="rounded-full px-8 font-bold gap-2" onClick={() => openSeriesDetails(NOVELS[0])}>
            <BookOpen className="w-5 h-5" /> Start Reading
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Novel Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-6 no-scrollbar mb-8 border-b border-border">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveLemonCategory(cat)}
              className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeLemonCategory === cat ? 'bg-primary-dark text-primary-foreground' : 'bg-muted hover:bg-muted/80 text-muted-foreground'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black tracking-tighter flex items-center gap-2">
            <span className="bg-primary-dark text-primary-foreground px-2 py-0.5 rounded">Novel</span> {activeLemonCategory.toUpperCase()} NOVELS
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {NOVELS.filter(n => n.genre === activeLemonCategory || activeLemonCategory === 'Drama').map((novel) => (
            <div key={novel.id} className="group cursor-pointer" onClick={() => openSeriesDetails(novel)}>
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-3 border border-border group-hover:border-primary transition-colors">
                <img 
                  src={novel.cover} 
                  alt={novel.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                  Novel
                </div>
              </div>
              <h3 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">{novel.title}</h3>
              <p className="text-xs text-muted-foreground font-medium">{novel.creator}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAdmin = () => {
    const renderAdminDashboard = () => (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Users", value: "1.2M", change: "+12%", icon: Users, color: "text-primary" },
            { label: "Active Series", value: "8.4K", change: "+5%", icon: BookOpen, color: "text-primary" },
            { label: "Daily Views", value: "45M", change: "+24%", icon: BarChart3, color: "text-primary" },
            { label: "Revenue", value: "$840K", change: "+18%", icon: DollarSign, color: "text-primary" },
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
              <p className="text-3xl font-black mt-1">{stat.value}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 p-6">
            <h3 className="text-xl font-bold mb-6">Platform Activity</h3>
            <div className="h-[300px] w-full bg-muted/30 rounded-xl flex items-center justify-center border border-dashed border-border">
              <p className="text-muted-foreground font-medium">Activity Chart Visualization</p>
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-6">System Health</h3>
            <div className="space-y-6">
              {[
                { label: "API Server", status: "Operational", color: "bg-primary" },
                { label: "Database", status: "Operational", color: "bg-primary" },
                { label: "Image CDN", status: "Operational", color: "bg-primary" },
                { label: "Ad Server", status: "Degraded", color: "bg-primary-light" },
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
          <h3 className="text-xl font-bold">User Management</h3>
          <div className="flex gap-2">
            <input type="text" placeholder="Search users..." className="bg-muted border-none rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
            <Button size="sm" className="rounded-full font-bold">Add User</Button>
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
                <th className="pb-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MOCK_USERS.map(user => (
                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-4 font-medium">{user.name}</td>
                  <td className="py-4">
                    <Badge variant="outline" className="font-bold">{user.role}</Badge>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-primary' : 'bg-red-500'}`} />
                      <span className="text-sm">{user.status}</span>
                    </div>
                  </td>
                  <td className="py-4 text-sm text-muted-foreground">{user.joined}</td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"><Settings2 className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    );

    const renderAdminModeration = () => (
      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-6">Pending Content Review</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-border rounded-xl hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-16 bg-muted rounded-md overflow-hidden">
                    <img src={`https://picsum.photos/seed/mod-${i}/100/150`} alt="Content" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-bold">Mystic Quest {i}</p>
                    <p className="text-xs text-muted-foreground">Submitted by Creator_{i} • 2h ago</p>
                    <Badge className="mt-2 bg-primary/10 text-primary border-none text-[10px]">Webtoon</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="rounded-full font-bold text-xs border-red-500 text-red-500 hover:bg-red-50">Reject</Button>
                  <Button size="sm" className="rounded-full font-bold text-xs">Approve</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold mb-6">Reported Comments</h3>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 border border-border rounded-xl bg-red-500/5 border-red-500/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Flag className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-bold">Harassment Report</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Reported by User_X • 15m ago</span>
                </div>
                <p className="text-sm text-muted-foreground bg-white/50 dark:bg-black/20 p-3 rounded-lg mb-4">
                  "This story is terrible and you should stop writing immediately!"
                </p>
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" className="text-xs font-bold">Dismiss</Button>
                  <Button size="sm" variant="destructive" className="rounded-full text-xs font-bold">Delete & Warn</Button>
                </div>
              </div>
            ))}
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
          {ADMIN_ADS.map(ad => (
            <Card key={ad.id} className="overflow-hidden group">
              <div className="aspect-video relative overflow-hidden">
                <img src={ad.image} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 right-4">
                  <Badge className={ad.status === 'Active' ? 'bg-primary' : 'bg-primary-light text-primary-dark'}>{ad.status}</Badge>
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-bold text-lg mb-4">{ad.title}</h4>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-muted/50 p-3 rounded-xl">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Views</p>
                    <p className="text-xl font-black">{ad.views}</p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-xl">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Clicks</p>
                    <p className="text-xl font-black">{ad.clicks}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 rounded-full font-bold">Edit</Button>
                  <Button variant="outline" className="rounded-full font-bold px-4">
                    {ad.status === 'Active' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
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

  const renderNovelReader = () => (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setCurrentView('series-details')} className="rounded-full">
            <ChevronRight className="w-6 h-6 rotate-180" />
          </Button>
          <div className="text-center">
            <h2 className="font-bold text-sm line-clamp-1">{selectedComic?.title}</h2>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Chapter 1: The Beginning</p>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full"><Settings2 className="w-5 h-5" /></Button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="prose prose-zinc dark:prose-invert max-w-none">
          <h1 className="text-4xl font-black tracking-tighter mb-8">{selectedComic?.title}</h1>
          <div className="space-y-6 text-lg leading-relaxed font-serif text-zinc-800 dark:text-zinc-200">
            <p>The sun hung low in the sky, casting long, golden shadows across the sprawling citrus groves of Lemonade Valley. Kaelen wiped the sweat from his brow, his hands stained with the sticky, sweet residue of the day's harvest.</p>
            <p>He had spent his entire life in these fields, but today felt different. The air was thick with a strange, electric energy, and the lemons glowed with an intensity he had never seen before.</p>
            <p>"Kaelen!" a voice called out from the edge of the grove. It was Master Zest, the oldest alchemist in the village. He looked frantic, his white robes fluttering in the breeze.</p>
            <p>"You must come quickly," Zest panted, leaning on his staff. "The Great Squeeze is beginning. The prophecy of the Golden Lemonade is finally coming to pass."</p>
            <p>Kaelen's heart raced. He had heard the stories since he was a child, but he never truly believed them. The Golden Lemonade was said to grant the drinker the power to reshape reality itself.</p>
            <p>As they hurried toward the village square, the sky began to turn a deep, vibrant yellow. The ground beneath their feet trembled, and the scent of citrus became almost overwhelming.</p>
            <p>In the center of the square stood the Ancient Press, a massive stone structure that had remained silent for centuries. Now, it was humming with power, its gears turning with a rhythmic, grinding sound.</p>
            <p>"The first drop," Zest whispered, his eyes wide with awe. "It's happening."</p>
          </div>
        </div>

        <div className="mt-16 flex justify-between items-center border-t border-border pt-8">
          <Button variant="outline" className="rounded-full px-8 font-bold">Previous Chapter</Button>
          <div className="flex gap-4">
            <Button variant="outline" size="icon" className="rounded-full" onClick={() => selectedComic && toggleLike(selectedComic.id)}>
              <Heart className={`w-5 h-5 ${likedComics.has(selectedComic?.id) ? 'fill-primary text-primary' : ''}`} />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full"><Share2 className="w-5 h-5" /></Button>
          </div>
          <Button className="rounded-full px-8 font-bold">Next Chapter</Button>
        </div>

        {selectedComic && renderCommentSection(selectedComic.id)}
      </div>
    </div>
  );

  const renderReader = () => {
    const isLiked = selectedComic ? likedComics.has(selectedComic.id) : false;

    return (
      <div className="min-h-screen bg-black text-white">
        <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md px-4 h-14 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setCurrentView('home')} className="text-white hover:bg-white/10">
              <ChevronRight className="w-6 h-6 rotate-180" />
            </Button>
            <div>
              <h2 className="font-bold text-sm line-clamp-1">{selectedComic?.title}</h2>
              <p className="text-[10px] text-white/60">Episode 1</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className={`hover:bg-white/10 ${isLiked ? 'text-primary' : 'text-white'}`}
              onClick={() => selectedComic && toggleLike(selectedComic.id)}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-primary' : ''}`} />
            </Button>
            
            <Sheet open={isReaderMenuOpen} onOpenChange={setIsReaderMenuOpen}>
              <SheetTrigger className="text-white hover:bg-white/10 flex items-center justify-center w-10 h-10 rounded-full transition-colors cursor-pointer">
                <MoreVertical className="w-5 h-5" />
              </SheetTrigger>
              <SheetContent className="bg-zinc-950 text-white border-zinc-800">
                <SheetHeader>
                  <SheetTitle className="text-white text-left">{selectedComic?.title}</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <div 
                    className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-lg cursor-pointer"
                    onClick={() => {
                      setIsReaderMenuOpen(false);
                      setCurrentView('series-details');
                    }}
                  >
                    <List className="w-5 h-5 text-zinc-400" />
                    <div>
                      <p className="font-bold">Episode List</p>
                      <p className="text-xs text-zinc-500">View all episodes</p>
                    </div>
                  </div>
                  <div 
                    className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-lg cursor-pointer"
                    onClick={() => {
                      setIsReaderMenuOpen(false);
                      setCurrentView('creator-profile');
                    }}
                  >
                    <User className="w-5 h-5 text-zinc-400" />
                    <div>
                      <p className="font-bold">About Creator</p>
                      <p className="text-xs text-zinc-500">{selectedComic?.creator}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-lg cursor-pointer">
                    <Share2 className="w-5 h-5 text-zinc-400" />
                    <div>
                      <p className="font-bold">Share Series</p>
                      <p className="text-xs text-zinc-500">Spread the word</p>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="max-w-2xl mx-auto py-4 space-y-0">
          {[1, 2, 3, 4, 5].map(i => (
            <img 
              key={i} 
              src={`https://picsum.photos/seed/comic-page-${selectedComic?.id}-${i}/800/1200`} 
              alt={`Page ${i}`} 
              className="w-full h-auto"
              referrerPolicy="no-referrer"
            />
          ))}
        </div>

        <div className="p-8 text-center border-t border-white/10">
          <h3 className="font-bold mb-4">You've reached the end of this episode!</h3>
          <Button 
            className="rounded-full px-8 bg-primary text-primary-foreground font-bold"
            onClick={() => startReading(selectedComic)}
          >
            Next Episode
          </Button>

          <div className="max-w-2xl mx-auto text-left mt-12">
            {selectedComic && renderCommentSection(selectedComic.id)}
          </div>
        </div>
      </div>
    );
  };

  const renderSeriesDetails = () => (
    <div className="px-4 py-8 max-w-4xl mx-auto w-full min-h-[60vh]">
      <Button variant="ghost" onClick={() => setCurrentView(selectedComic?.type === 'novel' ? 'Novel' : 'home')} className="mb-6 -ml-4 gap-2">
        <ChevronRight className="w-4 h-4 rotate-180" /> Back
      </Button>
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="w-full md:w-64 shrink-0">
          <img src={selectedComic?.cover} alt={selectedComic?.title} className="w-full aspect-[3/4] object-cover rounded-xl shadow-lg" referrerPolicy="no-referrer" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge>{selectedComic?.genre}</Badge>
            {selectedComic?.isOriginal && <Badge variant="secondary" className="bg-primary/20 text-primary">Original</Badge>}
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
            {selectedComic?.type === 'novel' ? 'Start Reading' : 'Read First Episode'}
          </Button>
        </div>
      </div>

      {selectedComic?.type !== 'novel' && (
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
                <Button variant="ghost" size="icon"><Heart className="w-5 h-5 text-muted-foreground" /></Button>
              </div>
            ))}
          </div>
        </>
      )}

      {selectedComic && renderCommentSection(selectedComic.id)}
    </div>
  );

  const renderCreatorProfile = () => {
    const creatorComics = COMICS.filter(c => c.creator === selectedComic?.creator) || [];
    const displayComics = creatorComics.length > 0 ? creatorComics : (selectedComic ? [selectedComic] : []);

    return (
      <div className="px-4 py-12 max-w-4xl mx-auto w-full min-h-[60vh]">
        <Button variant="ghost" onClick={() => setCurrentView('series-details')} className="mb-6 -ml-4 gap-2">
          <ChevronRight className="w-4 h-4 rotate-180" /> Back to Series
        </Button>
        
        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-32 h-32 bg-muted rounded-full overflow-hidden border-4 border-primary/20 mb-6">
            <img src={`https://picsum.photos/seed/${selectedComic?.creator}/200/200`} alt={selectedComic?.creator} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-2 flex items-center gap-2 justify-center">
            {selectedComic?.creator}
            <BadgeCheck className="w-6 h-6 text-primary" />
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto mb-6">
            Comic artist and storyteller. Creating worlds full of magic, action, and romance. Thanks for reading my series!
          </p>
          <div className="flex gap-4">
            <Button className="rounded-full px-8 font-bold">Follow</Button>
            <Button variant="outline" className="rounded-full px-8 font-bold gap-2"><DollarSign className="w-4 h-4" /> Support</Button>
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-6">Series by {selectedComic?.creator}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {displayComics.map(comic => (
            <Card key={comic.id} className="overflow-hidden cursor-pointer group border-0 bg-transparent shadow-none" onClick={() => openSeriesDetails(comic)}>
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-3">
                <img src={comic.cover} alt={comic.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" referrerPolicy="no-referrer" />
              </div>
              <h3 className="font-bold line-clamp-1 group-hover:text-primary transition-colors">{comic.title}</h3>
              <p className="text-sm text-muted-foreground">{comic.genre}</p>
            </Card>
          ))}
        </div>
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Navigation */}
      <nav className={`${isMovieView ? 'absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 via-black/35 to-transparent' : 'sticky top-0 bg-background border-b border-border'} w-full z-50`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-6">
            {/* Mobile Hamburger Menu */}
            <Sheet>
              <SheetTrigger className={`md:hidden -ml-2 flex items-center justify-center w-10 h-10 rounded-md transition-colors cursor-pointer ${isMovieView ? 'text-white hover:bg-white/10' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}>
                <Menu className="w-6 h-6" />
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation Menu</SheetTitle>
                </SheetHeader>
                <div className="p-6 border-b border-border">
                  <div 
                    className="flex items-center gap-2 text-primary mb-6 cursor-pointer"
                    onClick={() => { setCurrentView('home'); }}
                  >
                    <Logo />
                  </div>
                  <div className="flex flex-col gap-4 font-semibold">
                    <div onClick={() => setCurrentView('home')} className="text-foreground hover:text-primary cursor-pointer">Movies</div>
                    <div onClick={() => setCurrentView('manga')} className="text-foreground hover:text-primary cursor-pointer">Manga / Manwha</div>
                    <div onClick={() => setCurrentView('Novel')} className="text-foreground hover:text-primary cursor-pointer flex items-center gap-2">
                      Novel <Badge className="bg-foreground text-background text-[10px] px-1.5 py-0 uppercase">LIVE</Badge>
                    </div>
                    <div onClick={handleMyClick} className="text-foreground hover:text-primary cursor-pointer">My</div>
                  </div>
                </div>
                <div className="p-6 flex flex-col gap-4 font-medium text-muted-foreground">
                  <div onClick={handlePublishClick} className="flex items-center gap-3 hover:text-foreground cursor-pointer"><PenTool className="w-5 h-5" /> Publish</div>
                  <div onClick={() => setCurrentView('ads-manager')} className="flex items-center gap-3 hover:text-foreground cursor-pointer"><BarChart3 className="w-5 h-5" /> Ads Manager</div>
                  <div onClick={handleMyClick} className="flex items-center gap-3 hover:text-foreground cursor-pointer"><Star className="w-5 h-5" /> Subscriptions</div>
                </div>
              </SheetContent>
            </Sheet>

            <div
              className="flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
              onClick={() => setCurrentView('home')}
            >
              <Logo />
            </div>
            
            <div className={`hidden md:flex items-center gap-6 font-semibold text-sm h-full ${isMovieView ? 'text-white' : ''}`}>
              <div 
                onClick={() => setCurrentView('home')}
                className={`${currentView === 'home' ? (isMovieView ? 'text-white' : 'text-primary border-b-2 border-primary') : (isMovieView ? 'text-white/78 hover:text-white' : 'text-muted-foreground hover:text-foreground')} h-full flex items-center px-1 cursor-pointer`}
              >
                Movies
              </div>
              <div 
                onClick={() => setCurrentView('manga')}
                className={`${currentView === 'manga' ? (isMovieView ? 'text-white' : 'text-primary border-b-2 border-primary') : (isMovieView ? 'text-white/78 hover:text-white' : 'text-muted-foreground hover:text-foreground')} h-full flex items-center px-1 cursor-pointer`}
              >
                Manga / Manwha
              </div>
              <div 
                onClick={() => setCurrentView('Novel')}
                className={`${currentView === 'Novel' ? (isMovieView ? 'text-white' : 'text-primary border-b-2 border-primary') : (isMovieView ? 'text-white/78 hover:text-white' : 'text-muted-foreground hover:text-foreground')} h-full flex items-center px-1 cursor-pointer gap-2`}
              >
                Novel <Badge className={`${isMovieView ? 'bg-[#46b653] text-white' : 'bg-foreground text-background'} text-[10px] px-1.5 py-0 uppercase`}>LIVE</Badge>
              </div>
              <div 
                onClick={handleMyClick}
                className={`${currentView === 'my' ? (isMovieView ? 'text-white' : 'text-primary border-b-2 border-primary') : (isMovieView ? 'text-white/78 hover:text-white' : 'text-muted-foreground hover:text-foreground')} h-full flex items-center px-1 cursor-pointer`}
              >
                My
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 md:gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className={`${currentView === 'search' ? (isMovieView ? 'text-white' : 'text-primary') : (isMovieView ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-muted-foreground')}`}
              onClick={() => setCurrentView('search')}
            >
              <Search className="w-5 h-5" />
            </Button>
            {isMovieView ? (
              <Button variant="ghost" size="icon" className="hidden md:flex text-white/80 hover:text-white hover:bg-white/10">
                <Bell className="w-5 h-5" />
              </Button>
            ) : (
              <Button 
                variant="default" 
                className="hidden md:flex rounded-full font-semibold px-6"
                onClick={handlePublishClick}
              >
                Publish
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className={`${currentView === 'profile' || currentView === 'auth' ? (isMovieView ? 'text-white' : 'text-primary') : (isMovieView ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-muted-foreground')}`}
              onClick={handleProfileClick}
            >
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </nav>

      <main>
        {currentView === 'home' && renderMoviesHome()}
        {currentView === 'manga' && renderOriginals()}
        {currentView === 'Novel' && renderLemon()}
        {currentView === 'admin' && renderAdmin()}
        {currentView === 'my' && renderMy()}
        {currentView === 'search' && renderSearch()}
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
        {currentView === 'novel-reader' && renderNovelReader()}
      </main>

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
