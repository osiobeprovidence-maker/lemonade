import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ReaderSettings } from './ChapterContent';
import { Sun, Moon, Type, LayoutTemplate, MonitorSmartphone } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ReaderSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReaderSettings;
  onSettingsChange: (newSettings: ReaderSettings) => void;
}

export function ReaderSettingsPanel({
  isOpen,
  onClose,
  settings,
  onSettingsChange
}: ReaderSettingsPanelProps) {
  
  const updateSetting = <K extends keyof ReaderSettings>(key: K, value: ReaderSettings[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="sm:bottom-auto sm:top-0 sm:right-0 sm:side-right h-[80vh] sm:h-full w-full sm:w-[400px] bg-zinc-950 border-t sm:border-t-0 sm:border-l border-zinc-800/50 p-0 flex flex-col rounded-t-[20px] sm:rounded-none">
        <SheetHeader className="px-6 py-4 border-b border-zinc-800/50 text-left">
          <SheetTitle className="text-white">Reader Settings</SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-8 pb-12 sm:pb-0">
            
            {/* Theme */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Sun className="w-4 h-4" /> Theme
              </label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => updateSetting('theme', 'dark')}
                  className={`flex-1 h-12 bg-zinc-950 text-white hover:bg-zinc-900 border-zinc-800 ${settings.theme === 'dark' ? 'ring-2 ring-primary border-transparent' : ''}`}
                >Dark</Button>
                <Button
                  variant="outline"
                  onClick={() => updateSetting('theme', 'light')}
                  className={`flex-1 h-12 bg-white text-black hover:bg-zinc-100 hover:text-black border-zinc-200 ${settings.theme === 'light' ? 'ring-2 ring-primary border-transparent' : ''}`}
                >Light</Button>
                <Button
                  variant="outline"
                  onClick={() => updateSetting('theme', 'sepia')}
                  className={`flex-1 h-12 bg-[#f4ecd8] text-[#433422] hover:bg-[#eae0c8] hover:text-[#433422] border-[#d5cabb] ${settings.theme === 'sepia' ? 'ring-2 ring-primary border-transparent' : ''}`}
                >Sepia</Button>
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Type className="w-4 h-4" /> Font Style
              </label>
              <div className="flex gap-2 p-1 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
                <Button
                  variant="ghost"
                  onClick={() => updateSetting('fontFamily', 'sans')}
                  className={`flex-1 font-sans ${settings.fontFamily === 'sans' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
                >Sans-serif</Button>
                <Button
                  variant="ghost"
                  onClick={() => updateSetting('fontFamily', 'serif')}
                  className={`flex-1 font-serif ${settings.fontFamily === 'serif' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
                >Serif</Button>
              </div>
            </div>

            {/* Font Size */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Font Size</label>
              <div className="flex gap-2 p-1 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
                {['small', 'medium', 'large', 'xlarge'].map((size) => (
                  <Button
                    key={size}
                    variant="ghost"
                    onClick={() => updateSetting('fontSize', size as any)}
                    className={`flex-1 text-base ${settings.fontSize === size ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
                  >
                    {size === 'small' ? 'A-' : size === 'xlarge' ? 'A+' : 'A'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Line Height */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <LayoutTemplate className="w-4 h-4" /> Spacing
              </label>
              <div className="flex gap-2 p-1 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
                <Button
                  variant="ghost"
                  onClick={() => updateSetting('lineHeight', 'tight')}
                  className={`flex-1 ${settings.lineHeight === 'tight' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
                >Tight</Button>
                <Button
                  variant="ghost"
                  onClick={() => updateSetting('lineHeight', 'normal')}
                  className={`flex-1 ${settings.lineHeight === 'normal' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
                >Normal</Button>
                <Button
                  variant="ghost"
                  onClick={() => updateSetting('lineHeight', 'loose')}
                  className={`flex-1 ${settings.lineHeight === 'loose' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
                >Loose</Button>
              </div>
            </div>

            {/* Content Width (Desktop mainly) */}
            <div className="space-y-3 hidden sm:block">
              <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <MonitorSmartphone className="w-4 h-4" /> Layout Width
              </label>
              <div className="flex gap-2 p-1 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
                <Button
                  variant="ghost"
                  onClick={() => updateSetting('contentWidth', 'narrow')}
                  className={`flex-1 ${settings.contentWidth === 'narrow' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
                >Narrow</Button>
                <Button
                  variant="ghost"
                  onClick={() => updateSetting('contentWidth', 'medium')}
                  className={`flex-1 ${settings.contentWidth === 'medium' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
                >Medium</Button>
                <Button
                  variant="ghost"
                  onClick={() => updateSetting('contentWidth', 'wide')}
                  className={`flex-1 ${settings.contentWidth === 'wide' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
                >Wide</Button>
              </div>
            </div>

          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
