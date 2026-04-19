interface ReadingProgressBarProps {
  progress: number;
  theme: 'night' | 'day';
}

export function ReadingProgressBar({ progress, theme }: ReadingProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className="fixed inset-x-0 top-0 z-[70] h-px sm:h-1">
      <div className={`h-full w-full ${theme === 'night' ? 'bg-white/8' : 'bg-black/6'}`}>
        <div
          className={`h-full transition-[width] duration-200 ${theme === 'night' ? 'bg-primary/90' : 'bg-primary'}`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}
