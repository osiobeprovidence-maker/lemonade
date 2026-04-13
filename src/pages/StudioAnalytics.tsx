import React from 'react';
import { StudioLayout } from '../components/StudioLayout';
import { BarChart3, TrendingUp, Users, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const data = [
  { name: 'Mon', views: 4000, subs: 2400 },
  { name: 'Tue', views: 3000, subs: 1398 },
  { name: 'Wed', views: 2000, subs: 9800 },
  { name: 'Thu', views: 2780, subs: 3908 },
  { name: 'Fri', views: 1890, subs: 4800 },
  { name: 'Sat', views: 2390, subs: 3800 },
  { name: 'Sun', views: 3490, subs: 4300 },
];

export function StudioAnalytics() {
  return (
    <StudioLayout>
      <div className="px-4 md:px-8 py-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-black tracking-tight text-zinc-800">Analytics</h1>
          <p className="text-xs text-zinc-400 mt-1">Audience Growth</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-10">
          {[
            { label: 'Total Views', value: '1.2M', icon: Eye, change: '+12%' },
            { label: 'Subscribers', value: '45.2K', icon: Users, change: '+5.4%' },
            { label: 'Retention', value: '68%', icon: TrendingUp, change: '+2%' },
            { label: 'Engagement', value: '12.5%', icon: BarChart3, change: '-1%' },
          ].map((stat, i) => (
            <div key={i} className="p-5 bg-zinc-50 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-green-50 text-green-500">
                  <stat.icon size={16} />
                </div>
                <span className={`text-[10px] font-bold ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{stat.label}</p>
              <h3 className="text-xl font-bold text-zinc-800">{stat.value}</h3>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-zinc-50 rounded-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 mb-6">Views Overview</h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#9CA3AF' }} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} itemStyle={{ fontSize: '12px', fontWeight: 600 }} />
                  <Area type="monotone" dataKey="views" stroke="#4ade80" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-6 bg-zinc-50 rounded-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 mb-6">Subscriber Growth</h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#9CA3AF' }} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="subs" fill="#4ade80" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </StudioLayout>
  );
}
