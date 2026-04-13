import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Star, Eye, User } from 'lucide-react';

interface SeriesCardProps {
  series: {
    id: string;
    title: string;
    creatorName: string;
    coverImage: string;
    subscriberCount: number;
    viewCount: number;
    tags: string[];
  };
  rank?: number;
  trend?: number;
}

export function SeriesCard({ series, rank, trend }: SeriesCardProps) {
  const formatCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(0)}K`;
    }
    return count.toLocaleString();
  };

  return (
    <Link to={`/series/${series.id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        className="group cursor-pointer"
      >
        {rank && (
          <div className="flex flex-col items-center pt-2 mb-2">
            <span className="text-5xl font-black text-black leading-none">{rank}</span>
            {trend !== undefined && (
              <div className={`flex items-center gap-0.5 text-xs font-medium mt-1 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}
              </div>
            )}
          </div>
        )}

        {/* Cover Image */}
        <div className="aspect-[3/4] overflow-hidden rounded-lg bg-zinc-100 shadow-sm mb-3">
          <img
            src={series.coverImage}
            alt={series.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-black leading-tight mb-1 line-clamp-2 group-hover:text-brand-yellow transition-colors">
          {series.title}
        </h3>

        {/* Genre */}
        <p className="text-xs text-zinc-500 mb-1">
          {series.tags?.[0] || 'Genre'}
        </p>

        {/* View Count */}
        <p className="text-xs text-brand-yellow font-medium">
          {formatCount(series.viewCount || 0)}
        </p>
      </motion.div>
    </Link>
  );
}
