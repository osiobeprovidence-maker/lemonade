import React from 'react';
import { StudioLayout } from '../components/StudioLayout';
import { User, Bell, Shield, Wallet, ChevronRight } from 'lucide-react';

export function StudioSettings() {
  const settingsGroups = [
    {
      title: 'Profile',
      items: [
        { icon: User, label: 'Creator Profile', desc: 'Manage your public name, bio, and avatar' },
        { icon: Bell, label: 'Notifications', desc: 'Choose what updates you want to receive' },
      ]
    },
    {
      title: 'Monetization',
      items: [
        { icon: Wallet, label: 'Payout Settings', desc: 'Manage your bank details and payout schedule' },
        { icon: Shield, label: 'Content Rights', desc: 'Review your licensing and copyright status' },
      ]
    }
  ];

  return (
    <StudioLayout>
      <div className="px-4 md:px-8 py-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-black tracking-tight text-zinc-800">Studio Settings</h1>
          <p className="text-xs text-zinc-400 mt-1">Creator Configuration</p>
        </div>

        <div className="space-y-8">
          {settingsGroups.map((group, i) => (
            <div key={i}>
              <h2 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-4">{group.title}</h2>
              <div className="bg-zinc-50 rounded-xl overflow-hidden">
                {group.items.map((item, j) => (
                  <button
                    key={j}
                    className={`w-full flex items-center justify-between p-5 hover:bg-white transition-colors ${
                      j !== group.items.length - 1 ? 'border-b border-zinc-100' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div className="p-2.5 bg-white rounded-lg shadow-sm">
                        <item.icon size={18} className="text-green-500" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-zinc-800">{item.label}</h4>
                        <p className="text-[10px] text-zinc-400 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-zinc-300" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </StudioLayout>
  );
}
