import { Copy, Flag, List, Moon, Settings2, Share2, Sparkles, Sun } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { ReaderTheme } from './novel-reader-data';

interface ReaderMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme: ReaderTheme;
  onOpenSettings: () => void;
  onJumpToToc: () => void;
  onShare: () => void;
  onCopyLink: () => void;
  onReport: () => void;
  onToggleTheme: () => void;
  immersiveMode: boolean;
}

function MenuAction({
  icon,
  title,
  description,
  onClick,
  theme,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  theme: ReaderTheme;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-[22px] px-4 py-4 text-left transition ${theme === 'night'
        ? 'hover:bg-white/6'
        : 'hover:bg-black/4'
      }`}
    >
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${theme === 'night' ? 'bg-white/8 text-white/82' : 'bg-black/6 text-zinc-700'}`}>
        {icon}
      </span>
      <span>
        <span className="block text-sm font-semibold">{title}</span>
        <span className={`mt-1 block text-xs ${theme === 'night' ? 'text-white/52' : 'text-zinc-500'}`}>{description}</span>
      </span>
    </button>
  );
}

export function ReaderMenu({
  open,
  onOpenChange,
  theme,
  onOpenSettings,
  onJumpToToc,
  onShare,
  onCopyLink,
  onReport,
  onToggleTheme,
  immersiveMode,
}: ReaderMenuProps) {
  const surfaceClass = theme === 'night'
    ? 'border-white/10 bg-[#0b0b0d] text-white'
    : 'border-black/10 bg-[#f8f3e9] text-zinc-950';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={`w-full max-w-md overflow-y-auto ${surfaceClass}`}>
        <SheetHeader>
          <SheetTitle className={theme === 'night' ? 'text-white' : 'text-zinc-950'}>Reader menu</SheetTitle>
        </SheetHeader>

        <div className="mt-8 space-y-2">
          <MenuAction
            icon={<Settings2 className="h-4 w-4" />}
            title="Reader settings"
            description="Theme, typography, spacing, and width controls."
            onClick={onOpenSettings}
            theme={theme}
          />
          <MenuAction
            icon={theme === 'night' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            title={theme === 'night' ? 'Switch to day mode' : 'Switch to night mode'}
            description="Change the page tone instantly without leaving your chapter."
            onClick={onToggleTheme}
            theme={theme}
          />
          <MenuAction
            icon={<List className="h-4 w-4" />}
            title="Table of contents"
            description="Jump to another chapter or return to the beginning of the arc."
            onClick={onJumpToToc}
            theme={theme}
          />
          <MenuAction
            icon={<Share2 className="h-4 w-4" />}
            title="Share chapter"
            description="Send the current chapter using native share when available."
            onClick={onShare}
            theme={theme}
          />
          <MenuAction
            icon={<Copy className="h-4 w-4" />}
            title="Copy link"
            description="Copy a direct link to this chapter and reading position."
            onClick={onCopyLink}
            theme={theme}
          />
          <MenuAction
            icon={<Flag className="h-4 w-4" />}
            title="Report chapter"
            description="Flag a formatting or content issue for the Lemonade team."
            onClick={onReport}
            theme={theme}
          />
        </div>

        <div className={`mt-8 rounded-[24px] border px-4 py-4 ${theme === 'night' ? 'border-white/10 bg-white/[0.03]' : 'border-black/10 bg-white/72'}`}>
          <div className="flex items-center gap-3">
            <span className={`flex h-10 w-10 items-center justify-center rounded-full ${theme === 'night' ? 'bg-white/10 text-white' : 'bg-black/5 text-zinc-700'}`}>
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold">Immersive chrome</p>
              <p className={`mt-1 text-xs ${theme === 'night' ? 'text-white/52' : 'text-zinc-500'}`}>
                {immersiveMode ? 'Controls fade back to let the prose take over.' : 'Controls stay visible while you read.'}
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
