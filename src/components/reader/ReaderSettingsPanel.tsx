import { Moon, Sun } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { ReaderPreferences, ReaderTheme } from './novel-reader-data';

interface ReaderSettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preferences: ReaderPreferences;
  onChange: (preferences: ReaderPreferences) => void;
}

function ToggleGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  theme,
}: {
  label: string;
  options: Array<{ label: string; value: T }>;
  value: T;
  onChange: (value: T) => void;
  theme: ReaderTheme;
}) {
  return (
    <section>
      <p className={`text-[0.68rem] font-semibold uppercase tracking-[0.3em] ${theme === 'night' ? 'text-white/45' : 'text-zinc-500'}`}>
        {label}
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {options.map((option) => {
          const selected = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`rounded-2xl px-3 py-3 text-sm font-medium transition ${selected
                ? theme === 'night'
                  ? 'bg-white text-black'
                  : 'bg-zinc-950 text-white'
                : theme === 'night'
                  ? 'bg-white/5 text-white/72 hover:bg-white/10'
                  : 'bg-black/4 text-zinc-700 hover:bg-black/8'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function ReaderSettingsPanel({
  open,
  onOpenChange,
  preferences,
  onChange,
}: ReaderSettingsPanelProps) {
  const theme = preferences.theme;
  const surfaceClass = theme === 'night'
    ? 'border-white/10 bg-[#0b0b0d] text-white'
    : 'border-black/10 bg-[#f8f3e9] text-zinc-950';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={`w-full max-w-md overflow-y-auto ${surfaceClass}`}>
        <SheetHeader>
          <SheetTitle className={theme === 'night' ? 'text-white' : 'text-zinc-950'}>Reader settings</SheetTitle>
        </SheetHeader>

        <div className="mt-8 space-y-8">
          <section>
            <p className={`text-[0.68rem] font-semibold uppercase tracking-[0.3em] ${theme === 'night' ? 'text-white/45' : 'text-zinc-500'}`}>
              Theme
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onChange({ ...preferences, theme: 'night' })}
                className={`rounded-[22px] border px-4 py-4 text-left transition ${preferences.theme === 'night'
                  ? 'border-white bg-white text-black'
                  : theme === 'night'
                    ? 'border-white/12 bg-white/5 text-white/72'
                    : 'border-black/10 bg-white/75 text-zinc-700'
                }`}
              >
                <Moon className="h-4 w-4" />
                <p className="mt-3 text-sm font-semibold">Night</p>
                <p className="mt-1 text-xs opacity-70">Near-black pages with soft text.</p>
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...preferences, theme: 'day' })}
                className={`rounded-[22px] border px-4 py-4 text-left transition ${preferences.theme === 'day'
                  ? 'border-zinc-950 bg-zinc-950 text-white'
                  : theme === 'night'
                    ? 'border-white/12 bg-white/5 text-white/72'
                    : 'border-black/10 bg-white/75 text-zinc-700'
                }`}
              >
                <Sun className="h-4 w-4" />
                <p className="mt-3 text-sm font-semibold">Day</p>
                <p className="mt-1 text-xs opacity-70">Warm paper tone with darker ink.</p>
              </button>
            </div>
          </section>

          <ToggleGroup
            label="Font Size"
            options={[
              { label: 'Small', value: 'small' },
              { label: 'Medium', value: 'medium' },
              { label: 'Large', value: 'large' },
            ]}
            value={preferences.fontSize}
            onChange={(fontSize) => onChange({ ...preferences, fontSize })}
            theme={theme}
          />

          <ToggleGroup
            label="Line Height"
            options={[
              { label: 'Compact', value: 'compact' },
              { label: 'Comfort', value: 'comfortable' },
              { label: 'Spacious', value: 'spacious' },
            ]}
            value={preferences.lineHeight}
            onChange={(lineHeight) => onChange({ ...preferences, lineHeight })}
            theme={theme}
          />

          <ToggleGroup
            label="Content Width"
            options={[
              { label: 'Narrow', value: 'narrow' },
              { label: 'Standard', value: 'standard' },
              { label: 'Wide', value: 'wide' },
            ]}
            value={preferences.contentWidth}
            onChange={(contentWidth) => onChange({ ...preferences, contentWidth })}
            theme={theme}
          />

          <ToggleGroup
            label="Font Family"
            options={[
              { label: 'Serif', value: 'serif' },
              { label: 'Sans', value: 'sans' },
            ]}
            value={preferences.fontFamily}
            onChange={(fontFamily) => onChange({ ...preferences, fontFamily })}
            theme={theme}
          />

          <section>
            <p className={`text-[0.68rem] font-semibold uppercase tracking-[0.3em] ${theme === 'night' ? 'text-white/45' : 'text-zinc-500'}`}>
              Immersive Mode
            </p>
            <button
              type="button"
              onClick={() => onChange({ ...preferences, immersiveMode: !preferences.immersiveMode })}
              className={`mt-3 flex w-full items-center justify-between rounded-[22px] px-4 py-4 text-left transition ${theme === 'night'
                ? 'bg-white/5 text-white hover:bg-white/10'
                : 'bg-white/75 text-zinc-900 hover:bg-white'
              }`}
            >
              <div>
                <p className="text-sm font-semibold">Auto-hide reader chrome</p>
                <p className="mt-1 text-xs opacity-70">Controls fade away after a few seconds so the page stays clean.</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${preferences.immersiveMode
                ? theme === 'night'
                  ? 'bg-white text-black'
                  : 'bg-zinc-950 text-white'
                : theme === 'night'
                  ? 'bg-white/10 text-white/60'
                  : 'bg-black/6 text-zinc-600'
              }`}>
                {preferences.immersiveMode ? 'On' : 'Off'}
              </span>
            </button>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
