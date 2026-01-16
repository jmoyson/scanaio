'use client';

import { useState } from 'react';
import type { Keyword } from '@/lib/types';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Sparkles,
  CheckCircle,
  Search,
  TrendingUp,
  Hash,
} from 'lucide-react';

interface KeywordsTableProps {
  keywords: Keyword[];
}

type SortField = 'keyword' | 'volume' | 'position' | 'status';
type SortDir = 'asc' | 'desc';
type Filter = 'all' | 'at-risk' | 'cited' | 'safe';

export function KeywordsTable({ keywords }: KeywordsTableProps) {
  // Default: sort by volume descending (highest traffic first)
  const [sortField, setSortField] = useState<SortField>('volume');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [filter, setFilter] = useState<Filter>('all');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      // Default descending for volume/position, ascending for text fields
      setSortDir(field === 'volume' || field === 'position' ? 'desc' : 'asc');
    }
  };

  const filtered = keywords.filter(kw => {
    if (filter === 'all') return true;
    if (filter === 'at-risk') return kw.aiOverviewStatus === 'stolen';
    if (filter === 'cited') return kw.aiOverviewStatus === 'referenced';
    if (filter === 'safe') return kw.aiOverviewStatus === 'safe';
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortField === 'keyword') {
      cmp = a.keyword.localeCompare(b.keyword);
    } else if (sortField === 'volume') {
      cmp = a.searchVolume - b.searchVolume;
    } else if (sortField === 'position') {
      cmp = a.position - b.position;
    } else if (sortField === 'status') {
      const order = { stolen: 0, referenced: 1, safe: 2 };
      cmp = order[a.aiOverviewStatus] - order[b.aiOverviewStatus];
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-40" />;
    return sortDir === 'asc'
      ? <ArrowUp className="w-3 h-3 ml-1 text-[#FF4500]" />
      : <ArrowDown className="w-3 h-3 ml-1 text-[#FF4500]" />;
  };

  const statusConfig = {
    stolen: {
      label: 'At Risk',
      color: 'text-[#FF4500]',
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: AlertTriangle,
      dotColor: 'bg-[#FF4500]'
    },
    referenced: {
      label: 'Cited',
      color: 'text-orange-500',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: Sparkles,
      dotColor: 'bg-orange-500'
    },
    safe: {
      label: 'Safe',
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: CheckCircle,
      dotColor: 'bg-green-600'
    },
  };

  const atRiskCount = keywords.filter(k => k.aiOverviewStatus === 'stolen').length;
  const citedCount = keywords.filter(k => k.aiOverviewStatus === 'referenced').length;
  const safeCount = keywords.filter(k => k.aiOverviewStatus === 'safe').length;

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 md:px-4 py-2 text-xs font-bold border transition-all button-press ${
            filter === 'all'
              ? 'bg-black text-white border-black'
              : 'bg-white text-black/60 border-black/10 hover:border-black/30'
          }`}
        >
          All ({keywords.length})
        </button>
        <button
          onClick={() => setFilter('at-risk')}
          className={`px-3 md:px-4 py-2 text-xs font-bold border transition-all button-press ${
            filter === 'at-risk'
              ? 'bg-[#FF4500] text-white border-[#FF4500]'
              : 'bg-white text-black/60 border-black/10 hover:border-[#FF4500]/50'
          }`}
        >
          At Risk ({atRiskCount})
        </button>
        <button
          onClick={() => setFilter('cited')}
          className={`px-3 md:px-4 py-2 text-xs font-bold border transition-all button-press ${
            filter === 'cited'
              ? 'bg-orange-500 text-white border-orange-500'
              : 'bg-white text-black/60 border-black/10 hover:border-orange-300'
          }`}
        >
          Cited ({citedCount})
        </button>
        <button
          onClick={() => setFilter('safe')}
          className={`px-3 md:px-4 py-2 text-xs font-bold border transition-all button-press ${
            filter === 'safe'
              ? 'bg-green-600 text-white border-green-600'
              : 'bg-white text-black/60 border-black/10 hover:border-green-300'
          }`}
        >
          Safe ({safeCount})
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block border-2 border-black/10 bg-white overflow-hidden">
        {/* Header */}
        <div className="bg-black text-white">
          <div className="grid grid-cols-12 gap-4 px-5 py-4">
            <button
              onClick={() => handleSort('keyword')}
              className="col-span-5 text-left text-xs uppercase tracking-wider font-bold flex items-center hover:text-[#FF4500] transition-colors"
            >
              <Search className="w-3 h-3 mr-2 opacity-50" />
              Keyword <SortIcon field="keyword" />
            </button>
            <button
              onClick={() => handleSort('volume')}
              className="col-span-2 text-left text-xs uppercase tracking-wider font-bold flex items-center hover:text-[#FF4500] transition-colors"
            >
              <TrendingUp className="w-3 h-3 mr-2 opacity-50" />
              Volume <SortIcon field="volume" />
            </button>
            <button
              onClick={() => handleSort('position')}
              className="col-span-2 text-left text-xs uppercase tracking-wider font-bold flex items-center hover:text-[#FF4500] transition-colors"
            >
              <Hash className="w-3 h-3 mr-2 opacity-50" />
              Rank <SortIcon field="position" />
            </button>
            <button
              onClick={() => handleSort('status')}
              className="col-span-3 text-left text-xs uppercase tracking-wider font-bold flex items-center hover:text-[#FF4500] transition-colors"
            >
              Status <SortIcon field="status" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="divide-y divide-black/5">
          {sorted.map((kw, index) => {
            const config = statusConfig[kw.aiOverviewStatus];
            const StatusIcon = config.icon;
            return (
              <div
                key={index}
                className={`grid grid-cols-12 gap-4 px-5 py-4 transition-all hover:bg-black/[0.03] group ${
                  kw.aiOverviewStatus === 'stolen' ? 'bg-[#FF4500]/[0.03]' : ''
                }`}
              >
                <div className="col-span-5 text-sm font-medium text-black flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${config.dotColor} flex-shrink-0 group-hover:scale-125 transition-transform`} />
                  <span className="truncate">{kw.keyword}</span>
                </div>
                <div className="col-span-2 text-sm text-black/70 font-mono tabular-nums flex items-center">
                  {kw.searchVolume.toLocaleString()}
                </div>
                <div className="col-span-2 text-sm text-black/70 font-mono tabular-nums flex items-center">
                  <span className="text-black/30">#</span>{kw.position}
                </div>
                <div className="col-span-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold ${config.bg} ${config.color} border ${config.border}`}>
                    <StatusIcon className="w-3 h-3" />
                    {config.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {sorted.length === 0 && (
          <div className="p-12 text-center text-black/40">
            No keywords match this filter.
          </div>
        )}
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-2">
        {/* Mobile Sort Controls */}
        <div className="flex items-center justify-between bg-black text-white px-4 py-3 mb-3">
          <span className="text-xs uppercase tracking-wider font-bold">Sort by:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSort('volume')}
              className={`px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors ${
                sortField === 'volume' ? 'bg-[#FF4500] text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              Volume
            </button>
            <button
              onClick={() => handleSort('position')}
              className={`px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors ${
                sortField === 'position' ? 'bg-[#FF4500] text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              Rank
            </button>
          </div>
        </div>

        {/* Mobile Cards */}
        {sorted.map((kw, index) => {
          const config = statusConfig[kw.aiOverviewStatus];
          const StatusIcon = config.icon;
          return (
            <div
              key={index}
              className={`border-2 ${config.border} ${config.bg} p-4 transition-all hover:shadow-md`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className="text-sm font-bold text-black flex-1 leading-tight">
                  {kw.keyword}
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold ${config.bg} ${config.color} border ${config.border} whitespace-nowrap`}>
                  <StatusIcon className="w-3 h-3" />
                  {config.label}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-black/60">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3 text-black/40" />
                  <span className="font-mono font-bold text-black">{kw.searchVolume.toLocaleString()}</span>
                  <span className="text-black/40">vol</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Hash className="w-3 h-3 text-black/40" />
                  <span className="font-mono font-bold text-black">{kw.position}</span>
                  <span className="text-black/40">rank</span>
                </div>
              </div>
            </div>
          );
        })}

        {sorted.length === 0 && (
          <div className="p-8 text-center text-black/40 border-2 border-black/10 bg-white">
            No keywords match this filter.
          </div>
        )}
      </div>

      {/* Sort hint - desktop only */}
      <div className="hidden md:block mt-3 text-xs text-black/30 text-right">
        Click column headers to sort
      </div>
    </div>
  );
}
